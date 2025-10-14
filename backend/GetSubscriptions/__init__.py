import azure.functions as func
import requests
import json
import logging

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("GetSubscriptions triggered")

    token = req.headers.get("Authorization")
    if not token:
        logging.error("Missing Authorization header")
        return func.HttpResponse(
            json.dumps({"error": "Missing Authorization header"}),
            mimetype="application/json",
            status_code=401
        )

    logging.info(f"Header length: {len(token)}")
    try:
        url = "https://management.azure.com/subscriptions?api-version=2020-01-01"
        resp = requests.get(url, headers={"Authorization": token})
        logging.info(f"ARM response status: {resp.status_code}")
        logging.info(f"ARM response text: {resp.text[:200]}")  # truncate long response

        # if ARM fails, raise it to catch block
        resp.raise_for_status()

        return func.HttpResponse(
            resp.text, mimetype="application/json", status_code=200
        )

    except Exception as e:
        logging.exception("Error in GetSubscriptions")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )
