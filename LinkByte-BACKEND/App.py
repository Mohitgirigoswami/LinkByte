from dotenv import load_dotenv
import os
import cloudinary # type: ignore
import cloudinary.uploader # type: ignore
import Routes
from Config import app,db
load_dotenv()
from flask_cors import CORS
CORS(app)


Routes.register_routes(app)
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)