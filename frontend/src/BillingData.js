import React, { useState, useEffect, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import BillingView from "./BillingView";

export default function BillingData() {
  const { instance, accounts } = useMsal();
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAccessToken = async () => {
    try {
      const tokenResponse = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["https://management.azure.com/.default"],
      });
      return tokenResponse.accessToken;
    } catch {
      const tokenResponse = await instance.acquireTokenPopup({
        scopes: ["https://management.azure.com/.default"],
      });
      return tokenResponse.accessToken;
    }
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();

      const apiBaseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:4280/api"
          : "/api";

      const res = await fetch(`${apiBaseUrl}/GetSubscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load subscriptions");

      const data = await res.json();
      setSubscriptions(data.subscriptions);
      if (data.subscriptions.length > 0)
        setSelectedSubscription(data.subscriptions[0].subscriptionId);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instance, accounts]);

  const fetchBillingData = useCallback(
    async (subscriptionId) => {
      if (!subscriptionId) return;
      try {
        setLoading(true);
        const token = await getAccessToken();

        const apiBaseUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:4280/api"
            : "/api";

        const res = await fetch(
          `${apiBaseUrl}/GetBillingData?subscriptionId=${subscriptionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok)
          throw new Error(`Failed to fetch billing data (${res.status})`);

        const data = await res.json();
        const rows = data.properties?.rows || [];
        const columns = data.properties?.columns?.map((c) => c.name) || [];

        const formatted = rows.map((row) => {
          const record = {};
          row.forEach((value, i) => (record[columns[i]] = value));

          let usageDate = record.UsageDate;
          if (typeof usageDate === "number") {
            const s = usageDate.toString();
            usageDate = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
          }

          return {
            date: usageDate,
            cost: parseFloat(record.PreTaxCost || 0),
          };
        });

        setBillingData(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [instance, accounts]
  );

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    if (selectedSubscription) {
      fetchBillingData(selectedSubscription);
    }
  }, [selectedSubscription, fetchBillingData]);

  return (
    <BillingView
      subscriptions={subscriptions}
      selectedSubscription={selectedSubscription}
      onSubscriptionChange={setSelectedSubscription}
      billingData={billingData}
      loading={loading}
      error={error}
      onRefresh={() => fetchBillingData(selectedSubscription)}
    />
  );
}
