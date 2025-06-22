from dotenv import load_dotenv
import os
import cloudinary # type: ignore
import cloudinary.uploader # type: ignore
import Routes
from Config import app,db
load_dotenv()
from flask_cors import CORS
CORS(app)
from routes.auth_routes import auth_bp
from routes.msgs_routes import msg_bp
app.register_blueprint(msg_bp)
app.register_blueprint(auth_bp, url_prefix='/auth')
Routes.register_routes(app)
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
