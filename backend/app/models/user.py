import os
import csv
import boto3
from botocore.exceptions import ClientError
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
