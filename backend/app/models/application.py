from datetime import datetime
import os
import csv
from random import randint
from typing import Optional
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv
from app.models.client import Client

load_dotenv()

dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)
APPLICATION_TABLE = 'MortgageAI_Applications'

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
                 id=None, 
                 loanAmount=0,
                 loanType="CONVENTIONAL",
                 loanPurpose="PURCHASE",
                 propertyPrice=0,
                 propertyAddress="",    
                 propertyType="SINGLE_FAMILY",
                 occupancyType="PRIMARY",
                 status="INIT", 
                 rate="N/A", 
                 ltv="0%",
                 dti="0%",
                 borrowers=[], 
                 last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                 created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")):
        self.id = id or f"L{str(randint(1000, 9999))}"
        self.loanType = loanType
        self.loanAmount = loanAmount
        self.loanPurpose = loanPurpose
        self.propertyPrice = propertyPrice
        self.propertyAddress = propertyAddress
        self.propertyType = propertyType
        self.occupancyType = occupancyType
        self.status = status

        self.rate = rate
        self.ltv = ltv
        self.dti = dti

        self.last_updated = last_updated
        self.created_at = created_at
        self.borrowers = borrowers

    def add_borrower(self, borrower_id):
        self.borrowers.append(borrower_id)

    def save_to_dynamodb(self):
        table = dynamodb.Table(APPLICATION_TABLE)
        try:
            table.put_item(
                Item={
                    'id': self.id,
                    'loanType': self.loanType,
                    'loanAmount': self.loanAmount,
                    'loanPurpose': self.loanPurpose,
                    'propertyPrice': self.propertyPrice,
                    'propertyAddress': self.propertyAddress,
                    'propertyType': self.propertyType,
                    'occupancyType': self.occupancyType,
                    'ltv': self.ltv,
                    'dti': self.dti,
                    'rate': self.rate,
                    'status': self.status,
                    'last_updated': self.last_updated,
                    'created_at': self.created_at,
                    'borrowers': self.borrowers
                }
            )
        except ClientError as e:
            print(f"Error saving application to DynamoDB: {e}")

    def toJSON(self) -> dict:
        """
        Convert the Application instance to a JSON-compatible dictionary.
        """
        return {
            'id': self.id,
            'loanType': self.loanType,
            'loanAmount': self.loanAmount,
            'loanPurpose': self.loanPurpose,
            'propertyPrice': self.propertyPrice,
            'propertyAddress': self.propertyAddress,
            'propertyType': self.propertyType,
            'occupancyType': self.occupancyType,
            'ltv': self.ltv,
            'dti': self.dti,
            'rate': self.rate,
            'status': self.status,
            'last_updated': self.last_updated,
            'created_at': self.created_at,
            'borrowers': self.borrowers
        }

    @staticmethod
    def load_from_dynamodb(id) -> 'Application':
        table = dynamodb.Table(APPLICATION_TABLE)
        try:
            response = table.get_item(Key={'id': id})
            if 'Item' in response:
                data = response['Item']
                return Application(
                    id=data['id'],
                    loanType=data['loanType'],
                    loanAmount=data['loanAmount'],
                    loanPurpose=data['loanPurpose'],
                    propertyPrice=data['propertyPrice'],
                    propertyAddress=data['propertyAddress'],
                    propertyType=data['propertyType'],
                    occupancyType=data['occupancyType'],
                    ltv=data['ltv'],
                    dti=data['dti'],
                    rate=data['rate'],
                    status=data['status'],
                    last_updated=data['last_updated'],
                    created_at=data['created_at'],
                    borrowers=data['borrowers'])
            return None
        except ClientError as e:
            print(f"Error loading application from DynamoDB: {e}")
            return None
        
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
                    loanType=item['loanType'],
                    loanAmount=item['loanAmount'],
                    loanPurpose=item['loanPurpose'],
                    propertyPrice=item['propertyPrice'],
                    propertyAddress=item['propertyAddress'],
                    propertyType=item['propertyType'],
                    occupancyType=item['occupancyType'],
                    ltv=item['ltv'],
                    dti=item['dti'],
                    rate=item['rate'],
                    status=item['status'],
                    last_updated=item['last_updated'],
                    created_at=item['created_at'],
                    borrowers=item['borrowers'])
                for item in items
            ]
        except ClientError as e:
            print(f"Error scanning applications table: {e}")
            return []
