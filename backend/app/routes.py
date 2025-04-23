from flask import Blueprint, request, jsonify, render_template
from app.db.db_upload_unstructured import handle_file_upload
from app.db.db_prompt_query import get_query_response
from app.db.astra_db_rate_sheets_query import get_rate_sheets_response
from app.gpt.gpt_classify_income import classify_and_extract_income_from_text
from app.util.extract_text import extract_text_from_pdf

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
    