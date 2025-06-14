from flask import jsonify, request
from flask_cors import cross_origin
from Model import Users,Otp
from Config import db

import bcrypt
from Utility import is_valid_username,is_strong_password,genrate_otp
import jwt
import os
from datetime import datetime, timedelta
sample_posts = [
    {"id": 1, "title": "First Adventure", "imageUrl": "https://placehold.co/600x400/FF5733/FFFFFF?text=Post+1"},
    {"id": 2, "title": "City Lights", "imageUrl": "https://placehold.co/600x400/33FF57/000000?text=Post+2"},
    {"id": 3, "title": "Mountain Trails", "imageUrl": "https://placehold.co/600x400/3357FF/FFFFFF?text=Post+3"},
    {"id": 4, "title": "Ocean Waves", "imageUrl": "https://placehold.co/600x400/FFFF33/000000?text=Post+4"},
    {"id": 5, "title": "Forest Mystery", "imageUrl": "https://placehold.co/600x400/8D33FF/FFFFFF?text=Post+5"},
    {"id": 6, "title": "Desert Bloom", "imageUrl": "https://placehold.co/600x400/FF33CC/000000?text=Post+6"},
    {"id": 7, "title": "Urban Garden", "imageUrl": "https://placehold.co/600x400/33CCFF/000000?text=Post+7"},
    {"id": 8, "title": "Starry Night", "imageUrl": "https://placehold.co/600x400/CCFF33/000000?text=Post+8"},
    {"id": 9, "title": "Riverside Relax", "imageUrl": "https://placehold.co/600x400/FF8D33/FFFFFF?text=Post+9"},
    {"id": 10, "title": "Historic Streets", "imageUrl": "https://placehold.co/600x400/8DFF33/000000?text=Post+10"},
    {"id": 11, "title": "Cloudy Day", "imageUrl": "https://placehold.co/600x400/33FF8D/FFFFFF?text=Post+11"},
    {"id": 12, "title": "Sunny Fields", "imageUrl": "https://placehold.co/600x400/FF338D/000000?text=Post+12"},
    {"id": 13, "title": "Rainy Window", "imageUrl": "https://placehold.co/600x400/8D33FF/FFFFFF?text=Post+13"},
    {"id": 14, "title": "Snowy Peaks", "imageUrl": "https://placehold.co/600x400/33FFCC/000000?text=Post+14"},
    {"id": 15, "title": "Autumn Leaves", "imageUrl": "https://placehold.co/600x400/FFCC33/000000?text=Post+15"},
]

def register_routes(app): # Define a function to register routes
    @app.route('/getpost/<int:pageno>', methods=['GET', 'OPTIONS'])
    @cross_origin()
    def getpost(pageno):
        posts_per_page = 5
        total_posts = len(sample_posts)
        total_pages = (total_posts + posts_per_page - 1) // posts_per_page

        if pageno < 1 or pageno > total_pages:
            return jsonify({"error": f"Invalid page number. Please request a page between 1 and {total_pages}."}), 400

        start_index = (pageno - 1) * posts_per_page
        end_index = start_index + posts_per_page

        paginated_posts = sample_posts[start_index:end_index]

        return jsonify({
            "posts": paginated_posts,
            "currentPage": pageno,
            "totalPages": total_pages,
            "totalPosts": total_posts
        })

    @app.route('/register', methods=['POST', 'OPTIONS'])
    @cross_origin()
    def register_user():
        data = request.get_json()
        username = data.get('Username')
        email = data.get('Email')
        password = data.get('Password')

        existing_user = Users.query.filter_by(username=username).first()
        try : 
            if not is_valid_username:
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
            new_user = Users(username=username, email=email, hashed_password=hash_pass, signin_type='local',status = False)
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message': 'User registeration initiated successfully\ncheck Email for OTP to verify OTP in next Step '}), 201
        except Exception as e : 
            print(e)
            return jsonify({'message':'Internal server error'}), 500
    
    @app.route('/register/otp', methods=['POST', 'OPTIONS'])
    @cross_origin()
    def sendverotp():
        data = request.get_json()
        email = data.get('Email')
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        user = Users.query.filter_by(email=email).first()
        if not user:
            return jsonify({'message': 'Email is not associated with any account'}), 400
        otp = genrate_otp(email,"veriemail")
        if otp == 404 :
            return jsonify({'message': 'Failed to generate OTP'}), 500
        expiry_time = datetime.now() + timedelta(minutes=10)  # OTP valid for 10 minutes
        otp_entry = Otp(user_id = user.id , otp=otp, expiry=expiry_time,purpose = "veriemail")
        db.session.add(otp_entry)
        db.session.commit()
        return jsonify({'message': 'OTP sent to email', 'expiry': expiry_time.isoformat()}), 200
    
    @app.route('/register/verify', methods=['POST', 'OPTIONS'])
    @cross_origin()
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

        # Find the latest OTP for this user and purpose
        otp_entry = Otp.query.filter_by(user_id=user.id, purpose="veriemail").order_by(Otp.expiry.desc()).first()
        if not otp_entry:
            return jsonify({'message': 'No OTP found for this user'}), 400
        
        if datetime.now() > otp_entry.expiry:
            return jsonify({'message': 'OTP has expired'}), 400

        if str(otp_entry.otp) != str(otp):
            return jsonify({'message': 'Invalid OTP'}), 400

        user.status = True
        db.session.commit()
        return jsonify({'message': 'Email verified successfully'}), 200
    @app.route('/login', methods=['POST', 'OPTIONS'])
    
    @cross_origin()
    def login_user():
        data = request.get_json()
        user = Users.query.filter_by(username = data['Username']).first()
        if not user : 
            return jsonify({'message':'user doesnot exist'}),400
        if(data['signin_type'] == 'local'):
            if user.status == False:
                return jsonify({"message" : "Email Not Verified Create new Account"}) , 400
            if bcrypt.checkpw(data['Password'].encode('utf-8'), user.hashed_password.encode('utf-8')):
                # Generate JWT token
                token = jwt.encode({'user_uuid': user.uuid, 'username': user.username},os.getenv("JWT_SECRET_KEY"), algorithm=os.getenv("JWT_ALGORITHM"))
                return jsonify({'message': 'Login successful', 'token': token}), 200
            else:
                return jsonify({'message': 'Incorrect password'}), 401