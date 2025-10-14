import logging
import azure.functions as func
import requests
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("GetSubscriptions function triggered.")

    auth_header = req.headers.get("Authorization")
    if not auth_header:
        return func.HttpResponse(
            json.dumps({"error": "Missing Authorization header"}),
            status_code=401,
            mimetype="application/json"
        )

    token = auth_header.replace("Bearer ", "").strip()

    # Azure REST API to list subscriptions
    url = "https://management.azure.com/subscriptions?api-version=2020-01-01"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        # Extract only what we need
        subscriptions = [
            {
                "subscriptionId": sub["subscriptionId"],
                "displayName": sub["displayName"]
            }
            for sub in data.get("value", [])
        ]

        return func.HttpResponse(
            json.dumps({"subscriptions": subscriptions}),
            mimetype="application/json",
            status_code=200
        )

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching subscriptions: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )
