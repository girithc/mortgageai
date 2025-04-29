# Moved the Client class to this file from user.py
import os
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
                {'AttributeName': 'name',          'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_username', 'AttributeType': 'S'},
                {'AttributeName': 'name',          'AttributeType': 'S'}
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
    def __init__(self, name, user_username, credit_score=0, fico_score=0, dti_ratio=0.0, monthly_expenses=0.0, income_sources=None):
        self.name = name
        self.user_username = user_username
        self.credit_score = credit_score
        self.fico_score = fico_score
        self.dti_ratio = dti_ratio
        self.monthly_expenses = monthly_expenses
        self.income_sources = income_sources if income_sources else [0.0] * 5
        self.total_income = 0.0  # Initialize total_income

    def calculate_total_income(self):
        # Convert all income sources to Decimal before summing
        self.total_income = sum(Decimal(str(income)) for income in self.income_sources)

    def update_income_source(self, index, new_income):
        if not (0 <= index < 5):
            raise IndexError("Index must be between 0 and 4.")
        self.income_sources[index] = new_income
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
                    'name': self.name,
                    'user_username': self.user_username,
                    'credit_score': self.credit_score,
                    'fico_score': self.fico_score,
                    'dti_ratio': Decimal(str(self.dti_ratio)),  # Convert float to Decimal
                    'monthly_expenses': Decimal(str(self.monthly_expenses)),  # Convert float to Decimal
                    'income_sources': [Decimal(str(income)) for income in self.income_sources],  # Convert list of floats to Decimals
                    'total_income': Decimal(str(self.total_income))  # Save total_income as Decimal
                }
            )
        except ClientError as e:
            print(f"Error saving client to DynamoDB: {e}")

    @staticmethod
    def load_from_dynamodb(name, user_username) -> 'Client':
        table = dynamodb.Table(CLIENT_TABLE)
        try:
            response = table.get_item(Key={'name': name, 'user_username': user_username})
            if 'Item' in response:
                data = response['Item']
                client = Client(
                    data['name'],
                    data['user_username'],
                    data.get('credit_score', 0),
                    data.get('fico_score', 0),
                    float(data.get('dti_ratio', 0.0)),  # Convert Decimal to float
                    float(data.get('monthly_expenses', 0.0)),  # Convert Decimal to float
                    [float(income) for income in data.get('income_sources', [0.0] * 5)]  # Convert list of Decimals to floats
                )
                client.total_income = float(data.get('total_income', 0.0))  # Load total_income
                return client
            return None
        except ClientError as e:
            print(f"Error loading client from DynamoDB: {e}")
            return None

    def to_dict(self):
        return {
            'name': self.name,
            'user_username': self.user_username,
            'credit_score': self.credit_score,
            'fico_score': self.fico_score,
            'dti_ratio': float(self.dti_ratio),  # Convert Decimal to float for JSON serialization
            'monthly_expenses': float(self.monthly_expenses),  # Convert Decimal to float
            'income_sources': [float(income) for income in self.income_sources],  # Convert list of Decimals to floats
            'total_income': float(self.total_income)  # Include total_income
        }