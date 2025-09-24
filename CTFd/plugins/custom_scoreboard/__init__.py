from functools import wraps
from unicodedata import name
from flask import Response, request

from CTFd.models import Challenges, Submissions

from CTFd.utils.user import get_current_team
from CTFd.utils.dates import ctftime

from .config import config
from .webhook import CustomScoreboardWebhook
from .api import load_api


def load(app):
    config(app)

    if not app.config.get("SCOREBOARD_WEBHOOK_URL"):
        print("[CUSTOM SCOREBOARD] Webhook URL not set. Plugin disabled.")
        return

    webhook = CustomScoreboardWebhook(
        app.config["SCOREBOARD_WEBHOOK_URL"], app.config["SCOREBOARD_WEBHOOK_SECRET"]
    )

    app.db.create_all()
    load_api()

    def challenge_attempt_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            result = f(*args, **kwargs)
            print("result:", result)

            if not ctftime():
                return result

            data = {}
            if isinstance(result, Response):
                try:
                    # silent=True ensures it returns None instead of raising errors
                    data = result.get_json(silent=True) or {}
                except Exception as e:
                    print(f"Error parsing JSON: {e}")

            success = False
            print("data:", data)
            if (
                isinstance(data, dict)
                and data.get("success") is True
                and isinstance(data.get("data"), dict)
            ):
                success = data.get("data").get("status") == "correct"

            team = get_current_team()

            request_data = request.get_json() if request.is_json else request.form
            print("request_data:", request_data)
            challenge_id = request_data.get("challenge_id")
            print("challenge_id:", challenge_id)

            challenge_category = None
            challenge_name = None
            submission_date = None

            if challenge_id:
                chal = Challenges.query.filter_by(id=challenge_id).first()
                if chal:
                    challenge_category = chal.category
                    challenge_name = chal.name

                last_submission = (
                    Submissions.query.filter_by(
                        account_id=team.id, challenge_id=challenge_id
                    )
                    .order_by(Submissions.date.desc())
                    .first()
                )
                if last_submission:
                    submission_date = last_submission.date

            submission_date_str = (
                submission_date.isoformat() if submission_date else None
            )

            success = (
                isinstance(data, dict)
                and isinstance(data.get("data"), dict)
                and data["data"].get("status") == "correct"
            )

            webhook.send_payload(
                {
                    "type": "submission",
                    "success": success,
                    "team": {"id": team.id, "name": team.name},
                    "challenge": {
                        "id": challenge_id,
                        "name": challenge_name,
                        "category": challenge_category,
                    },
                    "submission": {"date": submission_date_str},
                }
            )
            return result

        return wrapper

    # Wrap the existing challenge submission route
    app.view_functions["api.challenges_challenge_attempt"] = (
        challenge_attempt_decorator(
            app.view_functions["api.challenges_challenge_attempt"]
        )
    )
