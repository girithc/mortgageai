# API Endpoint Documentation for Flask App

This document outlines all available API endpoints, their request parameters, and the expected responses.

---

## **1. Home Page**
**GET /**
- **Description**: Renders a dynamic HTML page.
- **Response**: HTML page.

---

## **2. Upload File**
**POST /file/upload**
- **Parameters (form-data)**:
  - `file`: PDF file to upload (required)
  - `collection_name`: Name of the DB collection (required, query param)
- **Response**:
```json
{ "message": "<upload result message>" }
```

---

## **3. Classify Income File**
**POST /file/income/classify**
- **Parameters (form-data)**:
  - `file`: PDF income document (required)
- **Response**:
```json
{
  "document_type": "<type>",
  "yearly_income": <amount>
}
```

---

## **4. Query LLM**
**POST /llm/query**
- **Body (JSON)**:
```json
{
  "question": "<your question>",
  "collection_name": "<collection>"
}
```
- **Response**:
```json
{ "answer": "<LLM response>" }
```

---

## **5. Rate Sheets LLM Query**
**POST /llm/rate-sheets/query**
- **Body (JSON)**:
```json
{ "question": "<your question>" }
```
- **Response**:
```json
{ "answer": "<rate sheets info>" }
```

---

## **6. Create User**
**POST /user/create**
- **Body (JSON)**:
```json
{
  "username": "<username>",
  "name": "<full name>"
}
```
- **Response**:
```json
{
  "message": "User created successfully",
  "username": "<username>",
  "name": "<name>"
}
```

---

## **7. Get User**
**GET /user/get?username=xxx**
- **Response**:
```json
{
  "username": "<username>",
  "name": "<name>",
  "clients": [ ... ]
}
```

---

## **8. Update User**
**POST /user/update**
- **Body (JSON)**:
```json
{
  "username": "<username>",
  "name": "<new name>"
}
```
- **Response**:
```json
{
  "message": "User updated successfully",
  "username": "<username>",
  "name": "<name>",
  "clients": [ ... ]
}
```

---

## **9. Add Client**
**POST /user/client/add**
- **Body (JSON)**:
```json
{
  "username": "<username>",
  "client_name": "<client>"
}
```
- **Response**:
```json
{
  "message": "Client added successfully",
  "username": "<username>",
  "clients": [ ... ]
}
```

---

## **10. Update Client Loan Details**
**POST /user/client/update-loan-details**
- **Body (JSON)**:
```json
{
  "username": "<username>",
  "client_name": "<client>",
  "loan_amount_requested": <loan amount>,
  "loan_term": <loan term>,
  "loan_down_payment": <down payment>,
  "loan_interest_preference": "<interest preference>"
}
```
- **Response**:
```json
{
  "message": "Client loan details updated successfully",
  "username": "<username>",
  "updated_client": { ... }
}
```

---

## **11. Update Client Finance**
**POST /user/client/update**
- **Body (JSON)**:
```json
{
  "username": "<username>",
  "client_name": "<client>",
  "credit_score": 730,
  "fico_score": 0,
  "dti_ratio": 0.0,
  "monthly_expenses": 0.0,
  "index": 0,
  "new_income": 12000
}
```
- **Response**:
```json
{
  "message": "Client updated successfully",
  "username": "<username>",
  "updated_client": { ... }
}
```

---

## **12. Get Client**
**GET /user/client/get?username=xxx&client_name=yyy**
- **Response**:
```json
{
  "username": "<username>",
  "client": { ... }
}
```

---

## **13. Read Income From File for Client**
**POST /user/client/read-income**
- **Parameters (form-data)**:
  - `file`: PDF income document (required)
  - `username`: associated user (required)
  - `client_name`: client to update (required)
  - `index`: which income index to update (required)
- **Response**:
```json
{
  "username": "<username>",
  "client": { ... },
  "read_doc_type": "<type>"
}
```

---

## **14. Read Credit Report for Client**
**POST /user/client/read-credit-report**
- **Parameters (form-data)**:
  - `file`: PDF credit report document (required)
  - `username`: associated user (required)
  - `client_name`: client to update (required)
- **Response**:
```json
{
  "username": "<username>",
  "client": { ... }
}
```

---

## **15. Extract Credit Report**
**POST /file/credit-report/extract**
- **Parameters (form-data)**:
  - `file`: PDF credit report document (required)
- **Response**:
```json
{
  "credit_score": "<credit score>",
  "fico_score": "<fico score>",
  "monthly_expenses": "<monthly expenses>"
}
```

---

## **16. Get New LLM Recommendation For Client**
**GET /user/client/new-recommendation?username=xxx&client_name=yyy**
  - `username`: The username of the associated user (required).
  - `client_name`: The name of the client (required).
- **Response**:
```json
{
  "username": "<username>",
  "client": "<client_name>",
  "recommendation": "<LLM output>"
}
```

---

## **17. Get Client LLM Recommendation**
**GET /user/client/recommendation?username=xxx&client_name=yyy**
- **Parameters (query)**:
  - `username`: The username of the associated user (required).
  - `client_name`: The name of the client (required).
- **Response**:
```json
{
  "username": "<username>",
  "client_name": "<client_name>",
  "llm_recommendation": "<LLM recommendation>"
}
```

