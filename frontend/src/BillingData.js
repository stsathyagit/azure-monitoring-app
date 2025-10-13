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
      setLoading(true);
      setError(null);

      const tokenResponse = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["https://management.azure.com/.default"],
      });
      const accessToken = tokenResponse.accessToken;

      const response = await fetch("/api/GetBillingData", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch billing data");

      const data = await response.json();

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
