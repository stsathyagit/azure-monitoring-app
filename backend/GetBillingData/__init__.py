import logging
import requests
import json
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Billing data request received (delegated access).')

    try:
        # Get the token from the frontend request
        auth_header = req.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

        access_token = auth_header.split(" ")[1]

        # Replace with your subscription ID
        subscription_id = "YOUR_SUBSCRIPTION_ID"

        url = f"https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.CostManagement/query?api-version=2023-03-01"
        body = {
            "type": "Usage",
            "timeframe": "MonthToDate",
            "dataset": {
                "granularity": "Daily",
                "aggregation": {
                    "totalCost": {"name": "PreTaxCost", "function": "Sum"}
                }
            }
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        response = requests.post(url, headers=headers, data=json.dumps(body))
        if response.status_code != 200:
            logging.error(f"Azure API error: {response.text}")
            return func.HttpResponse(f"Failed to fetch billing data: {response.text}", status_code=response.status_code)

        return func.HttpResponse(response.text, mimetype="application/json")

    except Exception as e:
        logging.exception("Error retrieving billing data.")
        return func.HttpResponse(str(e), status_code=500)
