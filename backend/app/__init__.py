from flask import Flask

from app.models.user import ensure_user_table_exists

def create_app():
    app = Flask(__name__)

    

    #  ─── Ensures the DynamoDB table is ready ───
    ensure_user_table_exists()
    
    from .routes import main
    app.register_blueprint(main)

    return app
