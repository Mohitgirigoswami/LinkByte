from Config import db
import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship # Import for defining relationships
from datetime import datetime

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda:str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    profile_pic_link = db.Column(db.String(255), nullable=True)
    profile_bnr_link = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    signin_type = db.Column(db.String(50), nullable=False)
    oauth_id = db.Column(db.String(256), nullable=True)
    hashed_password = db.Column(db.String(256), nullable=True)
    status = db.Column(db.Boolean, nullable=False,default = True)
    
    posts = relationship('Posts', backref='author', lazy='dynamic', cascade="all, delete-orphan")
    
    reactions = relationship('Reaction', backref='reactor', lazy='dynamic', cascade="all, delete-orphan")

    following = relationship(
        'Follower',
        foreign_keys='Follower.follower_id',
        backref='follower_user',
        lazy='dynamic',
        cascade="all, delete-orphan"
    )

    
    followers = relationship(
        'Follower',
        foreign_keys='Follower.followed_id', 
        backref='followed_user', 
        lazy='dynamic',
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<User {self.username}>' 

class Otp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    otp = db.Column(db.Integer, nullable=False)
    expiry = db.Column(db.DateTime, nullable=False, default=datetime.now)
    purpose=db.Column(db.String(100), nullable=True)
    
    def __repr__(self):
        return f"<Otp user_id={self.user_id} otp={self.otp}>"

class Posts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda:str(uuid.uuid4())) # Renamed from public_key to uuid
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    isArchived = db.Column(db.Boolean, default=False, nullable=False)
    Content = db.Column(db.Text, nullable=False)
    Type = db.Column(db.String(20), nullable=False)
    Time = db.Column(db.DateTime, nullable=False, default=datetime.now)
    media_link = db.Column(db.String(255), nullable=True)
    public_id = db.Column(db.String(255), nullable=True)


    reactions = relationship('Reaction', backref='post', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f"Post('{self.Content[:30]}...', Type='{self.Type}')"

# --- NEW TABLES ---

class Follower(db.Model):
    __tablename__ = 'followers'

    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)

    __table_args__ = (
        db.UniqueConstraint('follower_id', 'followed_id', name='_follower_followed_uc'),
    )

    def __repr__(self):
        return f"<Follower follower_id={self.follower_id} followed_id={self.followed_id}>"

class Reaction(db.Model):
    __tablename__ = 'reactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    emoji_type = db.Column(db.String(20), nullable=False)

    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)

    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'post_id', name='_user_post_emoji_uc'),
    )

    def __repr__(self):
        return f"<Reaction user_id={self.user_id} post_id={self.post_id} emoji_type='{self.emoji_type}'>"

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    msg_uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda:str(uuid.uuid4()))
    sender_id = db.Column(db.Integer, nullable=False)
    reciver_id = db.Column(db.Integer, nullable=False)
    encrypted_msg = db.Column(db.LargeBinary, nullable=False)
    encrypted_url = db.Column(db.LargeBinary, nullable=True)
    type = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)