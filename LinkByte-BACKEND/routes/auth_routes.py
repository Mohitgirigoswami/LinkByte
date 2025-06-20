from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token
from Model import Users, Otp
from Utility import is_valid_username, is_strong_password, genrate_otp
from Config import db,limiter
import bcrypt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
@cross_origin()
@limiter.limit("5 per minute; 40 per hour", key_func=lambda: request.remote_addr)
def register_user():
    data = request.get_json()
    username = data.get('Username')
    email = data.get('Email')
    password = data.get('Password')

    existing_user = Users.query.filter_by(username=username).first()
    try:
        if not is_valid_username(username):
            return jsonify({'message': 'invalid username'}), 400
        if not is_strong_password(password):
            return jsonify({'message': 'weak password'}), 400
        if existing_user:
            if existing_user.status:
                return jsonify({'message': 'Username already exists'}), 400
            else:
                db.session.delete(existing_user)
                db.session.commit()

        existing_email = Users.query.filter_by(email=email).first()
        if existing_email:
            if existing_email.status:
                return jsonify({'message': 'Email already exists'}), 400
            else:
                db.session.delete(existing_email)
                db.session.commit()

        salt = bcrypt.gensalt()
        hash_pass = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        new_user = Users(username=username, email=email, hashed_password=hash_pass, signin_type='local', status=False)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registration initiated successfully\ncheck Email for OTP to verify OTP in next Step '}), 201
    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal server error'}), 500

@auth_bp.route('/register/otp', methods=['POST', 'OPTIONS'])
@limiter.limit("3 per minute; 20 per hour", key_func=lambda: request.remote_addr)
@cross_origin()
def sendverotp():
    data = request.get_json()
    email = data.get('Email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    user = Users.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email is not associated with any account'}), 400
    otp = genrate_otp(email, "VERIFY EMAIL")
    if otp == 404:
        return jsonify({'message': 'Failed to generate OTP'}), 500
    expiry_time = datetime.now() + timedelta(minutes=10)
    otp_entry = Otp(user_id=user.id, otp=otp, expiry=expiry_time, purpose="VERIFY EMAIL")
    db.session.add(otp_entry)
    db.session.commit()
    return jsonify({'message': 'OTP sent to email', 'expiry': expiry_time.isoformat()}), 200

@auth_bp.route('/register/verify', methods=['POST', 'OPTIONS'])
@cross_origin()
@limiter.limit("5 per minute; 40 per hour", key_func=lambda: request.remote_addr)
def verifyreg():
    data = request.get_json()
    email = data.get('Email')
    otp = data.get('otp')
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    if not otp:
        return jsonify({'message': 'OTP is required'}), 400

    user = Users.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email is not associated with any account'}), 400

    otp_entry = Otp.query.filter_by(user_id=user.id, purpose="VERIFY EMAIL").order_by(Otp.expiry.desc()).first()
    if not otp_entry:
        return jsonify({'message': 'No OTP found for this user'}), 400

    if datetime.now() > otp_entry.expiry:
        db.session.delete(otp_entry)
        db.session.commit()
        return jsonify({'message': 'OTP has expired'}), 400

    if str(otp_entry.otp) != str(otp):
        return jsonify({'message': 'Invalid OTP'}), 400

    db.session.delete(otp_entry)
    db.session.commit()
    user.status = True
    db.session.commit()
    return jsonify({'message': 'Email verified successfully'}), 200

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin()
@limiter.limit("3 per minute; 50 per hour", key_func=lambda: request.remote_addr)
def login_user():
    data = request.get_json()
    username = data.get('Username')
    password = data.get('Password')
    signintype = data.get('signin_type')
    try:
        if not username or not password or not signintype:
            return jsonify({'message': 'incomplete data'}), 400
        user = Users.query.filter_by(username=username).first()
        if not user:
            jsonify({'message': 'Invalid credentials'}), 401
        if signintype == 'local':
            if not user.status:
                return jsonify({"message": "Email Not Verified Create new Account"}), 400
            if bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
                token = create_access_token(identity=user.uuid)
                return jsonify({'message': 'Login successful', 'token': token}), 200
            else:
                jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal server error'}), 500