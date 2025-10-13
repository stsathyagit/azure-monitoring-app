import json
import requests
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Tenant-level Azure Cost Management query."""
    access_token = req.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return func.HttpResponse("Missing access token", status_code=401)

    # Tenant-level scope URL (no subscription ID)
    url = "https://management.azure.com/providers/Microsoft.CostManagement/query?api-version=2023-03-01"

    # Example payload: aggregate actual cost, group by subscription
    payload = {
        "type": "ActualCost",
        "timeframe": "MonthToDate",
        "dataset": {
            "granularity": "Daily",
            "aggregation": {
                "totalCost": {"name": "PreTaxCost", "function": "Sum"}
            },
            "grouping": [
                {"type": "Dimension", "name": "SubscriptionName"}
            ]
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    resp = requests.post(url, headers=headers, json=payload)

    # Pass Azure API errors straight through
    if not resp.ok:
        return func.HttpResponse(resp.text, status_code=resp.status_code, mimetype="application/json")

    data = resp.json()
    return func.HttpResponse(json.dumps(data), status_code=200, mimetype="application/json")
