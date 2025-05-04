import json
import os
from flask import Blueprint, request, jsonify, render_template
from app.db.astra_db_upload_unstructured import handle_file_upload
from app.db.astra_db_prompt_query import get_query_response
from app.db.astra_db_rate_sheets_query import get_rate_sheets_response
from app.gpt.gpt_classify_income import classify_and_extract_income_from_text
from app.util.extract_text import extract_text_from_pdf
from app.models.user import User
from app.models.client import Client
from app.models.application import Application
from app.util.llm_prompt_maker import rate_sheets_recommendation_prompt
from app.gpt.gpt_extract_credit import extract_credit_from_text

main = Blueprint('main', __name__)


admin_username = 'Admin_username'

# Home route that renders the index page with dynamic content
@main.route('/')
def index():
    return render_template('index.html', title='Home', heading='Hello Flask!', message='This is dynamic content.')

# API route to upload a file and associate it with a database collection
@main.route('/file/upload', methods=['POST'])
def upload_file():
    try:
        file = request.files.get('file')
        collection_name = request.args.get('collection_name')

        if not file or not collection_name:
            return jsonify({"error": "Missing file or collection_name"}), 400

        message = handle_file_upload(file, collection_name)
        return jsonify({"message": message}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# API route to classify a file (e.g., pay stub) and extract yearly income
@main.route('/file/income/classify', methods=['POST'])
def classify_income_file():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "Missing file"}), 400

        text = extract_text_from_pdf(file)
        doc_type, income = classify_and_extract_income_from_text(text)

        return jsonify({
            "document_type": doc_type,
            "yearly_income": income
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# API route to query the LLM with a question and collection name
@main.route('/llm/query', methods=['POST'])
def query_llm():
    data = request.get_json()

    question = data.get('question')
    collection_name = data.get('collection_name')

    if not question or not collection_name:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        answer = get_query_response(question, collection_name)
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# API route to query rate sheets using the LLM
@main.route('/llm/rate-sheets/query', methods=['POST'])
def rate_sheet_query():
    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({"error": "Missing 'question' field in request body"}), 400

    try:
        answer = get_rate_sheets_response(question)
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# API route to create a new user
@main.route('/user/create', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')

    if not username or not name:
        return jsonify({'error': 'Missing username or name'}), 400

    # Check if user already exists
    existing_user = User.load_from_dynamodb(username)
    if existing_user:
        return jsonify({'error': 'User already exists'}), 400

    # Create new user
    user = User(username=username, name=name)
    user.save_to_dynamodb()

    return jsonify({'message': 'User created successfully'}), 201

# API route to retrieve all users
@main.route('/user/all', methods=['GET'])
def get_all_users():
    try:
        users = User.get_all_users()
        if not users:
            return jsonify({'error': 'No users found'}), 404

        user_list = []
        for user in users:
            user_list.append({
                "username": user.username,
                "name": user.name,
                "clients": user.client_names
            })

        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API route to retrieve user details by username
@main.route('/user/get', methods=['GET'])
def get_user():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Missing username parameter'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            "username": user.username,
            "name": user.name,
            "clients": user.client_names
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# API route to update user details
@main.route('/user/update', methods=['POST'])
def update_user():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name', None)

    if not username:
    
        return jsonify({'error': 'Missing username'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if name:
            user.name = name
        
        User.save_to_dynamodb()

        return jsonify({
            "message": "User updated successfully",
            "username": user.username,
            "name": user.name,
            "clients": user.client_names
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
    
# API route to add a new client to a user
@main.route('/user/client/add', methods=['POST'])
def add_client():
    from flask import g
    # Authentication check
    if not getattr(g, 'current_user', None):
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    client_name = data.get('client_name')

    if not client_name:
        return jsonify({'error': 'Missing client_name'}), 400

    # Use authenticated user
    user = g.current_user

    # Check if client already exists
    if client_name in user.client_names:
        return jsonify({'error': 'Client already exists for this user'}), 400

    # Add client to user
    user.add_client(client_name)
    user.save_to_dynamodb()

    # Save client to DynamoDB
    client = Client(name=client_name, user_username=user.username)
    client.save_to_dynamodb()

    return jsonify({'message': 'Client added successfully'}), 201
    
# API route to update a client's financial details
@main.route('/user/client/update', methods=['POST'])
def update_client():
    data = request.get_json()
    username = data.get('username')
    client_name = data.get('client_name')
    credit_score = data.get('credit_score', None)
    fico_score = data.get('fico_score', None)
    dti_ratio = data.get('dti_ratio', None)
    monthly_expenses = data.get('monthly_expenses', None)
    new_income = data.get('new_income', None)
    index = data.get('index', None)

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        if credit_score is not None:
            client.credit_score = int(credit_score)
        if fico_score is not None:
            client.fico_score = int(fico_score)
        if dti_ratio is not None:
            client.dti_ratio = float(dti_ratio)
        if monthly_expenses is not None:
            client.update_monthly_expenses(float(monthly_expenses))
        if new_income is not None:
            if index is not None:
                index = int(index)
                if index < 0 or index >= len(client.income_sources):
                    return jsonify({'error': 'Index out of range'}), 400
                client.update_income_source(index=index, new_income=float(new_income))

        # Save the updated client to DynamoDB
        client.save_to_dynamodb()

        return jsonify({
            "message": "Client updated successfully",
            "username": user.username,
            "updated_client": client.to_dict()
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500

# API route to update a client's loan application details
@main.route('/user/client/update-loan-details', methods=['POST'])
def update_client_loan_details():
    data = request.get_json()
    username = data.get('username')
    client_name = data.get('client_name')
    loan_amount_requested = data.get('loan_amount_requested', None)
    loan_term = data.get('loan_term', None)
    loan_down_payment = data.get('loan_down_payment', None)
    loan_interest_preference = data.get('loan_interest_preference', None)

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        if loan_amount_requested is not None:
            client.loan_amount_requested = float(loan_amount_requested)
        if loan_term is not None:
            client.loan_term = int(loan_term)
        if loan_down_payment is not None:
            client.loan_down_payment = float(loan_down_payment)
        if loan_interest_preference is not None:
            client.loan_interest_preference = loan_interest_preference

        # Save the updated client to DynamoDB
        client.save_to_dynamodb()

        return jsonify({
            "message": "Client loan details updated successfully",
            "username": user.username,
            "updated_client": client.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API route to retrieve a specific client's details
@main.route('/user/client/get', methods=['GET'])
def get_client():
    username = request.args.get('username')
    client_name = request.args.get('client_name')

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        # Check if the client belongs to the user
        if client.user_username != username:
            return jsonify({'error': 'Client does not belong to this user'}), 403

        return jsonify({
            "username": user.username,
            "client": client.to_dict()
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
    
# API route to read income from a file and update a client's income
@main.route('/user/client/read-income', methods=['POST'])
def read_client_income():
    username = request.form['username']
    client_name = request.form['client_name']
    index = request.form.get('index')
    file = request.files.get('file')
   
    if not file:
        return jsonify({"error": "Missing file"}), 400

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        text = extract_text_from_pdf(file)
        doc_type, income = classify_and_extract_income_from_text(text)

        if income is None:
            return jsonify({'error': 'Income could not be extracted'}), 400

        # Update the client's income source
        if index is not None:
            index = int(index)
            if index < 0 or index >= len(client.income_sources):
                return jsonify({'error': 'Index out of range'}), 400
            client.update_income_source(index=index, new_income=float(income))
            client.save_to_dynamodb()
        else:
            return jsonify({'error': 'Index not provided'}), 400

        return jsonify({
            "username": user.username,
            "client": client.to_dict(),
            "read_doc_type": doc_type
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500

# API route to read a credit report from a file and update a client's credit score, fico score, monthly expenses, and DTI ratio
@main.route('/user/client/read-credit-report', methods=['POST'])
def read_client_credit_report():
    username = request.form['username']
    client_name = request.form['client_name']
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "Missing file"}), 400

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        # Check if the client exists
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        text = extract_text_from_pdf(file)
        credit_score, fico_score, monthly_expenses = extract_credit_from_text(text)

        if credit_score == "Unknown" and fico_score == "Unknown" and monthly_expenses == "Unknown":
            return jsonify({'error': 'All values are unknown'}), 400
        if credit_score != "Unknown":
            client.credit_score = int(credit_score)
        else:
            return jsonify({'error': 'Credit score could not be extracted'}), 400
        if fico_score != "Unknown":
            client.fico_score = int(fico_score)
        if monthly_expenses != "Unknown":
            client.update_monthly_expenses(float(monthly_expenses))
        
        client.save_to_dynamodb()

        return jsonify({
            "username": user.username,
            "client": client.to_dict(),
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
    
# API route to extract credit report information from a file
@main.route('/file/credit-report/extract', methods=['POST'])
def extract_credit_report():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "Missing file"}), 400

        text = extract_text_from_pdf(file)
        credit_score,fico_score,monthly_expenses = extract_credit_from_text(text)
        return jsonify({
            "credit_score": credit_score,
            "fico_score": fico_score,
            "monthly_expenses": monthly_expenses
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# API route to get a new recommendation for a client based on their loan application, credit score and income
@main.route('/user/client/new-recommendation', methods=['GET'])
def get_client_recommendation():
    username = request.args.get('username')
    client_name = request.args.get('client_name')

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        if client.credit_score == 0:
            return jsonify({'error': 'Client has no credit score'}), 400
        if client.dti_ratio == 0:
            return jsonify({'error': 'Client has no DTI ratio'}), 400
        if not client.income_sources or all(income == 0 for income in client.income_sources):
            return jsonify({'error': 'Client has no income sources'}), 400

        recommendation = get_rate_sheets_response(rate_sheets_recommendation_prompt(
            credit_score=client.credit_score, 
            fico_score=client.fico_score if client.fico_score != 0 else "Unknown",
            dti_ratio=client.dti_ratio, 
            income=client.total_income,
            loan_amount_requested=client.loan_amount_requested,
            loan_term=client.loan_term,
            loan_down_payment=client.loan_down_payment,
            loan_interest_preference=client.loan_interest_preference
            ))
        
        client.llm_recommendation = recommendation
        client.save_to_dynamodb()

        return jsonify({
            "username": user.username,
            "client": client.to_dict(),
            "llm_recommendation": recommendation
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500

# API route to get an existing recommendation for a client
@main.route('/user/client/recommendation', methods=['GET'])
def get_client_llm_recommendation():
    username = request.args.get('username')
    client_name = request.args.get('client_name')

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.load_from_dynamodb(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = Client.load_from_dynamodb(client_name, username)
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        return jsonify({
            "username": user.username,
            "client_name": client.name,
            "llm_recommendation": client.llm_recommendation
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


   
@main.route('/applications', methods=['GET'])
def get_applications():

    applications = Application.get_all_applications()

    data = []
    for application in applications:
        borrowers = []
        for borrower_id in application.borrowers:
            borrowers.append(Client.load_from_dynamodb(borrower_id, admin_username))
       
        d = application.toJSON()
        data.append({
            "id": d["id"],
            "borrowers": ", ".join([f"{borrower.name}" for borrower in borrowers]),
            "amount": d["loanAmount"],
            "type": d["loanType"],
            "rate": d["rate"],
            "status": d["status"],
            "progress": (3 / 5) * 100,
            "lastUpdated": d["last_updated"]
        })


    # mock data
    # loans = [
    # {
    #   "id": "L12345",
    #   "borrowers": "Alice Firstimer and John Homeowner",
    #   "amount": "$320,000",
    #   "type": "Conventional",
    #   "rate": "4.25%",
    #   "status": "In Process",
    #   "progress": (3 / 5) * 100,
    #   "lastUpdated": "04/24/2025",
    # },
    # {
    #   "id": "L12346",
    #   "borrowers": "Sarah Johnson and Mark Williams",
    #   "amount": "$450,000",
    #   "type": "FHA",
    #   "rate": "4.5%",
    #   "status": "Ready for Review",
    #   "progress": (4 / 5) * 100,
    #   "lastUpdated": "04/23/2025",
    # },
    # {
    #   "id": "L12347",
    #   "borrowers": "David Lee and Jennifer Kim",
    #   "amount": "$275,000",
    #   "type": "VA",
    #   "rate": "4%",
    #   "status": "Pending Documents",
    #   "progress": (2 / 5) * 100,
    #   "lastUpdated": "04/25/2025",
    # },
    # {
    #   "id": "L12348",
    #   "borrowers": "Michael Brown and Lisa Brown",
    #   "amount": "$380,000",
    #   "type": "Conventional",
    #   "rate": "4.375%",
    #   "status": "Approved",
    #   "progress": 100,
    #   "lastUpdated": "04/22/2025",
    # },
    # {
    #   "id": "L12349",
    #   "borrowers": "Robert Smith",
    #   "amount": "$210,000",
    #   "type": "Conventional",
    #   "rate": "4.25%",
    #   "status": "Denied",
    #   "progress": (3 / 5) * 100,
    #   "lastUpdated": "04/21/2025",
    # }]
    return jsonify(data), 200


@main.route('/application/<id>', methods=['GET'])
def get_application(id):
    application = Application.load_from_dynamodb(id)

    if not application:
        return jsonify({"error": "Application not found"}), 400
    
    borrowers = []
    for borrower_id in application.borrowers:
        borrowers.append(Client.load_from_dynamodb(borrower_id, admin_username))
    for borrower in borrowers:
        print("borrower: ", borrower.to_dict())
    loanDetails = {
        "loanNumber": application.id,
        "loanType": application.loanType,
        "loanPurpose": application.loanPurpose,
        "borrower": borrowers[0].name,
        "loanAmount": f"${application.loanAmount}",
        "propertyPrice": f"${application.propertyPrice}",
        "ltv": application.ltv,
        "dti": application.dti,
        "borrowers": [
            {
                "firstName": borrower.name.split()[0],
                "lastName": borrower.name[len(borrower.name.split()[0]):].strip(),
                "email": borrower.email,
                "ssn": borrower.ssn,
                "maritalStatus": borrower.marital_status,
                "phoneNo": borrower.phone_number
            } for borrower in borrowers
        ]
    }
    return jsonify(loanDetails), 200

@main.route('/applications/', methods=['POST'])
def create_application():
    print("request.form: ", request.form)
    loanAmount = request.form['loanAmount']
    loanPurpose = request.form['loanPurpose']
    loanType = request.form['loanType']
    # propertyAddress = request.form['propertyAddress']
    propertyPrice = request.form['propertyPrice']
   
    borrowers = json.loads(request.form['borrowers'])
    
    files = request.files.getlist('files')  # Retrieve multiple files

    # Save the uploaded files
    upload_folder = "uploads/"  # Define your upload folder
    os.makedirs(upload_folder, exist_ok=True)  # Ensure the folder exists
    
   

    
        



    application = Application(loanType=loanType, loanPurpose=loanPurpose, loanAmount=loanAmount, propertyPrice=propertyPrice)
    
    for item in borrowers:
        borrower = Client(
            name=f'{item["firstname"]} {item["lastname"]}', 
            user_username=admin_username,
            phone_number=item["phone"],
            email=item["email"],
        )
        borrower.save_to_dynamodb()
        print("check: ", borrower.to_dict())
        application.add_borrower(borrower.id)

    print("application: ", application.toJSON())
    
    application.save_to_dynamodb()

    for file in files:
        if file: 
            collection_name = f'loan_{application.id}_documents'  
            message = handle_file_upload(file, collection_name)
            print("message: ", message)




    return jsonify({"success": True, "data": application.toJSON()}), 201
 

