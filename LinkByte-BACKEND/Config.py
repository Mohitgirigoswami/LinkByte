from flask import Flask
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
load_dotenv()
from datetime import timedelta
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os 
import pymongo
app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["2000 per day", "200 per hour"],
    storage_uri=os.getenv("MONGODB_URI"),
    strategy="sliding-window-counter" 
)

app.config['RATELIMIT_HEADERS_ENABLED'] = True 
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key')
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY',"SECRET")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=14)
jwt = JWTManager(app)
db = SQLAlchemy(app)