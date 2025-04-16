import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    UNSTRUCTURED_API_KEY = os.getenv("UNSTRUCTURED_API_KEY")
    UNSTRUCTURED_API_URL = os.getenv("UNSTRUCTURED_API_URL")
    ASTRA_DB_API_ENDPOINT = os.getenv("ASTRA_DB_API_ENDPOINT")
    ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
