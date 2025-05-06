from datetime import datetime
import os
from random import randint
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv
from decimal import Decimal

load_dotenv()

dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)
APPLICATION_TABLE = 'MortgageAI_Applications'
BORROWER_TABLE = 'MortgageAI_Borrowers'

def ensure_application_table_exists():
    """
    Checks for the MortgageAI_Applications table in DynamoDB.
    If it doesn't exist, creates it with:
      • PK: username (S)
    Other attributes (name, client_names) are schemaless and don't need to be declared.
    """
    client = dynamodb.meta.client
    print(f">>> Checking for DynamoDB table '{APPLICATION_TABLE}'...")

    try:
        resp = client.describe_table(TableName=APPLICATION_TABLE)
        status = resp["Table"]["TableStatus"]
        print(f">>> DynamoDB table '{APPLICATION_TABLE}' already exists (status={status}).")
        return
    except client.exceptions.ResourceNotFoundException:
        print(f">>> DynamoDB table '{APPLICATION_TABLE}' not found. Creating...")

    try:
        table = dynamodb.create_table(
            TableName=APPLICATION_TABLE,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        table.wait_until_exists()
        print(f">>> DynamoDB table '{APPLICATION_TABLE}' created and active.")
    except NoCredentialsError:
        raise RuntimeError("AWS credentials not found; cannot create DynamoDB table.")
    except ClientError as e:
        raise RuntimeError(f"Error creating DynamoDB table '{APPLICATION_TABLE}': {e}")

class Application:
    def __init__(self, 
                 id = None,
                 loan_amount=0.0,
                 loan_term=0,
                 loan_down_payment=0.0,
                 loan_interest_preference="",
                 loan_type="CONVENTIONAL",
                 loan_purpose="PURCHASE",
                 property_price=0.0,
                 property_address="",
                 property_type="SINGLE_FAMILY",
                 occupancy_type="PRIMARY",
                 rate=0.0,
                 ltv=0.0,
                 dti=0.0,
                 primary_borrower_id="", 
                 co_borrowers_id=None,  
                 llm_recommendation="",
                 status="INIT",
                 total_income=0.0,
                 total_monthly_expenses=0.0,
                 last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                 created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")):
        if not id:
            # Generate a unique ID if not provided
            table = dynamodb.Table(APPLICATION_TABLE)
            while True:
                generated_id = f"B{str(randint(10000, 99999))}"
                response = table.get_item(Key={'id': generated_id})
                if 'Item' not in response:  # Ensure the ID doesn't already exist
                    self.id = generated_id
                    break
        else:
            self.id = id
        self.loan_type = loan_type
        self.loan_amount = loan_amount
        self.loan_purpose = loan_purpose
        
        self.property_price = property_price
        self.property_address = property_address
        self.property_type = property_type
        self.occupancy_type = occupancy_type
        self.status = status

        self.rate = rate
        self.ltv = ltv if ltv != 0.0 else (loan_amount / property_price) * 100 if property_price > 0 else 0.0
        self.dti = dti
        self.status = status

        self.primary_borrower_id = primary_borrower_id  # Initialize new field
        self.co_borrowers_id = co_borrowers_id if co_borrowers_id else []  # Initialize new field

        self.loan_term = loan_term
        self.loan_down_payment = loan_down_payment
        self.loan_interest_preference = loan_interest_preference
        self.llm_recommendation = llm_recommendation

        self.total_income = total_income
        self.total_monthly_expenses = total_monthly_expenses

        self.last_updated = last_updated
        self.created_at = created_at

    def add_co_borrower(self, co_borrower_id):
        self.co_borrowers_id.append(co_borrower_id)

    def remove_co_borrower(self, co_borrower_id):
        if co_borrower_id in self.co_borrowers_id:
            self.co_borrowers_id.remove(co_borrower_id)
        else:
            raise ValueError(f"Co-borrower ID {co_borrower_id} not found in the list.")
        
    def calculate_total_monthly_expenses(self, monthly_expenses: list):
        self.total_monthly_expenses = sum(monthly_expenses)

    def calculate_total_income(self, incomes: list):
        self.total_income = sum(incomes)

    def calculate_dti(self):
        """
        Calculate the Debt-to-Income (DTI) ratio.
        DTI = (Total Monthly Debt Payments / Total Monthly Income) * 100
        """
        if self.total_income == 0:
            raise ValueError("Total income cannot be zero when calculating DTI.")
        # Adjust for monthly expenses and yearly income
        self.dti = ((self.total_monthly_expenses * 12) / self.total_income) * 100

    def update_income_and_dti(self):
        """
        Update the total income and total monthly expenses by fetching data from DynamoDB
        for the primary borrower and co-borrowers, then recalculate the DTI.
        """
        table = dynamodb.Table(BORROWER_TABLE)

        # Fetch primary borrower info
        try:
            primary_borrower_response = table.get_item(Key={'id': self.primary_borrower_id})
            if 'Item' not in primary_borrower_response:
                raise ValueError(f"Primary borrower with ID {self.primary_borrower_id} not found.")
            primary_borrower_data = primary_borrower_response['Item']
        except ClientError as e:
            raise RuntimeError(f"Error fetching primary borrower from DynamoDB: {e}")

        # Initialize total income and expenses with primary borrower data
        total_income = float(primary_borrower_data.get('total_income', 0.0))
        total_monthly_expenses = float(primary_borrower_data.get('monthly_expenses'))

        # Fetch co-borrowers info and aggregate their income and expenses
        for co_borrower_id in self.co_borrowers_id:
            try:
                co_borrower_response = table.get_item(Key={'id': co_borrower_id})
                if 'Item' not in co_borrower_response:
                    raise ValueError(f"Co-borrower with ID {co_borrower_id} not found.")
                co_borrower_data = co_borrower_response['Item']

                total_income += float(co_borrower_data.get('total_income'))
                total_monthly_expenses += float(co_borrower_data.get('monthly_expenses'))
            except ClientError as e:
                raise RuntimeError(f"Error fetching co-borrower with ID {co_borrower_id} from DynamoDB: {e}")

        # Update the application instance with the aggregated values
        self.total_income = total_income
        self.total_monthly_expenses = total_monthly_expenses

        # Recalculate DTI
        self.calculate_dti()

    def save_to_dynamodb(self):
        table = dynamodb.Table(APPLICATION_TABLE)
        try:
            table.put_item(
                Item={
                    'id': self.id,
                    'loan_type': self.loan_type,
                    'loan_amount': Decimal(str(self.loan_amount)),
                    'loan_purpose': self.loan_purpose,
                    'property_price': Decimal(str(self.property_price)),
                    'property_address': self.property_address,
                    'property_type': self.property_type,
                    'occupancy_type': self.occupancy_type,
                    'ltv': Decimal(str(self.ltv)),
                    'dti': Decimal(str(self.dti)),
                    'rate': Decimal(str(self.rate)),  # Convert to Decimal for DynamoDB
                    'status': self.status,
                    'primary_borrower_id': self.primary_borrower_id,  # Save new field
                    'co_borrowers_id': self.co_borrowers_id,  # Save new field
                    'loan_term': self.loan_term,
                    'loan_down_payment': Decimal(str(self.loan_down_payment)),
                    'loan_interest_preference': self.loan_interest_preference,
                    'llm_recommendation': self.llm_recommendation,
                    'total_income': Decimal(str(self.total_income)),
                    'total_monthly_expenses': Decimal(str(self.total_monthly_expenses)),
                    'last_updated': self.last_updated,
                    'created_at': self.created_at
                }
            )
        except ClientError as e:
            print(f"Error saving application to DynamoDB: {e}")

    @staticmethod
    def load_from_dynamodb(id) -> 'Application':
        table = dynamodb.Table(APPLICATION_TABLE)
        try:
            response = table.get_item(Key={'id': id})
            if 'Item' in response:
                data = response['Item']
                return Application(
                    id=data['id'],
                    loan_type=data['loan_type'],
                    loan_amount=float(data['loan_amount']),
                    loan_purpose=data['loan_purpose'],
                    property_price=float(data['property_price']),
                    property_address=data['property_address'],
                    property_type=data['property_type'],
                    occupancy_type=data['occupancy_type'],
                    ltv=float(data['ltv']),
                    dti=float(data['dti']),
                    rate=float(data['rate']),  # Convert to float
                    status=data['status'],
                    primary_borrower_id=data.get('primary_borrower_id', ""),  # Load new field
                    co_borrowers_id=data.get('co_borrowers_id', []),  # Load new field
                    loan_term=data.get('loan_term'),
                    loan_down_payment=float(data.get('loan_down_payment')),
                    loan_interest_preference=data.get('loan_interest_preference'),
                    llm_recommendation=data.get('llm_recommendation'),
                    total_income=float(data.get('total_income', 0.0)),
                    total_monthly_expenses=float(data.get('total_monthly_expenses', 0.0)),
                    last_updated=data['last_updated'],
                    created_at=data['created_at']
                )
            return None
        except ClientError as e:
            print(f"Error loading application from DynamoDB: {e}")
            return None

    # Patch for application.py
# Update the get_all_applications method to use the correct field names

@staticmethod
def get_all_applications() -> list['Application']:
    """
    Scan the entire APPLICATION_TABLE and return a list of Application instances.
    """
    table = dynamodb.Table(APPLICATION_TABLE)
    try:
        resp = table.scan()
        items = resp.get('Items', [])
        return [
            Application(
                id=item['id'],
                loan_type=item.get('loan_type', item.get('loanType', 'CONVENTIONAL')),  # Handle both field names
                loan_amount=float(item.get('loan_amount', item.get('loanAmount', 0.0))),
                loan_purpose=item.get('loan_purpose', item.get('loanPurpose', 'PURCHASE')),
                property_price=float(item.get('property_price', item.get('propertyPrice', 0.0))),
                property_address=item.get('property_address', item.get('propertyAddress', '')),
                property_type=item.get('property_type', item.get('propertyType', 'SINGLE_FAMILY')),
                occupancy_type=item.get('occupancy_type', item.get('occupancyType', 'PRIMARY')),
                ltv=float(item.get('ltv', 0.0)),
                dti=float(item.get('dti', 0.0)),
                rate=float(item.get('rate', 0.0)),
                status=item.get('status', 'INIT'),
                primary_borrower_id=item.get('primary_borrower_id', ''),
                co_borrowers_id=item.get('co_borrowers_id', []),
                loan_term=item.get('loan_term', 30),
                loan_down_payment=float(item.get('loan_down_payment', 0.0)),
                loan_interest_preference=item.get('loan_interest_preference', 'FIXED'),
                llm_recommendation=item.get('llm_recommendation', ''),
                total_income=float(item.get('total_income', 0.0)),
                total_monthly_expenses=float(item.get('total_monthly_expenses', 0.0)),
                last_updated=item.get('last_updated', datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                created_at=item.get('created_at', datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            )
            for item in items
        ]
    except ClientError as e:
        print(f"Error scanning applications table: {e}")
        return []

    @staticmethod
    def get_application_by_borrower_id(borrower_id):
        """
        Retrieve an application that has the given borrower_id as either the primary_borrower_id
        or in the co_borrowers_id list.
        """
        applications = Application.get_all_applications()
        for application in applications:
            if application.primary_borrower_id == borrower_id or borrower_id in application.co_borrowers_id:
                return application
        return None

    def to_dict(self):
        """
        Convert the Application instance to a dictionary for JSON serialization.
        """
        return {
            'id': self.id,
            'loan_type': self.loan_type,
            'loan_amount': self.loan_amount,
            'loan_purpose': self.loan_purpose,
            'property_price': self.property_price,
            'property_address': self.property_address,
            'property_type': self.property_type,
            'occupancy_type': self.occupancy_type,
            'status': self.status,
            'rate': self.rate,
            'ltv': self.ltv,
            'dti': self.dti,
            'primary_borrower_id': self.primary_borrower_id,
            'co_borrowers_id': self.co_borrowers_id,
            'loan_term': self.loan_term,
            'loan_down_payment': self.loan_down_payment,
            'loan_interest_preference': self.loan_interest_preference,
            'llm_recommendation': self.llm_recommendation,
            'total_income': self.total_income,
            'total_monthly_expenses': self.total_monthly_expenses,
            'last_updated': self.last_updated,
            'created_at': self.created_at
        }
