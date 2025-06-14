from flask import Flask


from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
load_dotenv()
import os 
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key') # Add a secret key
db = SQLAlchemy(app)