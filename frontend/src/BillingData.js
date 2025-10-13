import React, { useState, useEffect, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function BillingData() {
  const { instance, accounts } = useMsal();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBillingData = useCallback(async () => {
    try {
      console.log("[BillingData] fetchBillingData start");
      setLoading(true);
      setError(null);

      if (!accounts || accounts.length === 0) {
        console.warn("[BillingData] no signed-in account");
        throw new Error("No signed-in account found.");
      }

      let accessToken;
      try {
        console.log("[BillingData] trying acquireTokenSilent for account:", accounts[0]?.username);
        const tokenResponse = await instance.acquireTokenSilent({
          account: accounts[0],
          scopes: ["https://management.azure.com/.default"],
        });
        accessToken = tokenResponse?.accessToken;
        console.log("[BillingData] acquired token silently:", accessToken ? `${accessToken.slice(0,20)}...` : "NO TOKEN");
      } catch (silentError) {
        console.warn("[BillingData] acquireTokenSilent failed:", silentError);
        try {
          console.log("[BillingData] falling back to acquireTokenPopup");
          const tokenResponse = await instance.acquireTokenPopup({
            scopes: ["https://management.azure.com/.default"],
          });
          accessToken = tokenResponse?.accessToken;
          console.log("[BillingData] acquired token via popup:", accessToken ? `${accessToken.slice(0,20)}...` : "NO TOKEN");
        } catch (popupError) {
          console.error("[BillingData] acquireTokenPopup failed:", popupError);
          throw popupError;
        }
      }

      // ✅ Use absolute URL when running locally
      const apiBaseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:4280/api"
          : "/api";

      // ✅ Send Authorization header properly
      console.log("[BillingData] sending fetch to", `${apiBaseUrl}/GetBillingData`);
      console.log("[BillingData] Authorization header set:", accessToken ? "YES" : "NO");
      console.log("Sending token:", accessToken ? accessToken.slice(0, 25) + "..." : "NO TOKEN");
      const response = await fetch(`${apiBaseUrl}/GetBillingData`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch billing data (${response.status})`);

      const data = await response.json();

      // ✅ Normalize Azure Cost Management API data
      const rows = data.properties?.rows || [];
      const columns = data.properties?.columns?.map((c) => c.name) || [];

      const formatted = rows.map((row) => {
        const record = {};
        row.forEach((value, i) => {
          record[columns[i]] = value;
        });
        return {
          date:
            record.UsageDate ||
            record.UsageDateTime ||
            record.UsageDateKey ||
            record.Date ||
            "Unknown",
          cost: parseFloat(record.PreTaxCost || record.Cost || record.totalCost || 0),
        };
      });

      setBillingData(formatted);
    } catch (err) {
      console.error("Error fetching billing data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instance, accounts]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Azure Billing Data</h2>
      <button
        onClick={fetchBillingData}
        disabled={loading}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Loading..." : "Refresh"}
      </button>

      {error && <p className="text-red-600 mt-3">Error: {error}</p>}

      {!loading && billingData && billingData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h3 className="text-lg font-medium mb-2">Daily Cost Breakdown</h3>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={billingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#0078d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && (!billingData || billingData.length === 0) && (
        <p className="text-gray-600 mt-3">No billing data available.</p>
      )}
    </div>
  );
}
