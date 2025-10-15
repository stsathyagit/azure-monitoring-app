import json
import requests
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Subscription-level Azure Cost Management query with graceful fallback."""
    access_token = req.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return func.HttpResponse("Missing access token", status_code=401)

    # ✅ Use a stable API version
    url = (
        "https://management.azure.com/subscriptions/"
        "c02d2716-78ec-4e2c-8623-f2fe6b6f51cd/providers/"
        "Microsoft.CostManagement/query?api-version=2023-03-01"
    )

    # ✅ Simplified payload: daily costs for current month (no grouping)
    payload = {
        "type": "ActualCost",
        "timeframe": "MonthToDate",
        "dataset": {
            "granularity": "Daily",
            "aggregation": {
                "totalCost": {
                    "name": "PreTaxCost",
                    "function": "Sum"
                }
            }
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # ✅ Call Azure Cost Management API
    resp = requests.post(url, headers=headers, json=payload)

    # ✅ Handle errors directly
    if not resp.ok:
        print(f"Azure API error: {resp.status_code} {resp.text}")
        return func.HttpResponse(resp.text, status_code=resp.status_code, mimetype="application/json")

    try:
        data = resp.json()
    except Exception as ex:
        print(f"Error parsing JSON: {ex}")
        return func.HttpResponse("Failed to parse Azure response", status_code=500)

    # ✅ Handle empty or missing rows gracefully
    props = data.get("properties", {})
    rows = props.get("rows", [])
    if not rows:
        print("No cost data found for current timeframe.")
        message = {
            "message": "No cost data found for the current month.",
            "properties": props
        }
        return func.HttpResponse(json.dumps(message), status_code=200, mimetype="application/json")

    # ✅ Optional debug log for non-empty response
    print(f"Received {len(rows)} billing records from Azure API")

    return func.HttpResponse(json.dumps(data), status_code=200, mimetype="application/json")
