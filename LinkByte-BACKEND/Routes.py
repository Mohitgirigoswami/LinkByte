from flask import jsonify, request
from flask_cors import cross_origin
from Model import Users,Otp,Posts
from Config import db,jwt
from flask_jwt_extended import create_access_token,get_jwt_identity, jwt_required
import bcrypt,os# type: ignore
from Utility import is_valid_username,is_strong_password,genrate_otp
import cloudinary # type: ignore
import cloudinary.uploader# type: ignore
from datetime import datetime, timedelta
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET"),
    secure=True
)
def register_routes(app): # Define a function to register routes
    @app.route('/register', methods=['POST', 'OPTIONS'])
    @cross_origin()
    def register_user():
        data = request.get_json()
        username = data.get('Username')
        email = data.get('Email')
        password = data.get('Password')

        existing_user = Users.query.filter_by(username=username).first()
        try : 
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
            db.session.delete(otp_entry) # Add this line
            db.session.commit()
            return jsonify({'message': 'OTP has expired'}), 400

        if str(otp_entry.otp) != str(otp):
            return jsonify({'message': 'Invalid OTP'}), 400
        db.session.delete(otp_entry) # Add this line
        db.session.commit() 
        user.status = True
        db.session.commit()
        return jsonify({'message': 'Email verified successfully'}), 200
    
    @app.route('/login', methods=['POST', 'OPTIONS'])
    @cross_origin()
    def login_user():
        data = request.get_json()
        username  =  data.get('Username')
        password  = data.get('Password')
        signintype = data.get('signin_type')
        try:
            if not username or not password or not signintype:
                return jsonify({'message' : 'incomplete data'}),400
            user = Users.query.filter_by(username = username).first()
            if not user : 
                return jsonify({'message':'user doesnot exist'}),400
            if(signintype == 'local'):
                if user.status == False:
                    return jsonify({"message" : "Email Not Verified Create new Account"}) , 400
                if bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
                    # Generate JWT token
                    token = create_access_token(identity=user.uuid)
                    return jsonify({'message': 'Login successful', 'token': token}), 200
                else:
                    return jsonify({'message': 'Incorrect password'}), 401
        except Exception as e:
            print(e)
            return {},500
    @app.route('/post/getuploadurl', methods=['POST', 'OPTIONS'])
    @cross_origin()
    @jwt_required()
    def get_upld_url():
        uuid = get_jwt_identity()
        user = Users.query.filter_by(uuid = uuid).first()
        if not user:
            return jsonify({'message':'Invalid user'}),401
        try : 
            data = request.get_json()
            filetype = data.get('filetype')
            filesize = data.get('filesize')
            if filetype.startswith('video/') and filesize > 100 * 1024 * 1024: # 100 MB
                return jsonify({'message': 'Video file size cannot exceed 100MB.'}), 400
            if filetype.startswith('image/') and filesize > 10 * 1024 * 1024: # 10 MB
                return jsonify({'message': 'Image file size cannot exceed 10MB.'}), 400
            params_to_sign = {
                'timestamp': int(datetime.now().timestamp()),
            }
            signature = cloudinary.utils.api_sign_request(
                params_to_sign,
                cloudinary.config().api_secret
            )
            print(signature)
            return jsonify({
                'signature': signature,
                'timestamp': params_to_sign['timestamp'],
                'api_key': cloudinary.config().api_key,
                'cloudinary_cloud_name':cloudinary.config().cloud_name
            }), 200
        except Exception as e:
            print(e)
            return jsonify({'message':e}),500
    @app.route('/post', methods=['POST', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def post():
        try:
            uuid = get_jwt_identity()
            if not uuid:
                return jsonify({'message': 'Invalid token'}), 401

            # Debug print
            print(f"UUID from token: {uuid}")
            
            user = Users.query.filter_by(uuid=uuid).first()
            if not user:
                return jsonify({'message': 'User not found'}), 401

            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400

            # Create new post with validated data
            new_post = Posts(
                user_id=int(user.id),
                Type=data.get('type', 'text'),
                Content=data.get('content', ''),
                media_link=data.get('media_link'),
                Authour=user.username
            )

            db.session.add(new_post)
            db.session.commit()

            return jsonify({'message': 'Post created successfully'}), 201

        except Exception as e:
            print(f"Error creating post: {str(e)}")
            db.session.rollback()
            return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
    @app.route('/getpost/<pageno>', methods=['POST', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def getpost(pageno):
        try:
            uuid = get_jwt_identity()
            user = Users.query.filter_by(uuid=uuid).first()
            if not user:
                return jsonify({'message': 'User not found'}), 401

            page = int(pageno)
            per_page = 10  # Number of posts per page
            
            posts = Posts.query.order_by(Posts.Time.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)

            if not posts.items:
                return jsonify({'message': 'No posts found'}), 404
            
            posts_data = [{
            'type': post.Type,
            'authour_pic_link':Users.query.filter_by(id=post.user_id).first().profile_pic_link or 'https://res.cloudinary.com/ddewjx05m/image/upload/v1750016658/f4njd5nzpc71kmrtwdte.jpg',
            'content': post.Content,
            'medialink': post.media_link,
            'author': post.Authour,
            'created_at': post.Time.isoformat(),
            } for post in posts.items]

            return jsonify({
            'posts': posts_data,
            'total_pages': posts.pages,
            'current_page': posts.page
            }), 200

        except Exception as e:
            print(f"Error fetching posts: {str(e)}")
            return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
    @app.route('/health')
    @cross_origin()
    def health():
        return jsonify({'status': 'healthy', 'message': 'Server is running'}), 200