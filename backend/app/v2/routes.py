import json
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask import g
import json
from app.v2.user import User
from app.v2.application import Application
from app.v2.borrower import Borrower

from app.v2.utils.astra_db_rate_sheets_query import get_rate_sheets_response
from app.v2.utils.extract_text import extract_text_from_pdf
from app.v2.utils.gpt_classify_income import classify_and_extract_income_from_text
from app.v2.utils.gpt_extract_credit import extract_credit_from_text
from app.v2.utils.llm_prompt_maker import rate_sheets_recommendation_prompt


v2api = Blueprint('v2api', __name__)
CORS(v2api)

USER_OVERRIDE = "admin"

@v2api.route('/api/user', methods=['POST'])
def create_user():
    username = request.form.get('username')
    name = request.form.get('name')
    if not username or not name:
        return jsonify({'error': 'Username and name are required'}), 400
    
    try:
        # Check if user already exists
        existing_user = User.load_from_dynamodb(username)
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400

        # Create new user
        user = User(username=username, name=name)
        user.save_to_dynamodb()

        return jsonify({'message': 'User created successfully', 'user': {'username': user.username, 'name': user.name}}), 201

    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({'error': str(e)}), 500

@v2api.route('/api/applications', methods=['POST'])
def create_application():
    if USER_OVERRIDE == "":
        # Authentication check
        if not getattr(g, 'current_user', None):
            return jsonify({'error': 'Unauthorized'}), 401
        # Use authenticated user
        user_id = g.current_user.username
    else:
        # Use admin user
        user_id = USER_OVERRIDE
    
    user = User.load_from_dynamodb(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        loan_amount = request.form.get('loan_amount')
        loan_down_payment = request.form.get('loan_down_payment')
        loan_interest_preference = request.form.get('loan_interest_preference', "FIXED")
        loan_term = request.form.get('loan_term')
        loan_purpose = request.form.get('loan_purpose', "PURCHASE")
        loan_type = request.form.get('loan_type', "CONVENTIONAL")
        property_price = request.form.get('property_price')
        borrowers = json.loads(request.form.get('borrowers'))

        application = Application(
            loan_amount=float(loan_amount),
            loan_down_payment=float(loan_down_payment),
            loan_interest_preference=loan_interest_preference,
            loan_term=int(loan_term),
            loan_purpose=loan_purpose,
            loan_type=loan_type,
            property_price=float(property_price)
        )

        user.add_application(application.id)
        user.save_to_dynamodb()

        for index, item in enumerate(borrowers):
            print("item: ", item)
            borrower = Borrower(
                name=f'{item["firstname"]} {item["lastname"]}', 
                phone_number=item["phone"],
                email=item["email"],
                ssn=item["ssn"]
            )
            borrower.save_to_dynamodb()
            if index == 0:
                application.primary_borrower_id = borrower.id
            else:
                application.co_borrowers_id.append(borrower.id)

        application.save_to_dynamodb()

        return jsonify({
            "message": "Application created successfully",
            "success": True,
            "data": json.dumps(application.to_dict())
        }), 200

    except Exception as e:
        print("Error during application creation:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500
    
@v2api.route('/api/applications/<id>', methods=['PUT'])
def update_application(id):
    try:
        application = Application.load_from_dynamodb(id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        # Update application fields from request data
        loan_amount = request.form.get('loan_amount')
        loan_down_payment = request.form.get('loan_down_payment')
        loan_interest_preference = request.form.get('loan_interest_preference')
        loan_term = request.form.get('loan_term')
        rate = request.form.get('rate')
        loan_purpose = request.form.get('loan_purpose')
        loan_type = request.form.get('loan_type')
        property_price = request.form.get('property_price')
        property_address = request.form.get('property_address')
        property_type = request.form.get('property_type')
        occupancy_type = request.form.get('occupancy_type')
        status = request.form.get('status')

        if loan_amount:
            application.loan_amount = float(loan_amount)
        if loan_down_payment:
            application.loan_down_payment = float(loan_down_payment)
        if loan_interest_preference:
            application.loan_interest_preference = loan_interest_preference
        if loan_term:
            application.loan_term = int(loan_term)
        if rate:
            application.rate = float(rate)
        if loan_purpose:
            application.loan_purpose = loan_purpose
        if loan_type:
            application.loan_type = loan_type
        if property_price:
            application.property_price = float(property_price)
        if property_address:
            application.property_address = property_address
        if property_type:
            application.property_type = property_type
        if occupancy_type:
            application.occupancy_type = occupancy_type
        if status:
            application.status = status

        application.save_to_dynamodb()

        return jsonify({'message': 'Application updated successfully', 'application': application.to_dict()}), 200

    except Exception as e:
        print(f"Error updating application: {e}")
        return jsonify({'error': str(e)}), 500

@v2api.route('/api/applications/<id>', methods=['GET'])
def get_application(id):
    application = Application.load_from_dynamodb(id)

    if not application:
        return jsonify({"error": "Application not found"}), 400
    
    borrowers = []
    borrowers.append(Borrower.load_from_dynamodb(application.primary_borrower_id))
    for borrower_id in application.co_borrowers_id:
        borrowers.append(Borrower.load_from_dynamodb(borrower_id))
    for borrower in borrowers:
        print("borrower: ", borrower.to_dict())
    loanDetails = {
        "loan_number": application.id,
        "loan_type": application.loan_type,
        "loan_purpose": application.loan_purpose,
        "primary_borrower": borrowers[0].name,
        "loan_amount": f"${application.loan_amount}",
        "property_price": f"${application.property_price}",
        "ltv": application.ltv,
        "dti": application.dti,
        "loan_term": application.loan_term,
        "loan_down_payment": application.loan_down_payment,
        "loan_interest_preference": application.loan_interest_preference,
        "status": application.status,
        "rate": application.rate,
        "primary_borrower_id": application.primary_borrower_id,
        "co_borrowers_id": application.co_borrowers_id,
        "total_income": application.total_income,
        "total_monthly_expenses": application.total_monthly_expenses,
        "llm_recommendation": application.llm_recommendation,
        "last_updated": application.last_updated,
        "created_at": application.created_at,
        "borrowers": [
            {
                "id": borrower.id,
                "first_name": borrower.name.split()[0],
                "last_name": borrower.name[len(borrower.name.split()[0]):].strip(),
                "email": borrower.email,
                "ssn": borrower.ssn,
                "marital_status": borrower.marital_status,
                "phone_no": borrower.phone_number,
                "total_income": f"${borrower.total_income}",
                "credit_score": borrower.credit_score,
                "fico_score": borrower.fico_score,
                "dti_ratio": borrower.dti_ratio,
                "monthly_expenses": f"${borrower.monthly_expenses}",
                "income_sources": [
                    {"source_type": source[0], "income": f"${source[1]}"} for source in borrower.income_sources
                ]
            } for borrower in borrowers
        ]
    }
    return jsonify(loanDetails), 200

@v2api.route('/api/applications', methods=['GET'])
def get_applications():
    if USER_OVERRIDE == "":
        # Authentication check
        if not getattr(g, 'current_user', None):
            return jsonify({'error': 'Unauthorized'}), 401
        # Use authenticated user
        user_id = g.current_user.username
    else:
        # Use admin user
        user_id = USER_OVERRIDE
    
    user = User.load_from_dynamodb(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        # Fetch all applications owned by the user
        applications = Application.get_all_applications()
        user_applications = [app for app in applications if app.id in user.application_id]

        # Prepare response with borrower details
        response = []
        for application in user_applications:
            borrowers = []
            primary_borrower = Borrower.load_from_dynamodb(application.primary_borrower_id)
            if primary_borrower:
                borrowers.append(primary_borrower.to_dict())

            for co_borrower_id in application.co_borrowers_id:
                co_borrower = Borrower.load_from_dynamodb(co_borrower_id)
                if co_borrower:
                    borrowers.append(co_borrower.to_dict())

            response.append({
                'application': application.to_dict(),
                'borrowers': borrowers
            })

        return jsonify(response), 200

    except Exception as e:
        print(f"Error fetching user applications: {e}")
        return jsonify({'error': str(e)}), 500
    
@v2api.route('/api/borrowers/<id>', methods=['PUT'])
def update_borrower(id):
    try:
        borrower = Borrower.load_from_dynamodb(id)
        if not borrower:
            return jsonify({'error': 'Borrower not found'}), 404

        # Update borrower fields from request data
        monthly_expenses = request.form.get('monthly_expenses')
        income_sources = request.form.get('income_sources')
        phone_number = request.form.get('phone_number')
        email = request.form.get('email')
        ssn = request.form.get('ssn')
        marital_status = request.form.get('marital_status')
        credit_score = request.form.get('credit_score')
        fico_score = request.form.get('fico_score')

        if income_sources:
            income_sources = json.loads(income_sources)
            borrower.update_income_sources(income_sources)
        if monthly_expenses:
            borrower.update_monthly_expenses(float(monthly_expenses))
        if phone_number:
            borrower.phone_number = phone_number
        if email:
            borrower.email = email
        if ssn:
            borrower.ssn = ssn
        if marital_status:
            borrower.marital_status = marital_status
        if credit_score:
            borrower.credit_score = int(credit_score)
        if fico_score:
            borrower.fico_score = int(fico_score)

        borrower.save_to_dynamodb()

        if monthly_expenses or income_sources:
            # Update associated application
            application = Application.get_application_by_borrower_id(borrower.id)
            if application:
                application.update_income_and_dti()
                application.save_to_dynamodb()

        return jsonify({'message': 'Borrower updated successfully', 'borrower': borrower.to_dict()}), 200

    except Exception as e:
        print(f"Error updating borrower: {e}")
        return jsonify({'error': str(e)}), 500

@v2api.route('/api/borrower/<id>', methods=['GET'])
def get_borrower(id):
    try:
        # Load borrower from DynamoDB using the provided ID
        borrower = Borrower.load_from_dynamodb(id)

        if not borrower:
            return jsonify({'error': 'Borrower not found'}), 404

        # Return borrower details as JSON
        return jsonify(borrower.to_dict()), 200

    except Exception as e:
        print(f"Error fetching borrower details: {e}")
        return jsonify({'error': str(e)}), 500

@v2api.route('/api/borrower/read-income', methods=['POST'])
def read_client_income():
    borrower_id = request.form['borrower_id']
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "Missing file"}), 400

    if not borrower_id:
        return jsonify({'error': 'Missing borrower_id'}), 400

    try:
        borrower = Borrower.load_from_dynamodb(borrower_id)
        if not borrower:
            return jsonify({'error': 'Borrower not found'}), 404

        text = extract_text_from_pdf(file)
        doc_type, income = classify_and_extract_income_from_text(text)

        if income is None:
            return jsonify({'error': 'Income could not be extracted'}), 400

        # Add the new income source to the client
        borrower.add_income_source(source_name=doc_type, amount=float(income))
        borrower.save_to_dynamodb()

        # Update the application with the new income
        application = Application.get_application_by_borrower_id(borrower.id)
        if application:
            application.update_income_and_dti()
            application.save_to_dynamodb()

        return jsonify({
            "borrower": borrower.to_dict(),
            "read_doc_type": doc_type
        }), 200
    except Exception as e:
        print(f"Error reading income: {e}")
        return jsonify({'error': str(e)}), 500
    
@v2api.route('/api/borrower/read-credit-report', methods=['POST'])
def read_client_credit_report():
    borrower_id = request.form['borrower_id']
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "Missing file"}), 400

    if not borrower_id:
        return jsonify({'error': 'Missing borrower_id'}), 400

    try:
        borrower = Borrower.load_from_dynamodb(borrower_id)
        if not borrower:
            return jsonify({'error': 'Borrower not found'}), 404

        text = extract_text_from_pdf(file)
        credit_score, fico_score, monthly_expenses = extract_credit_from_text(text)

        if credit_score == "Unknown" and fico_score == "Unknown" and monthly_expenses == "Unknown":
            return jsonify({'error': 'All values are unknown'}), 400
        if credit_score != "Unknown":
            borrower.credit_score = int(credit_score)
        else:
            return jsonify({'error': 'Credit score could not be extracted'}), 400
        if fico_score != "Unknown":
            borrower.fico_score = int(fico_score)
        else:
            borrower.fico_score = borrower.credit_score
        if monthly_expenses != "Unknown":
            borrower.update_monthly_expenses(float(monthly_expenses))
        
        borrower.save_to_dynamodb()
        # Update the application with the new credit score and DTI
        application = Application.get_application_by_borrower_id(borrower.id)
        if application:
            application.update_income_and_dti()
            application.save_to_dynamodb()

        return jsonify({
            "borrower": borrower.to_dict(),
        }), 200
    except Exception as e:      
        print(f"Error reading credit report: {e}")
        return jsonify({'error': str(e)}), 500

