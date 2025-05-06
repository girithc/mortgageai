# Moved the Client class to this file from user.py
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

BORROWER_TABLE = 'MortgageAI_Borrowers'

def ensure_borrower_table_exists():
    """
    Checks for the MortgageAI_Borrowers table in DynamoDB.
    If it doesn't exist, creates it with composite key:
      • PK: user_username (S)
      • SK: name (S)
    Other attributes are schemaless.
    """
    client = dynamodb.meta.client  # Corrected from dynamodb.meta.borrower
    print(f">>> Checking for DynamoDB table '{BORROWER_TABLE}'...")
    try:
        resp = client.describe_table(TableName=BORROWER_TABLE)
        status = resp['Table']['TableStatus']
        print(f">>> DynamoDB table '{BORROWER_TABLE}' already exists (status={status}).")
        return
    except client.exceptions.ResourceNotFoundException:
        print(f">>> DynamoDB table '{BORROWER_TABLE}' not found. Creating...")
    try:
        table = dynamodb.create_table(
            TableName=BORROWER_TABLE,
            KeySchema=[
                {'AttributeName': 'id', 'KeyType': 'HASH'}  # Partition key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'S'}  # String type for the partition key
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        table.wait_until_exists()
        print(f">>> DynamoDB table '{BORROWER_TABLE}' created and active.")
    except NoCredentialsError:
        raise RuntimeError("AWS credentials not found; cannot create DynamoDB table.")
    except ClientError as e:
        raise RuntimeError(f"Error creating DynamoDB table '{BORROWER_TABLE}': {e}")



class Borrower:
    def __init__(self, 
                 id = None,
                 name = '', 
                 phone_number='', 
                 email='', 
                 ssn='',
                 credit_score=0, 
                 fico_score=0, 
                 dti_ratio=0.0, 
                 monthly_expenses=0.0, 
                 income_sources=None, 
                 marital_status='SINGLE',
                 total_income=0.0):
        if not id:
            table = dynamodb.Table(BORROWER_TABLE)
            while True:
                generated_id = f"B{str(randint(10000, 99999))}"
                response = table.get_item(Key={'id': generated_id})
                if 'Item' not in response:  # Ensure the ID doesn't already exist
                    self.id = generated_id
                    break
        else:
            self.id = id
        self.name = name
        self.phone_number = phone_number
        self.email = email
        self.ssn = ssn
        self.marital_status = marital_status    
        self.credit_score = credit_score
        self.fico_score = fico_score
        self.dti_ratio = dti_ratio
        self.monthly_expenses = monthly_expenses
        self.income_sources = income_sources if income_sources else []
        self.total_income = total_income if total_income else 0.0

    def calculate_income(self):
        # Update to sum only the income amounts
        self.total_income = sum(Decimal(str(income[1])) for income in self.income_sources)

    def update_income_sources(self, new_income_sources):
        self.income_sources = new_income_sources
        self.calculate_income()
        self.calculate_dti_ratio()

    def add_income_source(self, source_name, amount):
        self.income_sources.append([source_name, amount])
        self.calculate_income()
        self.calculate_dti_ratio()

    def calculate_dti_ratio(self):
        # Ensure all calculations use Decimal
        if self.total_income == 0:
            raise ValueError("Total income cannot be zero when calculating DTI ratio.")
        monthly_income = Decimal(str(self.total_income)) / Decimal('12')  # Assuming total_income is annual
        self.dti_ratio = (Decimal(str(self.monthly_expenses)) / monthly_income) * Decimal('100')

    def update_monthly_expenses(self, new_expenses):
        self.monthly_expenses = new_expenses
        self.calculate_dti_ratio()

    def save_to_dynamodb(self):
        table = dynamodb.Table(BORROWER_TABLE)
        try:
            table.put_item(
                Item={
                    'id': self.id,
                    'name': self.name,
                    'phone_number': self.phone_number,
                    'email': self.email,
                    'ssn': self.ssn,
                    'marital_status': self.marital_status,
                    'credit_score': self.credit_score,
                    'fico_score': self.fico_score,
                    'dti_ratio': Decimal(str(self.dti_ratio)),  # Convert float to Decimal
                    'monthly_expenses': Decimal(str(self.monthly_expenses)),  # Convert float to Decimal
                    'income_sources': [[source[0], Decimal(str(source[1]))] for source in self.income_sources],  # Convert income amounts to Decimals
                    'total_income': Decimal(str(self.total_income))  # Save total_income as Decimal
                }
            )
        except ClientError as e:
            print(f"Error saving borrower to DynamoDB: {e}")

    @staticmethod
    def load_from_dynamodb(id) -> 'Borrower':
        table = dynamodb.Table(BORROWER_TABLE)
        try:
            response = table.get_item(Key={'id': id})
            if 'Item' in response:
                data = response['Item']
                borrower = Borrower(
                    id=data['id'],
                    name=data['name'],
                    credit_score=data.get('credit_score', 0),
                    fico_score=data.get('fico_score', 0),
                    dti_ratio=float(data.get('dti_ratio', 0.0)),  # Convert Decimal to float
                    monthly_expenses=float(data.get('monthly_expenses', 0.0)),  # Convert Decimal to float
                    income_sources=[[source[0], float(source[1])] for source in data.get('income_sources', [])],  # Convert list of Decimals to floats
                    phone_number=data.get('phone_number', ''),
                    email=data.get('email', ''),
                    ssn=data.get('ssn', ''),
                    marital_status=data.get('marital_status', '')
                )
                borrower.total_income = float(data.get('total_income', 0.0))  # Load total_income
                return borrower
            return None
        except ClientError as e:
            print(f"Error loading borrower from DynamoDB: {e}")
            return None

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'credit_score': self.credit_score,
            'fico_score': self.fico_score,
            'dti_ratio': float(self.dti_ratio),  # Convert Decimal to float for JSON serialization
            'monthly_expenses': float(self.monthly_expenses),  # Convert Decimal to float
            'income_sources': [[source[0], float(source[1])] for source in self.income_sources],
            'total_income': float(self.total_income),  # Include total_income
            'phone_number': self.phone_number,
            'email': self.email,
            'ssn': self.ssn,
            'marital_status': self.marital_status
        }