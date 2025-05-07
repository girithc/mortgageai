import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

load_dotenv()

class Config:
    UNSTRUCTURED_API_KEY = os.getenv("UNSTRUCTURED_API_KEY")
    UNSTRUCTURED_API_URL = os.getenv("UNSTRUCTURED_API_URL")
    ASTRA_DB_API_ENDPOINT = os.getenv("ASTRA_DB_API_ENDPOINT")
    ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
    OPENAI_API_KEY = None

    @staticmethod
    def fetch_openai_api_key():
        try:
            dynamodb = boto3.resource(
                'dynamodb',
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION")
            )

            table = dynamodb.Table('KEY')
            response = table.get_item(Key={'name': 'OPENAI_API_KEY'})

            if 'Item' in response:
                Config.OPENAI_API_KEY = response['Item']['value']
            else:
                raise KeyError("OPENAI_API_KEY not found in DynamoDB table.")
        except (NoCredentialsError, PartialCredentialsError) as e:
            raise RuntimeError("AWS credentials are not properly configured.") from e
        except Exception as e:
            raise RuntimeError("An error occurred while fetching the OPENAI_API_KEY.") from e

# Fetch the OPENAI_API_KEY and store it in the Config class
Config.fetch_openai_api_key()
