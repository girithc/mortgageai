# MortgageAI Backend

## 🚀 Run Instructions

### 1. Activate the Virtual Environment

`source venv/bin/activate`

### 2. Install Dependencies
`pip install -r requirements.txt`

### 2a. Add AWS access key for local testing
`nano .env`
- Paste AWS access key to `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 3. Run the Flask App
`flask run`

### 4. Access the API
http://127.0.0.1:5000/{path}

## Testing API Samples (with Postman)

### 1. Upload unstructured file to AstraDB
Endpoint Info:
- Method: POST
- URL: http://127.0.0.1:5000/file/upload?collection_name=my_collection
- Query Parameter:
    - collection_name={insert_collection_name}

Request Body:
- Select Body tab.
- Choose form-data.
- Add a Key-Value pair:
    - Key: file (Make sure the checkbox is checked!)
    - Type: File (select file type from the dropdown)
    - Value: Select the file from your local machine (e.g., file.pdf)

Sample Response (200 OK):
```
{
    "message": "{N} documents uploaded to {collection_name}"
}
```

### 2. Query a Langchain-backed LLM using data stored in a collection
Endpoint Info:
- Method: POST
- URL: http://127.0.0.1:5000/llm/query

Request Body:
- Select Body tab.
- Choose raw
- Select JSON as the format from the dropdown.
- Use the following JSON body:
```
{
  "question": "{Insert question here}",
  "collection_name": "{insert_collection_name}"
}
```

Sample Response (200 OK):
```
{
  "answer": "{LLM generated answer here}"
}
```

## Some relevant API endpoints for typical workflow
Read `app/routes.py` for implementation details.

### 1. Create new user to store in database
`/user/create`
- **Method**: POST
- **Description**: Creates a new user in the database.

### 2. Add a new client to user
`/user/client/add`
- **Method**: POST
- **Description**: Adds a new client to an existing user.

### 3. Update a client's loan application details
`/user/client/update-loan-details`
- **Method**: POST
- **Description**: Updates a client's loan application details such as loan amount requested, loan term, down payment, and interest preference.

### 4. Automatically update client's income via file upload (using LLM)
`/user/client/read-income`
- **Method**: POST
- **Description**: Updates a client's income details by extracting information from an uploaded file.

### 5. Automatically update client's credit score, fico score, expenses via file upload (using LLM)
`/user/client/read-credit-report`
- **Method**: POST
- **Description**: Updates a client's credit score, FICO score, and expenses by extracting information from an uploaded file.

### 6. Finally, get mortgage loan recommendation for a client (using LLM)
`/user/client/new-recommendation`
- **Method**: GET
- **Description**: Provides a mortgage loan recommendation for a client based on their financial details.
