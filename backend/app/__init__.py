from flask import Flask, g, request

from app.models.user import User, ensure_user_table_exists
from app.models.client import Client, ensure_client_table_exists
from app.models.application import Application, ensure_application_table_exists

def create_app():
    app = Flask(__name__)

    

    #  ─── Ensures the DynamoDB table is ready ───
    ensure_user_table_exists()
    ensure_client_table_exists()
    ensure_application_table_exists()

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

    return app
