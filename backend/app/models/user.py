import os
import csv
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
USER_TABLE = 'MortgageAI_Users'

def ensure_user_table_exists():
    """
    Checks for the MortgageAI_Users table in DynamoDB.
    If it doesn't exist, creates it with:
      • PK: username (S)
    Other attributes (name, client_names) are schemaless and don't need to be declared.
    """
    client = dynamodb.meta.client
    print(f">>> Checking for DynamoDB table '{USER_TABLE}'...")

    try:
        resp = client.describe_table(TableName=USER_TABLE)
        status = resp["Table"]["TableStatus"]
        print(f">>> DynamoDB table '{USER_TABLE}' already exists (status={status}).")
        return
    except client.exceptions.ResourceNotFoundException:
        print(f">>> DynamoDB table '{USER_TABLE}' not found. Creating...")

    try:
        table = dynamodb.create_table(
            TableName=USER_TABLE,
            KeySchema=[{"AttributeName": "username", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "username", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        table.wait_until_exists()
        print(f">>> DynamoDB table '{USER_TABLE}' created and active.")
    except NoCredentialsError:
        raise RuntimeError("AWS credentials not found; cannot create DynamoDB table.")
    except ClientError as e:
        raise RuntimeError(f"Error creating DynamoDB table '{USER_TABLE}': {e}")

class User:
    def __init__(self, username, name, client_names=None):
        self.username = username
        self.name = name
        self.client_names = client_names if client_names else []

    def add_client(self, client_name):
        self.client_names.append(client_name)

    def save_to_dynamodb(self):
        table = dynamodb.Table(USER_TABLE)
        try:
            table.put_item(
                Item={
                    'username': self.username,
                    'name': self.name,
                    'client_names': self.client_names
                }
            )
        except ClientError as e:
            print(f"Error saving user to DynamoDB: {e}")

    @staticmethod
    def load_from_dynamodb(username) -> 'User':
        table = dynamodb.Table(USER_TABLE)
        try:
            response = table.get_item(Key={'username': username})
            if 'Item' in response:
                data = response['Item']
                return User(data['username'], data['name'], data.get('client_names', []))
            return None
        except ClientError as e:
            print(f"Error loading user from DynamoDB: {e}")
            return None
        
    @staticmethod
    def get_all_users() -> list['User']:
        """
        Scan the entire USER_TABLE and return a list of User instances.
        """
        table = dynamodb.Table(USER_TABLE)
        try:
            resp = table.scan()
            items = resp.get('Items', [])
            return [
                User(
                    username=item['username'],
                    name=item['name'],
                    client_names=item.get('client_names', [])
                )
                for item in items
            ]
        except ClientError as e:
            print(f"Error scanning users table: {e}")
            return []
