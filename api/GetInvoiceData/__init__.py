import json
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    data = {
        "properties": {
            "columns": [{"name": "UsageDate"}, {"name": "Cost"}],
            "rows": [
                ["2025-09-01", 20.5],
                ["2025-09-02", 15.8]
            ]
        }
    }

    return func.HttpResponse(
        json.dumps(data),
        mimetype="application/json"
    )
