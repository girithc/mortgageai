# MortgageAI Backend

## 🚀 Run Instructions

### 1. Activate the Virtual Environment

`source venv/bin/activate`

### 2. Install Dependencies
`pip install -r requirements.txt`

### 2a. Add OpenAI API Key
`nano .env`
- Paste OpenAI API key to `OPENAI_API_KEY`

### 3. Run the Flask App
`flask run`

### 4. Access the API
http://127.0.0.1:5000/{path}

## Testing API (with Postman)

### 1. Upload unstructured file to AstraDB
Endpoint Info:
- Method: POST
- URL: http://127.0.0.1:5000/file/upload?collection_name=my_collection
- Query Parameter:
    - collection_name=my_collection

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
  "collection_name": "my_collection"
}
```

Sample Response (200 OK):
```
{
  "answer": "{LLM generated answer here}"
}
```