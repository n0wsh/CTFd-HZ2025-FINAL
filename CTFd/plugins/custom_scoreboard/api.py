from flask_restx import Namespace, Resource

from CTFd.api import CTFd_API_v1
from CTFd.models import Teams, Solves
from CTFd.utils import get_config
from CTFd.utils.dates import ctf_started, ctf_ended

custom_scoreboard_namespace = Namespace(
    "custom", "Endpoint to retrieve custom scoreboard data"
)


@custom_scoreboard_namespace.route("/ctf-status")
class CTFStatus(Resource):
    @custom_scoreboard_namespace.doc(
        description="Get the current CTF status",
        responses={
            200: "Success",
        },
    )
    def get(self):
        return {
            "success": True,
            "data": {
                "started": ctf_started(),
                "ended": ctf_ended(),
                "startAt": get_config("start"),
                "endAt": get_config("end"),
            },
        }


@custom_scoreboard_namespace.route("/first-blood")
class FirstBlood(Resource):
    @custom_scoreboard_namespace.doc(
        description="Get the first blood of every challenge",
        responses={
            200: "Success",
        },
    )
    def get(self):
        solves = Solves.query.order_by(Solves.date.asc()).all()
        first_blood = {}
        for solve in solves:
            challenge_id = solve.challenge_id
            if challenge_id not in first_blood:
                first_blood[challenge_id] = {
                    "team_id": solve.team_id,
                    "team_name": solve.team.name,
                    "challenge_id": solve.challenge_id,
                    "challenge_name": solve.challenge.name,
                    "challenge_category": solve.challenge.category,
                }
        return {
            "success": True,
            "data": list(
                map(
                    lambda item: {
                        "team_id": item[1]["team_id"],
                        "team_name": item[1]["team_name"],
                        "challenge_id": item[0],
                        "challenge_name": item[1]["challenge_name"],
                        "challenge_category": item[1]["challenge_category"],
                    },
                    first_blood.items(),
                )
            ),
        }


@custom_scoreboard_namespace.route("/standings")
class Standings(Resource):
    @custom_scoreboard_namespace.doc(
        description="Get the current standings",
        responses={
            200: "Success",
        },
    )
    def get(self):
        teams = Teams.query.filter(Teams.banned == False, Teams.hidden == False).all()
        result = [None] * len(teams)

        teams_with_score = list(filter(lambda team: team.score > 0, teams))
        teams_without_score = list(
            sorted(
                filter(lambda team: team.score == 0, teams), key=lambda team: team.id
            )
        )
        for team in teams_with_score:
            place = team.get_place(numeric=True)

            last_submission = None
            if team.solves:
                # Get the latest solve
                last_solve = max(team.solves, key=lambda s: s.date)
                last_submission = {
                    "id": last_solve.id,
                    "date": last_solve.date.isoformat(),
                    "category": last_solve.challenge.category,
                }

            result[team.get_place(numeric=True) - 1] = {
                "id": team.id,
                "name": team.name,
                "score": team.score,
                "solves": len(team.solves),
                "fails": len(team.fails),
                "place": place,
                "lastSubmission": last_submission,
            }
        last_place = len(teams_with_score)
        for i in range(len(teams_without_score)):
            place = last_place + i + 1
            result[i + len(teams_with_score)] = {
                "id": teams_without_score[i].id,
                "name": teams_without_score[i].name,
                "score": teams_without_score[i].score,
                "solves": len(teams_without_score[i].solves),
                "fails": len(teams_without_score[i].fails),
                "place": place,
                "lastSubmission": None,
            }
        return {"success": True, "data": result}


def load_api():
    CTFd_API_v1.add_namespace(custom_scoreboard_namespace)
