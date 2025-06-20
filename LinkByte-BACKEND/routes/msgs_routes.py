from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token
from Model import Users, Message
from Config import db,jwt
from flask_jwt_extended import create_access_token,get_jwt_identity, jwt_required
from Utility import encrypt,decrypt
from datetime import datetime, timedelta
from sqlalchemy import or_,and_

msg_bp = Blueprint('msg', __name__)

@msg_bp.route('/messages/<username>', methods=['GET'])
@jwt_required()
@cross_origin()
def handle_messages(username):
    uuid = get_jwt_identity()
    user = Users.query.filter_by(uuid=uuid).first()
    target = Users.query.filter_by(username=username).first()
    if not target:
        return jsonify({'message': 'User not found'}), 404

    page_no = int(request.args.get("page", 1))
    msgs = Message.query.filter(
        or_(
            and_(Message.sender_id == user.id, Message.reciver_id == target.id),
            and_(Message.sender_id == target.id, Message.reciver_id == user.id)
        )
    ).order_by(Message.timestamp.desc()).paginate(page=page_no, per_page=20, error_out=False)

    return jsonify({
        "messages": [
            {
                "msg": decrypt(m.encrypted_data),
                "timestamp": m.timestamp.isoformat(),
                "from": "you" if m.sender_id == user.id else target.username
            } for m in msgs.items
        ],
        "current_page": msgs.page,
        "total_pages": msgs.pages
    }), 200
    
@msg_bp.route('/user_to_show_dm',methods = ["GET" , "OPTIONS"])
@jwt_required()
@cross_origin()
def get_dm_persons():
    current_user_id = Users.query.filter_by(uuid = get_jwt_identity()).first().id
    latest_messages = db.session.execute(
    db.text("""
        SELECT DISTINCT ON (CASE
            WHEN sender_id = :uid THEN reciver_id
            ELSE sender_id
        END) *
        FROM messages
        WHERE sender_id = :uid OR reciver_id = :uid
        ORDER BY 
            CASE
                WHEN sender_id = :uid THEN reciver_id
                ELSE sender_id
            END,
            timestamp DESC
        """), {"uid": current_user_id}
    ).fetchall()
    users = []
    for row in latest_messages:
        other_id = row[2] if row[1] == current_user_id else row[1]
        other_user = Users.query.get(other_id)
        if other_user:
            users.append({
                "from": "you" if other_user.id == current_user_id else other_user.username,
                "profile_pic":other_user.profile_pic_link,
                "username": other_user.username,
                "uuid": other_user.uuid,
                "last_message": decrypt(row[3]),
                "timestamp": row[4].isoformat()
            })
    return jsonify(users), 200

    
@msg_bp.route('/api/messages',methods = ["POST" , "OPTIONS"])
@cross_origin(origins=["http://127.0.0.1:8000"])
def message_api():
    data = request.get_json()
    u1=data.get('from')
    u2=data.get('to')
    text = data.get('message')
    if text and u1 and u2:
        u1_obj = Users.query.filter_by(uuid=u1).first()
        u2_obj = Users.query.filter_by(uuid=u2).first()
        print(u1,u2,u1_obj,u2_obj)
        if not u1_obj or not u2_obj:
            return jsonify({'message': 'User(s) not found'}), 404

        encrypted_msg = encrypt(text)
        new_msg = Message(
            sender_id=u1_obj.id,
            reciver_id=u2_obj.id,
            encrypted_data=encrypted_msg,
            timestamp=datetime.now()
        )
        db.session.add(new_msg)
        db.session.commit()
        return jsonify({'message': 'Message sent successfully' , 'reciver':u2_obj.username}), 201
    else : 
        return jsonify({'message':'incomplete data'}),401
