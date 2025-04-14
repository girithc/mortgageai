import os
from astrapy import DataAPIClient, Database
from config import Config

def connect_to_database() -> Database:
    """
    Connects to a DataStax Astra database.
    This function retrieves the database endpoint and application token from the
    environment variables `ASTRA_DB_API_ENDPOINT` and `ASTRA_DB_APPLICATION_TOKEN`.

    Returns:
        Database: An instance of the connected database.

    Raises:
        RuntimeError: If the environment variables `ASTRA_DB_API_ENDPOINT` or
        `ASTRA_DB_APPLICATION_TOKEN` are not defined.
    """
    endpoint = Config.ASTRA_DB_API_ENDPOINT
    token = Config.ASTRA_DB_APPLICATION_TOKEN

    if not token or not endpoint:
        raise RuntimeError(
            "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined"
        )

    # Create an instance of the `DataAPIClient` class with your token.
    client = DataAPIClient(token)

    # Get the database specified by your endpoint.
    database = client.get_database(endpoint)

    print(f"Connected to database {database.info().name}")

    return database