@v2api.route('/api/applications/<id>/new-recommendation', methods=['GET'])
def get_new_recommendation(id):
    try:
        application = Application.load_from_dynamodb(id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Load the primary borrower
        primary_borrower = Borrower.load_from_dynamodb(application.primary_borrower_id)
        if not primary_borrower:
            return jsonify({'error': 'Primary borrower not found'}), 404
        
        if primary_borrower.credit_score == 0:
            return jsonify({'error': 'Primary borrower has no credit score'}), 400
        if application.loan_amount == 0:
            return jsonify({'error': 'Loan amount is not set'}), 400
        if application.dti == 0:
            return jsonify({'error': 'DTI is not set'}), 400
        if application.total_income == 0:
            return jsonify({'error': 'Total income is not set'}), 400

        recommendation = get_rate_sheets_response(rate_sheets_recommendation_prompt(
            credit_score=primary_borrower.credit_score, 
            fico_score=primary_borrower.fico_score if primary_borrower.fico_score != 0 else "Unknown",
            dti_ratio=application.dti if application.dti != 0 else "Unknown", 
            income=application.total_income if application.total_income != 0 else "Unknown",
            loan_amount_requested=application.loan_amount if application.loan_amount != 0 else "Unknown",
            loan_term=application.loan_term if application.loan_term != 0 else "Unknown",
            loan_down_payment=application.loan_down_payment if application.loan_down_payment != 0 else "Unknown",
            loan_interest_preference=application.loan_interest_preference if application.loan_interest_preference else "Unknown",
            property_price=application.property_price if application.property_price != 0 else "Unknown",
            ltv_ratio=application.ltv if application.ltv != 0 else "Unknown"
            ))
        
        application.llm_recommendation = recommendation
        application.save_to_dynamodb()

        return jsonify({
            "application": application.to_dict(),
            "llm_recommendation": recommendation
        }), 200
    except Exception as e:      
        print(f"Error getting client recommendation: {e}")
        return jsonify({'error': str(e)}), 500
    
@v2api.route('/api/applications/<id>/recommendation', methods=['GET'])
def get_recommendation(id):
    try:
        application = Application.load_from_dynamodb(id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        if application.llm_recommendation is None:
            return jsonify({'error': 'No recommendation available'}), 400

        return jsonify({
            "application": application.to_dict(),
            "llm_recommendation": application.llm_recommendation
        }), 200
    except Exception as e:      
        print(f"Error getting client recommendation: {e}")
        return jsonify({'error': str(e)}), 500
