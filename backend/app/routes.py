from flask import Blueprint, request, jsonify, render_template
from app.db.db_upload_unstructured import handle_file_upload
from app.db.db_prompt_query import get_query_response
from app.db.astra_db_rate_sheets_query import get_rate_sheets_response
from app.gpt.gpt_classify_income import classify_and_extract_income_from_text
from app.util.extract_text import extract_text_from_pdf
from app.models.user import User

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html', title='Home', heading='Hello Flask!', message='This is dynamic content.')

@main.route('/about')
def about():
    return render_template('about.html', title='About', heading='About Flask', message='This is the about page.')

@main.route('/contact')
def contact():
    return render_template('contact.html', title='Contact', heading='Contact Us', message='This is the contact page.')

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
    
@main.route('/user/create', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')

    if not username or not name:
        return jsonify({'error': 'Missing username or name'}), 400
    
    try:
        # Check if user already exists
        existing_user = User.get_user_by_username(username)
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        user = User(username=username, name=name)
        User.save_user(user)
        return jsonify({
            "message": "User created successfully",
            "username": user.username,
            "name": user.name,
            "clients": [c.to_dict() for c in user.clients] if user.clients else None
        }), 201
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
    
@main.route('/user/get', methods=['GET'])
def get_user():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Missing username parameter'}), 400

    try:
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            "username": user.username,
            "name": user.name,
            "clients": [c.to_dict() for c in user.clients] if user.clients else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@main.route('/user/update', methods=['POST'])
def update_user():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name', None)

    if not username:
    
        return jsonify({'error': 'Missing username'}), 400

    try:
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if name:
            user.name = name
        
        User.save_user(user)

        return jsonify({
            "message": "User updated successfully",
            "username": user.username,
            "name": user.name,
            "clients": [c.to_dict() for c in user.clients] if user.clients else None
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
    
@main.route('/user/client/add', methods=['POST'])
def add_client():
    data = request.get_json()
    username = data.get('username')
    client_name = data.get('client_name')
    credit_score = data.get('credit_score', 0)
    income_sources = data.get('income_sources', [0.0] * 5)

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        # Check if client already exists
        existing_client = next((c for c in user.clients if c.name == client_name), None)
        if existing_client:
            return jsonify({'error': 'Client already exists'}), 400
        
        # Add new client
        user.add_client(client_name, credit_score, income_sources)
        User.save_user(user)

        return jsonify({
            "message": "Client added successfully",
            "username": user.username,
            "clients": [c.to_dict() for c in user.clients] if user.clients else None
        }), 201
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
    
@main.route('/user/client/update', methods=['POST'])
def update_client():
    data = request.get_json()
    username = data.get('username')
    client_name = data.get('client_name')
    credit_score = data.get('credit_score', None)
    new_income = data.get('new_income', None)
    index = data.get('index', None)

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.update_client(client_name, credit_score, index, new_income)
        User.save_user(user)

        return jsonify({
            "message": "Client updated successfully",
            "username": user.username,
            "clients": [c.to_dict() for c in user.clients] if user.clients else None
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500

@main.route('/user/client/get', methods=['GET'])
def get_client():
    username = request.args.get('username')
    client_name = request.args.get('client_name')

    if not username or not client_name:
        return jsonify({'error': 'Missing username or client_name'}), 400

    try:
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        client = next((c for c in user.clients if c.name == client_name), None)
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        return jsonify({
            "username": user.username,
            "client": client.to_dict()
        }), 200
    except Exception as e:      
        return jsonify({'error': str(e)}), 500
