# Mortgage Application API Documentation

This documentation provides details on how to use the Mortgage Application API for frontend developers. The API enables creating and managing mortgage applications, borrowers, and loan recommendations.

## Base URL

All endpoints are relative to the base URL:
```
http://localhost:5000
```

## Authentication

Currently, the API uses a user override (`USER_OVERRIDE = "admin"`) for authentication. In a production environment, proper authentication would be implemented.

## Common Data Models

### Application Model

```json
{
  "id": "app_12345678",
  "loan_amount": 450000,
  "loan_down_payment": 90000,
  "loan_interest_preference": "FIXED",
  "loan_term": 30,
  "loan_purpose": "PURCHASE",
  "loan_type": "CONVENTIONAL",
  "property_price": 540000,
  "property_address": "123 Main Street, Anytown, CA 94088",
  "property_type": "SINGLE_FAMILY",
  "occupancy_type": "PRIMARY_RESIDENCE",
  "status": "IN_PROGRESS",
  "rate": 6.25,
  "primary_borrower_id": "bor_12345678",
  "co_borrowers_id": ["bor_87654321"],
  "total_income": 254000,
  "total_monthly_expenses": 7300,
  "dti": 34.5,
  "ltv": 83.3,
  "llm_recommendation": "Based on the applicant's...",
  "last_updated": "2025-05-05T15:30:45",
  "created_at": "2025-05-01T10:20:15"
}
```

### Borrower Model

```json
{
  "id": "bor_12345678",
  "name": "Michael Johnson",
  "email": "michael.johnson@example.com",
  "ssn": "123-45-6789",
  "marital_status": "MARRIED",
  "phone_number": "555-123-4567",
  "total_income": 144000,
  "credit_score": 745,
  "fico_score": 752,
  "dti_ratio": 37.5,
  "monthly_expenses": 4500,
  "income_sources": [
    ["SALARY", 120000],
    ["RENTAL_INCOME", 24000]
  ]
}
```

## API Endpoints

### User Management

#### Create User

Creates a new user in the system.

- **URL:** `/api/user`
- **Method:** `POST`
- **Body:** `form-data`
  - `username`: User's login ID (string)
  - `name`: User's full name (string)
