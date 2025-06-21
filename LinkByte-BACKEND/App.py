from dotenv import load_dotenv
import os
import cloudinary # type: ignore
import cloudinary.uploader # type: ignore
import Routes
from Config import app,db
load_dotenv()
from flask_cors import CORS
CORS(app,origins=[os.getenv("FRONTEND_URL"),os.getenv("SOCKET_URL")])
from routes.auth_routes import auth_bp
from routes.msgs_routes import msg_bp
app.register_blueprint(msg_bp)
app.register_blueprint(auth_bp, url_prefix='/auth')
Routes.register_routes(app)
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)