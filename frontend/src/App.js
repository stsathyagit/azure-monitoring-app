import React, { useState, useEffect } from "react";
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

function BillingData() {
  const { instance, accounts } = useMsal();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBillingData = async () => {
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

      // Parse Azure Cost Management API response
      const rows = data.properties.rows || [];
      const columns = data.properties.columns.map((c) => c.name);

      // Convert to usable data for chart
      const formatted = rows.map((row) => {
        const record = {};
        row.forEach((value, i) => {
          record[columns[i]] = value;
        });
        return {
          date: record.UsageDate || record.UsageDateTime || record.UsageDateKey || record.UsageDate_1,
          cost: record.PreTaxCost || record.Cost || record.totalCost || 0,
        };
      });

      setBillingData(formatted);
    } catch (err) {
      console.error("Error fetching billing data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Azure Billing Data</h2>
      <button onClick={fetchBillingData} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && billingData && billingData.length > 0 && (
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            marginTop: 20,
          }}
        >
          <h3 style={{ marginBottom: 12 }}>Daily Cost Breakdown</h3>
          <div style={{ width: "100%", height: 400 }}>
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


      {!loading && !billingData && <p>No billing data available.</p>}
    </div>
  );
}

export default BillingData;