- **Response:** 
  - Success (201)
    ```json
    {
      "message": "User created successfully",
      "user": {
        "username": "johnsmith",
        "name": "John Smith"
      }
    }
    ```
  - Error (400/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

### Applications

#### Create Application

Creates a new mortgage application with borrower information.

- **URL:** `/api/applications`
- **Method:** `POST`
- **Body:** `form-data`
  - `loan_amount`: Amount of the loan (number)
  - `loan_down_payment`: Down payment amount (number)
  - `loan_interest_preference`: Interest type (string, e.g., "FIXED", "VARIABLE")
  - `loan_term`: Term in years (number)
  - `loan_purpose`: Purpose of the loan (string, e.g., "PURCHASE", "REFINANCE")
  - `loan_type`: Type of loan (string, e.g., "CONVENTIONAL", "FHA", "VA")
  - `property_price`: Price of the property (number)
  - `borrowers`: JSON array of borrower objects (string)
    ```json
    [
      {
        "firstname": "Michael",
        "lastname": "Johnson",
        "email": "michael.johnson@example.com",
        "phone": "555-123-4567",
        "ssn": "123-45-6789"
      },
      {
        "firstname": "Sarah",
        "lastname": "Johnson",
        "email": "sarah.johnson@example.com",
        "phone": "555-987-6543",
        "ssn": "987-65-4321"
      }
    ]
    ```
- **Response:**
  - Success (200)
    ```json
    {
      "message": "Application created successfully",
      "success": true,
      "data": "{\"id\":\"app_12345678\",\"loan_amount\":450000,...}"
    }
    ```
  - Error (500)
    ```json
    {
      "success": false,
      "error": "Error message here"
    }
    ```

#### Get All Applications

Retrieves all applications for the current user.

- **URL:** `/api/applications`
- **Method:** `GET`
- **Response:**
  - Success (200): Array of application objects with borrower details
    ```json
    [
      {
        "application": {...},
        "borrowers": [...]
      }
    ]
    ```
  - Error (404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

#### Get Single Application

Retrieves a specific application by ID.

- **URL:** `/api/applications/:id`
- **Method:** `GET`
- **URL Parameters:** 
  - `id`: Application ID
- **Response:**
  - Success (200): Detailed loan information with borrower details
    ```json
    {
      "loan_number": "app_12345678",
      "loan_type": "CONVENTIONAL",
      "loan_purpose": "PURCHASE",
      "primary_borrower": "Michael Johnson",
      "loan_amount": "$450000",
      "property_price": "$540000",
      "ltv": 83.3,
      "dti": 34.5,
      "loan_term": 30,
      "loan_down_payment": 90000,
      "loan_interest_preference": "FIXED",
      "status": "IN_PROGRESS",
      "rate": 6.25,
      "primary_borrower_id": "bor_12345678",
      "co_borrowers_id": ["bor_87654321"],
      "total_income": 254000,
      "total_monthly_expenses": 7300,
      "llm_recommendation": "Based on the applicant's...",
      "last_updated": "2025-05-05T15:30:45",
      "created_at": "2025-05-01T10:20:15",
      "borrowers": [...]
    }
    ```
  - Error (400)
    ```json
    {
      "error": "Application not found"
    }
    ```

#### Update Application

Updates an existing application with new information.

- **URL:** `/api/applications/:id`
- **Method:** `PUT`
- **URL Parameters:** 
  - `id`: Application ID
- **Body:** `form-data` (all fields optional)
  - `loan_amount`: Updated loan amount (number)
  - `loan_down_payment`: Updated down payment (number)
  - `loan_interest_preference`: Updated interest preference (string)
  - `loan_term`: Updated term (number)
  - `rate`: Updated interest rate (number)
  - `loan_purpose`: Updated loan purpose (string)
  - `loan_type`: Updated loan type (string)
  - `property_price`: Updated property price (number)
  - `property_address`: Property address (string)
  - `property_type`: Type of property (string)
  - `occupancy_type`: Occupancy type (string)
  - `status`: Updated application status (string)
- **Response:**
  - Success (200)
    ```json
    {
      "message": "Application updated successfully",
      "application": {...}
    }
    ```
  - Error (404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

#### Get Application Recommendation

Retrieves the existing recommendation for a specific application.

- **URL:** `/api/applications/:id/recommendation`
- **Method:** `GET`
- **URL Parameters:** 
  - `id`: Application ID
- **Response:**
  - Success (200)
    ```json
    {
      "application": {...},
      "llm_recommendation": "Based on the applicant's..."
    }
    ```
  - Error (400/404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

#### Generate New Recommendation

Generates a new recommendation based on current application data.

- **URL:** `/api/applications/:id/new-recommendation`
- **Method:** `GET`
- **URL Parameters:** 
  - `id`: Application ID
- **Response:**
  - Success (200)
    ```json
    {
      "application": {...},
      "llm_recommendation": "Based on the applicant's..."
    }
    ```
  - Error (400/404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

### Borrowers

#### Get Borrower Information

Retrieves information for a specific borrower by ID.

- **URL:** `/api/borrower/:id`
- **Method:** `GET`
- **URL Parameters:** 
  - `id`: Borrower ID
- **Response:**
  - Success (200): Borrower object
    ```json
    {
      "id": "bor_12345678",
      "name": "Michael Johnson",
      "email": "michael.johnson@example.com",
      "ssn": "123-45-6789",
      ...
    }
    ```
  - Error (404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

#### Update Borrower

Updates a borrower's information.

- **URL:** `/api/borrowers/:id`
- **Method:** `PUT`
- **URL Parameters:** 
  - `id`: Borrower ID
- **Body:** `form-data` (all fields optional)
  - `monthly_expenses`: Monthly expenses (number)
  - `income_sources`: JSON array of income sources (string)
    ```json
    [["SALARY", 120000], ["RENTAL_INCOME", 24000]]
    ```
  - `phone_number`: Phone number (string)
  - `email`: Email address (string)
  - `ssn`: Social Security Number (string)
  - `marital_status`: Marital status (string)
  - `credit_score`: Credit score (number)
  - `fico_score`: FICO score (number)
- **Response:**
  - Success (200)
    ```json
    {
      "message": "Borrower updated successfully",
      "borrower": {...}
    }
    ```
  - Error (404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

#### Upload Income Document

Uploads and processes an income document (W2, paystub, etc.) for a borrower.

- **URL:** `/api/borrower/read-income`
- **Method:** `POST`
- **Body:** `form-data`
  - `borrower_id`: Borrower ID (string)
  - `file`: PDF document file
- **Response:**
  - Success (200)
    ```json
    {
      "borrower": {...},
      "read_doc_type": "W2"
    }
    ```
  - Error (400/404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

#### Upload Credit Report

Uploads and processes a credit report document for a borrower.

- **URL:** `/api/borrower/read-credit-report`
- **Method:** `POST`
- **Body:** `form-data`
  - `borrower_id`: Borrower ID (string)
  - `file`: PDF document file
- **Response:**
  - Success (200)
    ```json
    {
      "borrower": {...}
    }
    ```
  - Error (400/404/500)
    ```json
    {
      "error": "Error message here"
    }
    ```

## How-To Guides

### Creating a Complete Loan Application

1. **Create a user** (if not already registered)
   ```
   POST /api/user
   ```

2. **Create an application** with primary borrower and co-borrower
   ```
   POST /api/applications
   ```
   - This creates the application and borrower records in the database
   - Store the application ID for future reference

3. **Update application details** with property information
   ```
   PUT /api/applications/:id
   ```
   - Add property address, type, and occupancy details

4. **Update borrower information** for both primary and co-borrowers
   ```
   PUT /api/borrowers/:id
   ```
   - Update income, expenses, credit scores, etc.

5. **Upload supporting documents** for income verification
   ```
   POST /api/borrower/read-income
   ```
   - The system will automatically extract income information

6. **Upload credit report** for credit score verification
   ```
   POST /api/borrower/read-credit-report
   ```
   - The system will automatically extract credit score and monthly expenses

7. **Generate loan recommendation**
   ```
   GET /api/applications/:id/new-recommendation
   ```
   - The system will analyze all application data and provide a recommendation

### Complete Testing Flow

To thoroughly test the API workflow, follow these steps in sequence:

1. **Create a new user**
   ```
   POST /api/user
   ```
   Request body:
   ```
   username: johnsmith
   name: John Smith
   ```
   Expected response: 201 Created with user details

2. **Create a new mortgage application**
   ```
   POST /api/applications
   ```
   Request body:
   ```
   loan_amount: 450000
   loan_down_payment: 90000
   loan_interest_preference: FIXED
   loan_term: 30
   loan_purpose: PURCHASE
   loan_type: CONVENTIONAL
   property_price: 540000
   borrowers: [{"firstname":"Michael","lastname":"Johnson","email":"michael.johnson@example.com","phone":"555-123-4567","ssn":"123-45-6789"},{"firstname":"Sarah","lastname":"Johnson","email":"sarah.johnson@example.com","phone":"555-987-6543","ssn":"987-65-4321"}]
   ```
   Expected response: 200 OK with application ID
   - Save `applicationId` from response for future requests

3. **Get application details**
   ```
   GET /api/applications/{applicationId}
   ```
   Expected response: 200 OK with application details
   - Save `primaryBorrowerId` and `coBorrowerId` from response

4. **Update application with property details**
   ```
   PUT /api/applications/{applicationId}
   ```
   Request body:
   ```
   property_address: 123 Main Street, Anytown, CA 94088
   property_type: SINGLE_FAMILY
   occupancy_type: PRIMARY_RESIDENCE
   ```
   Expected response: 200 OK with updated application

5. **Update primary borrower information**
   ```
   PUT /api/borrowers/{primaryBorrowerId}
   ```
   Request body:
   ```
   monthly_expenses: 4500
   income_sources: [["SALARY", 120000], ["RENTAL_INCOME", 24000]]
   marital_status: MARRIED
   credit_score: 745
   fico_score: 752
   ```
   Expected response: 200 OK with updated borrower details

6. **Update co-borrower information**
   ```
   PUT /api/borrowers/{coBorrowerId}
   ```
   Request body:
   ```
   monthly_expenses: 2800
   income_sources: [["SALARY", 95000], ["BONUS", 15000]]
   marital_status: MARRIED
   credit_score: 732
   fico_score: 738
   ```
   Expected response: 200 OK with updated borrower details

7. **Upload income document for primary borrower**
   ```
   POST /api/borrower/read-income
   ```
   Request body:
   ```
   borrower_id: {primaryBorrowerId}
   file: [w2.pdf]
   ```
   Expected response: 200 OK with updated borrower details and document type

8. **Upload credit report for primary borrower**
   ```
   POST /api/borrower/read-credit-report
   ```
   Request body:
   ```
   borrower_id: {primaryBorrowerId}
   file: [credit_report.pdf]
   ```
   Expected response: 200 OK with updated borrower details

9. **Generate new recommendation**
   ```
   GET /api/applications/{applicationId}/new-recommendation
   ```
   Expected response: 200 OK with application details and recommendation

10. **Verify recommendation**
    ```
    GET /api/applications/{applicationId}/recommendation
    ```
    Expected response: 200 OK with stored recommendation

11. **Get all applications** (verify your application appears in the list)
    ```
    GET /api/applications
    ```
    Expected response: 200 OK with array of applications

### Retrieving Application Status

1. **Get all applications** for the current user
   ```
   GET /api/applications
   ```
   - This returns all applications with their current status

2. **Get specific application details**
   ```
   GET /api/applications/:id
   ```
   - This returns detailed information about a specific application

### Updating Borrower Information

1. **Get current borrower information**
   ```
   GET /api/borrower/:id
   ```

2. **Update borrower details**
   ```
   PUT /api/borrowers/:id
   ```
   - Update any borrower information as needed

3. **Upload new income documents** if income has changed
   ```
   POST /api/borrower/read-income
   ```

4. **Generate new recommendation** based on updated information
   ```
   GET /api/applications/:id/new-recommendation
   ```

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Resource created
- 400: Bad request (missing or invalid parameters)
- 404: Resource not found
- 500: Server error

Error responses include a descriptive message to help debug the issue.

## Data Formats

- **Loan Amount/Price**: Numbers (e.g., 450000)
- **Dates**: ISO 8601 format (e.g., "2025-05-05T15:30:45")
- **Income Sources**: Arrays of [source_type, amount] (e.g., [["SALARY", 120000]])
- **Status**: String values (e.g., "IN_PROGRESS", "APPROVED", "DENIED")

## Best Practices

1. **Store IDs**: Always store application and borrower IDs after creation
2. **Error Handling**: Implement proper error handling for all API calls
3. **Data Validation**: Validate all user inputs before submitting to the API
4. **Document Processing**: Use PDF format for all document uploads
5. **Refreshing Data**: After updates, re-fetch application data to ensure consistency