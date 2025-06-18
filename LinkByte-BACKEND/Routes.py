from flask import jsonify, request
from flask_cors import cross_origin
from Model import Users,Otp,Posts,Reaction,Follower
from Config import db,jwt
from flask_jwt_extended import create_access_token,get_jwt_identity, jwt_required
import bcrypt,os# type: ignore
from Utility import is_valid_username,is_strong_password,genrate_otp
import cloudinary # type: ignore
import cloudinary.uploader# type: ignore
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload
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
        otp = genrate_otp(email,"VERIFY EMAIL")
        if otp == 404 :
            return jsonify({'message': 'Failed to generate OTP'}), 500
        expiry_time = datetime.now() + timedelta(minutes=10)  # OTP valid for 10 minutes
        otp_entry = Otp(user_id = user.id , otp=otp, expiry=expiry_time,purpose = "VERIFY EMAIL")
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

        otp_entry = Otp.query.filter_by(user_id=user.id, purpose="VERIFY EMAIL").order_by(Otp.expiry.desc()).first()
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
    @jwt_required()
    @cross_origin()
    def get_upld_url():
        uuid = get_jwt_identity()
        user = Users.query.filter_by(uuid = uuid).first()
        if not user:
            return jsonify({'message':'Invalid user'}),401
        try : 
            data = request.get_json()
            filetype = data.get('filetype')
            filesize = data.get('filesize')
            if filetype.startswith('video/') and filesize > 50 * 1024 * 1024: # 50 MB
                return jsonify({'message': 'Video file size cannot exceed 50MB.'}), 400
            if filetype.startswith('image/') and filesize > 10 * 1024 * 1024: # 10 MB
                return jsonify({'message': 'Image file size cannot exceed 10MB.'}), 400
            params_to_sign = {
                'timestamp': int(datetime.now().timestamp()),
                'folder': uuid
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
                'cloudinary_cloud_name':cloudinary.config().cloud_name,
                'folder':uuid
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
            # Validate and extract media link info
            media_link = data.get('media_link')
            public_id = None
            if media_link:
                try:
                    public_id = media_link.split('/')[-1].split('.')[0]
                    data['media_link'] = media_link
                except:
                    return jsonify({'message': 'Invalid media link format'}), 400
            # Create new post with validated data
            new_post = Posts(
                user_id=int(user.id),
                Type=data.get('type', 'text'),
                Content=data.get('content', ''),
                media_link=data.get('media_link'),
                public_id= public_id
            )

            db.session.add(new_post)
            db.session.commit()

            return jsonify({'message': 'Post created successfully'}), 201

        except Exception as e:
            print(f"Error creating post: {str(e)}")
            db.session.rollback()
            return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
    @app.route('/getposts/<pageno>', methods=['POST', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def getposts(pageno):
        try:
            uuid = get_jwt_identity()
            current_user = Users.query.filter_by(uuid=uuid).first()
            if not current_user:
                return jsonify({'message': 'User not found'}), 401

            page = int(pageno)
            per_page = 10

            posts_query = Posts.query.order_by(Posts.Time.desc()).options(db.joinedload(Posts.author))

            posts = posts_query.paginate(page=page, per_page=per_page, error_out=False)

            if not posts.items:
                return jsonify({'message': 'No posts found'}), 404

            posts_data = []
            for post in posts.items:
                author_username = post.author.username if post.author else "N/A"
                author_pic_link = post.author.profile_pic_link if post.author and post.author.profile_pic_link else 'https://placehold.co/600x600'

                total_reactions = post.reactions.count()

                current_user_reaction_type = None
                if current_user:
                    user_reaction = Reaction.query.filter_by(user_id=current_user.id, post_id=post.id).first()
                    if user_reaction:
                        current_user_reaction_type = user_reaction.emoji_type

                posts_data.append({
                    'type': post.Type,
                    'authour_pic_link': author_pic_link,
                    'content': post.Content,
                    'medialink': post.media_link,
                    'author': author_username,
                    'created_at': post.Time.isoformat(),
                    'post_uuid': post.uuid,
                    'total_reactions': total_reactions,
                    'current_user_reaction': current_user_reaction_type
                })

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
    
    @app.route('/myinfo' , methods=['GET', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def get_my_info():
        uuid = get_jwt_identity()
        user = Users.query.filter_by(uuid = uuid).first()
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        return jsonify({
            'followers':user.followers.count(),
            'following':user.following.count(),
            'username': user.username,
            'profile_pic': user.profile_pic_link or 'https://placehold.co/600x600',
            'banner_link':user.profile_bnr_link or 'https://placehold.co/600x600',
            'bio': user.bio or ""
        }), 200
    
    @app.route('/user/<username>', methods=['GET', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def get_user_info(username):
        if not username:
            return jsonify({'message':'username required'}),402
        uuid = get_jwt_identity()
        current_user = Users.query.filter_by(uuid = uuid).first()
        if not current_user:
            return jsonify({'message': 'Invalid token'}), 401
            
        user = Users.query.filter_by(username = username).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({
            'followers':user.followers.count(),
            'following':user.following.count(),
            'isself': username == current_user.username,
            'profile_pic': user.profile_pic_link or 'https://placehold.co/600x600',
            'banner_link':user.profile_bnr_link or 'https://placehold.co/600x600',
            'bio': user.bio or ""
        }), 200
        
    
    @app.route('/user/<username>/post/<pageno>', methods=['GET', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def get_user_post(username,pageno):
        try:
            uuid = get_jwt_identity()
            current_user = Users.query.filter_by(uuid=uuid).first()
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401

            user = Users.query.filter_by(username=username).first()
            if not user:
                return jsonify({'message': 'User not found'}), 404

            page = int(pageno)
            per_page = 10

            # Fetch posts for the specified user, eager load reactions
            posts_query = Posts.query.filter_by(user_id=user.id)\
                .order_by(Posts.Time.desc())

            posts = posts_query.paginate(page=page, per_page=per_page, error_out=False)


            posts_data = []
            for post in posts.items:
                total_reactions =  post.reactions.count() # Use len() on the loaded collection

                # Find current user's reaction
                current_user_reaction_type = None
                if current_user:
                    # Iterate over loaded reactions
                    for reaction in post.reactions:
                        if reaction.user_id == current_user.id:
                            current_user_reaction_type = reaction.emoji_type
                            break # Found the reaction, no need to continue

                posts_data.append({
                    'type': post.Type or 'text',
                    'authour_pic_link': user.profile_pic_link or 'https://res.cloudinary.com/ddewjx05m/image/upload/v1750016658/f4njd5nzpc71kmrtwdte.jpg',
                    'content': post.Content,
                    'medialink': post.media_link,
                    'author': user.username,
                    'created_at': post.Time.isoformat(),
                    'post_uuid': post.uuid,
                    'total_reactions': total_reactions,
                    'current_user_reaction': current_user_reaction_type
                })

            return jsonify({
                'posts': posts_data,
                'total_pages': posts.pages,
                'current_page': posts.page
            }), 200

        except Exception as e:
            print(f"Error fetching user posts: {str(e)}")
            return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
    @app.route('/user/edit', methods=["PATCH", "OPTIONS"])
    @app.route('/user/edit', methods=["PATCH", "OPTIONS"])
    @jwt_required()
    @cross_origin()
    def edit_user():
        try:
            uuid = get_jwt_identity()
            user = Users.query.filter_by(uuid=uuid).first()
            
            if not user:
                return jsonify({'message': 'User not found'}), 404

            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400

            if 'username' in data:
                new_username = data['username']
                if not is_valid_username(new_username):
                    return jsonify({'message': 'Invalid username format'}), 400
                existing_user = Users.query.filter_by(username=new_username).first()
                if existing_user and existing_user.id != user.id:
                    return jsonify({'message': 'Username already taken'}), 400
                user.username = new_username

            if 'bio' in data:
                user.bio = data['bio']

            if 'profile_pic_link' in data:
                if user.profile_pic_link:
                    try:
                        old_public_id = user.profile_pic_link.split('/')[-1].split('.')[0]
                        cloudinary.uploader.destroy(old_public_id)
                    except Exception as e:
                        print(f"Error deleting old profile picture: {str(e)}")
                user.profile_pic_link = data['profile_pic_link']

            if 'banner_link' in data:
                if user.profile_bnr_link:
                    try:
                        old_public_id = user.profile_bnr_link.split('/')[-1].split('.')[0]
                        cloudinary.uploader.destroy(old_public_id)
                    except Exception as e:
                        print(f"Error deleting old banner: {str(e)}")
                user.profile_bnr_link = data['banner_link']

            db.session.commit()
            return jsonify({
                'message': 'Profile updated successfully',
                'username': user.username,
                'bio': user.bio,
                'profile_pic_link': user.profile_pic_link,
                'banner_link': user.profile_bnr_link
            }), 200

        except Exception as e:
            print(f"Error updating user profile: {str(e)}")
            db.session.rollback()
            return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
        
    @app.route('/like/<post_id>',methods=['POST', "OPTIONS"])
    @jwt_required()
    @cross_origin()
    def like_post(post_id):
        uuid = get_jwt_identity()
        user = Users.query.filter_by(uuid=uuid).first()
            
        if not user:
            return jsonify({'message': 'User not found'}), 404

        data = request.get_json()
        rxn = data.get('reaction')
        post = Posts.query.filter_by(uuid = post_id).first()
        if not rxn in ['Like'] or not post:
            return jsonify({'message': 'invalid request'}), 401
        reacn = Reaction.query.filter_by(post_id = post.id , user_id = user.id).first()
        if reacn:
            db.session.delete(reacn)
            db.session.commit()
            return jsonify({'message': 'unliked post'}), 200
        new = Reaction(
            post_id = post.id , user_id = user.id, emoji_type = rxn
        )
        db.session.add(new)
        db.session.commit()
        return jsonify({'message': 'success'}), 200
    @app.route('/follow/<username>', methods=['POST', "OPTIONS"])
    @jwt_required()
    @cross_origin()
    def followusername(username):
        try:
            uuid = get_jwt_identity()
            follower = Users.query.filter_by(uuid=uuid).first()
            
            if not follower:
                return jsonify({'message': 'Invalid token'}), 401
    
            followed = Users.query.filter_by(username=username).first()
            if not followed:
                return jsonify({'message': 'User not found'}), 404
    
            if follower.id == followed.id:
                return jsonify({'message': 'Cannot follow yourself'}), 400
    
            existing_follow = Follower.query.filter_by(
                follower_id=follower.id,
                followed_id=followed.id
            ).first()

            if existing_follow:
                # Unfollow
                db.session.delete(existing_follow)
                db.session.commit()
                return jsonify({
                    'message': 'Unfollowed successfully',
                    'action': 'unfollow',
                }), 200
            else:
                new_follow = Follower(
                    follower_id=follower.id,
                    followed_id=followed.id
                )
                db.session.add(new_follow)
                db.session.commit()
                return jsonify({
                    'message': 'Followed successfully',
                    'action': 'follow',
                }), 200

        except Exception as e:
            print(f"Error in follow operation: {str(e)}")
            db.session.rollback()
            return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
    @app.route('/user/<username>/followers', methods=['GET', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def get_followers(username):
        user = Users.query.filter_by(username=username).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        followers = [
            {
                'username': follower.follower_user.username,
                'profile_pic': follower.follower_user.profile_pic_link or 'https://placehold.co/600x600'
            }
            for follower in user.followers
        ]
        return jsonify({'followers': followers, 'count': len(followers)}), 200

    @app.route('/user/<username>/following', methods=['GET', 'OPTIONS'])
    @jwt_required()
    @cross_origin()
    def get_following(username):
        user = Users.query.filter_by(username=username).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        following = [
            {
                'username': follow.followed_user.username,
                'profile_pic': follow.followed_user.profile_pic_link or 'https://placehold.co/600x600'
            }
            for follow in user.following
        ]
        return jsonify({'following': following, 'count': len(following)}), 200