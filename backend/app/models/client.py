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

CLIENT_TABLE = 'MortgageAI_Clients'

def ensure_client_table_exists():
    """
    Checks for the MortgageAI_Clients table in DynamoDB.
    If it doesn't exist, creates it with composite key:
      • PK: user_username (S)
      • SK: name (S)
    Other attributes are schemaless.
    """
    client = dynamodb.meta.client
    print(f">>> Checking for DynamoDB table '{CLIENT_TABLE}'...")
    try:
        resp = client.describe_table(TableName=CLIENT_TABLE)
        status = resp['Table']['TableStatus']
        print(f">>> DynamoDB table '{CLIENT_TABLE}' already exists (status={status}).")
        return
    except client.exceptions.ResourceNotFoundException:
        print(f">>> DynamoDB table '{CLIENT_TABLE}' not found. Creating...")
    try:
        table = dynamodb.create_table(
            TableName=CLIENT_TABLE,
            KeySchema=[
                {'AttributeName': 'user_username', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'id',          'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_username', 'AttributeType': 'S'},
                {'AttributeName': 'id',          'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        table.wait_until_exists()
        print(f">>> DynamoDB table '{CLIENT_TABLE}' created and active.")
    except NoCredentialsError:
        raise RuntimeError("AWS credentials not found; cannot create DynamoDB table.")
    except ClientError as e:
        raise RuntimeError(f"Error creating DynamoDB table '{CLIENT_TABLE}': {e}")



class Client:
    def __init__(self, 
                 name, 
                 user_username,
                 id=None, 
                 credit_score=0, 
                 fico_score=0, 
                 dti_ratio=0.0, 
                 monthly_expenses=0.0, 
                 income_sources=None, 
                 loan_amount_requested=0.0, 
                 loan_term=0, 
                 loan_down_payment=0.0, 
                 loan_interest_preference='fixed', 
                 llm_recommendation='', 
                 phone_number='', 
                 email='', 
                 ssn='',
                 marital_status='SINGLE',):
        self.id = id if id else f"B{str(randint(1000, 9999))}"
        self.name = name
        self.user_username = user_username
        self.phone_number = phone_number
        self.email = email
        self.ssn = ssn
        self.marital_status = marital_status    
        self.credit_score = credit_score
        self.fico_score = fico_score
        self.dti_ratio = dti_ratio
        self.monthly_expenses = monthly_expenses
        self.income_sources = income_sources if income_sources else []
        self.total_income = 0.0  # Initialize total_income
        self.loan_amount_requested = loan_amount_requested
        self.loan_term = loan_term # e.g., 15 years, 30 years
        self.loan_down_payment = loan_down_payment
        self.loan_interest_preference = loan_interest_preference # e.g., 'fixed' or 'variable'
        self.llm_recommendation = llm_recommendation

    def calculate_total_income(self):
        # Update to sum only the income amounts
        self.total_income = sum(Decimal(str(income[1])) for income in self.income_sources)

    def add_income_source(self, source_type, new_income):
        self.income_sources.append([source_type, new_income])
        self.calculate_total_income()
        self.calculate_dti_ratio()

    def calculate_dti_ratio(self):
        # Ensure all calculations use Decimal
        if self.total_income == 0:
            raise ValueError("Total income cannot be zero when calculating DTI ratio.")
        monthly_income = Decimal(str(self.total_income)) / Decimal('12')  # Assuming total_income is annual
        self.dti_ratio = (Decimal(str(self.monthly_expenses)) / monthly_income) * Decimal('100')

    def update_monthly_expenses(self, new_expenses):
        if new_expenses < 0:
            raise ValueError("Monthly expenses cannot be negative.")
        self.monthly_expenses = new_expenses
        self.calculate_dti_ratio()

    def save_to_dynamodb(self):
        table = dynamodb.Table(CLIENT_TABLE)
        try:
            table.put_item(
                Item={
                    'id': self.id,
                    'name': self.name,
                    'user_username': self.user_username,
                    'phone_number': self.phone_number,
                    'email': self.email,
                    'ssn': self.ssn,
                    'marital_status': self.marital_status,
                    'credit_score': self.credit_score,
                    'fico_score': self.fico_score,
                    'dti_ratio': Decimal(str(self.dti_ratio)),  # Convert float to Decimal
                    'monthly_expenses': Decimal(str(self.monthly_expenses)),  # Convert float to Decimal
                    'income_sources': [[source[0], Decimal(str(source[1]))] for source in self.income_sources],  # Convert income amounts to Decimals
                    'total_income': Decimal(str(self.total_income)),  # Save total_income as Decimal
                    'loan_amount_requested': Decimal(str(self.loan_amount_requested)),  # Save as Decimal
                    'loan_term': self.loan_term,  # e.g., 15 years, 30 years
                    'loan_down_payment': Decimal(str(self.loan_down_payment)),  # Save as Decimal
                    'loan_interest_preference': self.loan_interest_preference,  # e.g., 'fixed' or 'variable'
                    'llm_recommendation': self.llm_recommendation
                }
            )
        except ClientError as e:
            print(f"Error saving client to DynamoDB: {e}")

    @staticmethod
    def load_from_dynamodb(id, user_username) -> 'Client':
        table = dynamodb.Table(CLIENT_TABLE)
        try:
            response = table.get_item(Key={'id': id, 'user_username': user_username})
            if 'Item' in response:
                data = response['Item']
                client = Client(
                    id=data['id'],
                    name=data['name'],
                    user_username=data['user_username'],
                    credit_score=data.get('credit_score', 0),
                    fico_score=data.get('fico_score', 0),
                    dti_ratio=float(data.get('dti_ratio', 0.0)),  # Convert Decimal to float
                    monthly_expenses=float(data.get('monthly_expenses', 0.0)),  # Convert Decimal to float
                    income_sources=[[source[0], float(source[1])] for source in data.get('income_sources', [])],  # Convert list of Decimals to floats
                    loan_amount_requested=float(data.get('loan_amount_requested', 0.0)),  # Convert Decimal to float
                    loan_term=data.get('loan_term', 0),  # e.g., 15 years, 30 years
                    loan_down_payment=float(data.get('loan_down_payment', 0.0)),  # Convert Decimal to float
                    loan_interest_preference=data.get('loan_interest_preference', 'fixed'),  # e.g., 'fixed' or 'variable'
                    llm_recommendation=data.get('llm_recommendation', ''),
                    phone_number=data.get('phone_number', ''),
                    email=data.get('email', ''),
                    ssn=data.get('ssn', ''),
                    marital_status=data.get('marital_status', '')
                )
                client.total_income = float(data.get('total_income', 0.0))  # Load total_income
                return client
            return None
        except ClientError as e:
            print(f"Error loading client from DynamoDB: {e}")
            return None

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_username': self.user_username,
            'credit_score': self.credit_score,
            'fico_score': self.fico_score,
            'dti_ratio': float(self.dti_ratio),  # Convert Decimal to float for JSON serialization
            'monthly_expenses': float(self.monthly_expenses),  # Convert Decimal to float
            'income_sources': [[source[0], float(source[1])] for source in self.income_sources],
            'total_income': float(self.total_income),  # Include total_income
            'loan_amount_requested': self.loan_amount_requested,
            'loan_term': self.loan_term,
            'loan_down_payment': self.loan_down_payment,
            'loan_interest_preference': self.loan_interest_preference,
            'llm_recommendation': self.llm_recommendation,
            'phone_number': self.phone_number,
            'email': self.email,
            'ssn': self.ssn,
            'marital_status': self.marital_status
        }