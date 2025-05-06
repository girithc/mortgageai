import requests
import json
from flask import jsonify

def extract_readable_text(response_text: str) -> str:
    try:
        # Parse the string into a dictionary
        response_dict = json.loads(response_text)

        # Navigate into the nested structure
        text = (
            response_dict["outputs"][0]  # first item in outputs
            ["outputs"][0]               # first inner output
            ["results"]["message"]["text"]
        )

        # Optionally, clean up \n or convert to HTML if needed
        return text.strip()

    except (KeyError, IndexError, json.JSONDecodeError) as e:
        return f"Error extracting message: {e}"

def get_rate_sheets_response(question: str) -> str:
    # The complete API endpoint URL for this flow
    url = f"https://api.langflow.astra.datastax.com/lf/c3890dd0-1752-4e3e-b307-bf65a9be05ba/api/v1/run/d19044c0-94d8-44b8-9bef-9309849d15a8"  

    # Request payload configuration
    payload = {
        "input_value": question,  # The input value to be processed by the flow
        "output_type": "chat",  # Specifies the expected output format
        "input_type": "chat"  # Specifies the input format
    }

    # Request headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer AstraCS:QklbsLSpkxqpruAALpCxyTDg:5b07b80b0c6ea3c9db03f1bd864be60d9801833e8471e0ee2d25151368fd0470"  # Authentication key from environment variable'}
    }

    # Send API request
    response = requests.request("POST", url, json=payload, headers=headers)
    response.raise_for_status()  # Raise exception for bad status codes

    parsed = json.loads(response.text)
    markdown_text = parsed["outputs"][0]["outputs"][0]["results"]["message"]["text"]

    return markdown_text
        