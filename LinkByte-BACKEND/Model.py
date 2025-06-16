from Config import db
import uuid
from sqlalchemy import Column, Integer, String, Text,Boolean
from datetime import datetime

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda:str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    profile_pic_link = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    signin_type = db.Column(db.String(50), nullable=False)
    oauth_id = db.Column(db.String(256), nullable=True)
    hashed_password = db.Column(db.String(256), nullable=True)
    status = db.Column(db.Boolean, nullable=False,default = True)
    def __repr__(self):
        return f'<User {self.Username}>'

class Otp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    otp = db.Column(db.Integer, nullable=False)
    expiry = db.Column(db.DateTime, nullable=False, default=datetime.now )
    purpose=db.Column(db.String(100), nullable=True)
    
    def __repr__(self):
        return f"<Otp user_id={self.user_id} otp={self.otp} used={self.is_used}>"

class Posts(db.Model):
    id = db.Column(db.Integer, primary_key=True )
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    Authour = db.Column(db.String(80), nullable=False)
    isArchived = db.Column(db.Boolean, default=False, nullable=False)
    Content = db.Column(db.Text, nullable=False)
    Type = db.Column(db.String(20), nullable=False)
    Time = db.Column(db.DateTime, nullable=False, default=datetime.now)
    media_link = db.Column(db.String(255), nullable=True)
    public_id = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return f"Post('{self.Content[:30]}...', Type='{self.Type}', Author='{self.Authour.Username if self.Authour else 'N/A'}')"
