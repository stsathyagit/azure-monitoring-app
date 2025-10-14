import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function BillingView({
  subscriptions,
  selectedSubscription,
  onSubscriptionChange,
  billingData,
  loading,
  error,
  onRefresh,
}) {
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (billingData.length > 0) {
      setSelectedDate(billingData[0].date);
    }
  }, [billingData]);

  const selectedDayCost =
    billingData.find((d) => d.date === selectedDate)?.cost ?? null;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Azure Billing Data</h2>

      <div className="flex items-center gap-3 mb-3">
        {/* Subscription dropdown */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Select Subscription:
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={selectedSubscription}
            onChange={(e) => onSubscriptionChange(e.target.value)}
          >
            {subscriptions.map((sub) => (
              <option key={sub.subscriptionId} value={sub.subscriptionId}>
                {sub.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Date dropdown */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Select Date:
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {billingData.map((item, index) => (
              <option key={index} value={item.date}>
                {item.date}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="mt-5 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">Error: {error}</p>}

      {!loading && billingData?.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h3 className="text-lg font-medium mb-2">
            Daily Cost Breakdown for{" "}
            <span className="text-blue-700 font-semibold">
              {subscriptions.find((s) => s.subscriptionId === selectedSubscription)
                ?.displayName || ""}
            </span>
          </h3>

          {/* Selected day's cost */}
          {selectedDayCost !== null && (
            <div className="mb-4 text-gray-800 font-medium">
              Cost for <span className="text-blue-700">{selectedDate}</span>:{" "}
              <span className="text-green-700">£{selectedDayCost.toFixed(6)}</span>
            </div>
          )}

          {/* Chart */}
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={billingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toFixed(6)}`} />
                <Bar dataKey="cost" fill="#0078d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
