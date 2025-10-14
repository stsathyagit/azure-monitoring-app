import azure.functions as func
import requests
import json
import logging

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("GetSubscriptions function triggered.")
    
    auth_header = req.headers.get("Authorization")
    if not auth_header:
        logging.error("Missing Authorization header")
        return func.HttpResponse(
            json.dumps({"error": "Missing Authorization header"}),
            status_code=401,
            mimetype="application/json"
        )

    logging.info(f"Authorization header length: {len(auth_header)}")
    logging.info(f"Authorization header (first 50 chars): {auth_header[:50]}")

    url = "https://management.azure.com/subscriptions?api-version=2020-01-01"
    headers = {
        "Authorization": auth_header,
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        logging.info(f"ARM response status: {response.status_code}")
        if response.status_code != 200:
            logging.error(f"ARM response body: {response.text}")
            response.raise_for_status()

        data = response.json()
        subscriptions = [
            {"subscriptionId": s["subscriptionId"], "displayName": s["displayName"]}
            for s in data.get("value", [])
        ]

        return func.HttpResponse(
            json.dumps({"subscriptions": subscriptions}),
            mimetype="application/json",
            status_code=200
        )
    except Exception as e:
        logging.exception("Error in GetSubscriptions")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
