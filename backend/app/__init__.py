from flask import Flask, g, request
from flask_cors import CORS
from app.models.client import Client, ensure_client_table_exists
from app.v2.user import ensure_user_table_exists, User
from app.v2.application import ensure_application_table_exists
from app.v2.borrower import ensure_borrower_table_exists
from app.v2.routes import v2api

def create_app():
    app = Flask(__name__)

    CORS(app)

    #  ─── Ensures the DynamoDB table is ready ───
    ensure_user_table_exists()
    ensure_client_table_exists()
    ensure_application_table_exists()
    ensure_borrower_table_exists()

    # ─── Load current user from auth_token header ───
    @app.before_request
    def load_current_user():
        auth = request.headers.get('Authorization', '')
        print("auth:", auth)
        if auth.startswith('Bearer '):
            token = auth.split(None, 1)[1]
            print("token:", token)
            g.current_user = User.load_from_dynamodb(token)
        else:
            g.current_user = None
        
    from .routes import main
    app.register_blueprint(main)
    app.register_blueprint(v2api)

    return app
