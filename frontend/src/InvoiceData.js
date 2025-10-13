import React, { useState, useEffect, useCallback } from "react";
import { useMsal } from "@azure/msal-react";

export default function InvoiceData() {
  const { instance, accounts } = useMsal();
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoiceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Acquire Azure token
      const tokenResponse = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["https://management.azure.com/.default"],
      });
      const accessToken = tokenResponse.accessToken;

      // Replace with your backend API endpoint if you create one for invoice
      const response = await fetch("/api/GetInvoiceData", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch invoice data");

      const data = await response.json();

      // Expecting data format similar to [{month: "2025-09", total: 123.45}, ...]
      const formatted = data.map((item) => ({
        month: item.month,
        total: parseFloat(item.total).toFixed(2),
      }));

      setInvoiceData(formatted);
    } catch (err) {
      console.error("Error fetching invoice data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instance, accounts]);

  useEffect(() => {
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-3">Monthly Invoices</h2>
      <button
        onClick={fetchInvoiceData}
        disabled={loading}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Loading..." : "Refresh"}
      </button>

      {error && <p className="text-red-600 mt-3">Error: {error}</p>}

      {!loading && invoiceData.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left py-2 px-4 border-b border-gray-200 font-medium text-gray-700">
                  Invoice Month
                </th>
                <th className="text-left py-2 px-4 border-b border-gray-200 font-medium text-gray-700">
                  Total Amount ($)
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-gray-100">{item.month}</td>
                  <td className="py-2 px-4 border-b border-gray-100">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && invoiceData.length === 0 && !error && (
        <p className="text-gray-600 mt-3">No invoice data available.</p>
      )}
    </div>
  );
}
