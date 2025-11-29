from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import api
from api.user_routes import api as user_api
from api.admin_routes import admin_api

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

app.register_blueprint(api)
app.register_blueprint(user_api)
app.register_blueprint(admin_api)

# Global error handler to ensure JSON responses
@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({"error": str(e)}), 500

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"