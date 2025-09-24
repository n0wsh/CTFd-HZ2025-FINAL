from os import environ


# Adapted from https://github.com/sigpwny/ctfd-discord-webhook-plugin/blob/master/config.py
def config(app):
    """
    Webhook URL to send data to. Set to None to disable plugin entirely.
    """
    app.config["SCOREBOARD_WEBHOOK_URL"] = environ.get("SCOREBOARD_WEBHOOK_URL")
    """
	Webhook signing secret. Signature will be included in X-Scoreboard-Signature header.
	"""
    app.config["SCOREBOARD_WEBHOOK_SECRET"] = environ.get("SCOREBOARD_WEBHOOK_SECRET")
