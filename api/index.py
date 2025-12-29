from flask import Flask, jsonify
from flask_cors import CORS

# Load environment variables for the Flask (Python) backend.
# Next.js loads `.env.local` for itself, but the Flask process won't unless we do this.
# We try python-dotenv first, but fall back to a tiny parser so local dev works
# even if the current Python interpreter doesn't have python-dotenv installed.
import os


def _load_env_file(path: str, *, override: bool) -> None:
    if not os.path.exists(path):
        return

    try:
        with open(path, "r", encoding="utf-8") as f:
            for raw_line in f:
                line = raw_line.strip()
                if not line or line.startswith("#"):
                    continue

                # Support optional `export KEY=value` lines.
                if line.startswith("export "):
                    line = line[len("export ") :].lstrip()

                if "=" not in line:
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()

                # Strip wrapping quotes if present.
                if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
                    value = value[1:-1]

                if not key:
                    continue

                if not override and key in os.environ:
                    continue

                os.environ[key] = value
    except Exception:
        # If env loading fails, continue; downstream code will surface missing keys.
        return


try:
    from dotenv import load_dotenv  # type: ignore

    load_dotenv()  # loads .env if present
    load_dotenv(".env.local", override=True)  # allow local dev overrides
except Exception:
    _load_env_file(".env", override=False)
    _load_env_file(".env.local", override=True)
from api.routes import api
from api.user_routes import api as user_api
from api.admin_routes import admin_api
from api.rag_routes import rag_api

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(api)
app.register_blueprint(user_api)
app.register_blueprint(admin_api)
app.register_blueprint(rag_api)


# Global error handler to ensure JSON responses
@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({"error": str(e)}), 500


@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"
