import React, { useState, useEffect, useCallback } from "react";
import { 
  useMsal, 
  AuthenticatedTemplate
} from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./HomePage.css";

// Provider Selection Component
function ProviderSelector({ selectedProviders, onProviderToggle }) {
  const providers = [
    { id: 'azure', name: 'Azure', icon: '☁️', color: '#0078d4' },
    { id: 'aws', name: 'AWS', icon: '🟠', color: '#ff9500' },
    { id: 'gcp', name: 'Google Cloud', icon: '🟢', color: '#34a853' }
  ];

  return (
    <div className="provider-selector">
      <h3>Select Cloud Providers</h3>
      <div className="provider-options">
        {providers.map(provider => (
          <button
            key={provider.id}
            className={`provider-option ${selectedProviders.includes(provider.id) ? 'selected' : ''}`}
            onClick={() => onProviderToggle(provider.id)}
            style={{ borderColor: selectedProviders.includes(provider.id) ? provider.color : '#e5e7eb' }}
          >
            <span className="provider-icon">{provider.icon}</span>
            <span className="provider-name">{provider.name}</span>
            {selectedProviders.includes(provider.id) && <span className="checkmark">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// Azure Authentication Component
function AzureAuth({ onConnected }) {
  const { instance } = useMsal();
  
  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      onConnected();
    } catch (error) {
      console.error('Azure login failed:', error);
    }
  };

  return (
    <div className="provider-auth">
      <div className="auth-card azure-auth">
        <div className="auth-icon">☁️</div>
        <h3>Connect to Azure</h3>
        <p>Sign in with your Azure account to access billing data</p>
        <button className="btn btn-primary" onClick={handleLogin}>
          <span className="btn-icon">🔐</span>
          Sign in to Azure
        </button>
      </div>
    </div>
  );
}

// Azure Billing Component
function AzureBilling({ subscriptions, selectedSubscription, onSubscriptionChange, billingData, loading }) {
  const totalCost = billingData.reduce((sum, item) => sum + item.cost, 0);
  
  return (
    <div className="azure-billing">
      <div className="billing-controls">
        <div className="subscription-selector">
          <label>Azure Subscription:</label>
          <select
            value={selectedSubscription}
            onChange={(e) => onSubscriptionChange(e.target.value)}
            className="subscription-select"
          >
            {subscriptions.map((sub) => (
              <option key={sub.subscriptionId} value={sub.subscriptionId}>
                {sub.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading Azure billing data...</div>
      ) : (
        <div className="billing-summary">
          <div className="total-cost">
            <span className="cost-label">Total Azure Costs</span>
            <span className="cost-amount">£{totalCost.toFixed(2)}</span>
          </div>
          
          <div className="daily-breakdown">
            <h4>Daily Costs</h4>
            <div className="daily-list">
              {billingData.map((item, index) => (
                <div key={index} className="daily-item">
                  <span className="date">{item.date}</span>
                  <span className="cost">£{item.cost.toFixed(6)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogoutButton() {
  const { instance } = useMsal();
  return (
    <button 
      className="btn btn-outline btn-sm"
      onClick={() => instance.logoutPopup()}
    >
      Sign out
    </button>
  );
}

function Profile() {
  const { accounts } = useMsal();
  const account = accounts && accounts[0];
  if (!account) return null;
  
  return (
    <div className="profile-info">
      <p className="profile-email">{account.username}</p>
      <p className="profile-name">{account.name}</p>
    </div>
  );
}

export default function HomePage() {
  const { instance, accounts } = useMsal();
  const [selectedProviders, setSelectedProviders] = useState(['azure']);
  const [isLoading, setIsLoading] = useState(false);
  
  // Azure billing state
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [azureBillingData, setAzureBillingData] = useState([]);
  const [azureLoading, setAzureLoading] = useState(false);
  const [azureError, setAzureError] = useState(null);

  const handleProviderToggle = (providerId) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (selectedProviders.includes('azure') && selectedSubscription) {
      fetchAzureBillingData(selectedSubscription);
    }
    setTimeout(() => setIsLoading(false), 500);
  };

  // Azure API functions
  const getAccessToken = useCallback(async () => {
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
  }, [instance, accounts]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setAzureLoading(true);
      const token = await getAccessToken();

      const apiBaseUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:7071/api"
        : "https://func-azure-monitoring-demo.azurewebsites.net/api";

      const res = await fetch(`${apiBaseUrl}/GetSubscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to load subscriptions");

      const data = await res.json();
      const subs = data.value || [];
      setSubscriptions(subs);
      
      if (subs.length > 0) {
        setSelectedSubscription(subs[0].subscriptionId);
      }
    } catch (err) {
      console.error(err);
      setAzureError(err.message);
    } finally {
      setAzureLoading(false);
    }
  }, [getAccessToken]);

  const fetchAzureBillingData = useCallback(async (subscriptionId) => {
    if (!subscriptionId) return;
    
    try {
      setAzureLoading(true);
      const token = await getAccessToken();

      const apiBaseUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:7071/api"
        : "https://func-azure-monitoring-demo.azurewebsites.net/api";

      const res = await fetch(
        `${apiBaseUrl}/GetBillingData?subscriptionId=${subscriptionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`Failed to fetch billing data (${res.status})`);

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

      setAzureBillingData(formatted);
    } catch (err) {
      setAzureError(err.message);
    } finally {
      setAzureLoading(false);
    }
  }, [getAccessToken]);

  // Effects
  useEffect(() => {
    if (accounts.length > 0 && selectedProviders.includes('azure')) {
      fetchSubscriptions();
    }
  }, [accounts, selectedProviders, fetchSubscriptions]);

  useEffect(() => {
    if (selectedSubscription && selectedProviders.includes('azure')) {
      fetchAzureBillingData(selectedSubscription);
    }
  }, [selectedSubscription, selectedProviders, fetchAzureBillingData]);

  // Calculate costs
  const azureTotalCost = azureBillingData.reduce((sum, item) => sum + item.cost, 0);
  const awsCost = 0; // Placeholder for AWS
  const gcpCost = 0; // Placeholder for GCP
  const totalCost = azureTotalCost + awsCost + gcpCost;

  // Prepare chart data
  const chartData = azureBillingData.map(item => ({
    date: item.date,
    Azure: item.cost,
    AWS: 0, // Placeholder
    GoogleCloud: 0 // Placeholder
  }));

  const isAuthenticated = accounts.length > 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">☁️</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Cloud Billing Extractor</h1>
              <p className="header-subtitle">Multi-cloud cost management dashboard</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-header"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <span className={`refresh-icon ${isLoading ? 'spinning' : ''}`}>🔄</span>
              Refresh
            </button>
            <button className="btn btn-header">
              <span className="btn-icon">⚙️</span>
              Settings
            </button>
            
            <AuthenticatedTemplate>
              <Profile />
              <LogoutButton />
            </AuthenticatedTemplate>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Provider Selection */}
          <ProviderSelector 
            selectedProviders={selectedProviders}
            onProviderToggle={handleProviderToggle}
          />

          {/* Azure Authentication */}
          {selectedProviders.includes('azure') && !isAuthenticated && (
            <AzureAuth onConnected={() => {}} />
          )}

          {/* AWS Placeholder */}
          {selectedProviders.includes('aws') && (
            <div className="provider-auth">
              <div className="auth-card aws-auth">
                <div className="auth-icon">🟠</div>
                <h3>AWS Integration</h3>
                <p>AWS integration coming soon...</p>
                <button className="btn btn-outline" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          )}

          {/* GCP Placeholder */}
          {selectedProviders.includes('gcp') && (
            <div className="provider-auth">
              <div className="auth-card gcp-auth">
                <div className="auth-icon">🟢</div>
                <h3>Google Cloud Integration</h3>
                <p>Google Cloud integration coming soon...</p>
                <button className="btn btn-outline" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          )}

          {/* Show billing data only when authenticated and providers selected */}
          {isAuthenticated && selectedProviders.length > 0 && (
            <>
              {/* Cost Summary Cards */}
              <div className="cost-summary">
                <div className="total-cost-card">
                  <div className="cost-header">
                    <span className="cost-label">Total Costs</span>
                    <span className="cost-currency">£</span>
                  </div>
                  <div className="cost-amount">£{totalCost.toFixed(2)}</div>
                  <div className="cost-subtitle">Across selected platforms</div>
                </div>

                <div className="provider-costs">
                  {selectedProviders.includes('aws') && (
                    <div className="provider-card aws-card">
                      <div className="provider-header">
                        <span className="provider-icon aws-icon">🟠</span>
                        <span className="provider-name">AWS</span>
                      </div>
                      <div className="provider-amount">£{awsCost.toFixed(2)}</div>
                      <div className="provider-percentage">Coming Soon</div>
                    </div>
                  )}

                  {selectedProviders.includes('azure') && (
                    <div className="provider-card azure-card">
                      <div className="provider-header">
                        <span className="provider-icon azure-icon">☁️</span>
                        <span className="provider-name">Azure</span>
                      </div>
                      <div className="provider-amount">£{azureTotalCost.toFixed(2)}</div>
                      <div className="provider-percentage">
                        {totalCost > 0 ? ((azureTotalCost / totalCost) * 100).toFixed(1) : 0}% of total
                      </div>
                    </div>
                  )}

                  {selectedProviders.includes('gcp') && (
                    <div className="provider-card gcp-card">
                      <div className="provider-header">
                        <span className="provider-icon gcp-icon">🟢</span>
                        <span className="provider-name">Google Cloud</span>
                      </div>
                      <div className="provider-amount">£{gcpCost.toFixed(2)}</div>
                      <div className="provider-percentage">Coming Soon</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Azure Subscription and Billing Data */}
              {selectedProviders.includes('azure') && subscriptions.length > 0 && (
                <AzureBilling
                  subscriptions={subscriptions}
                  selectedSubscription={selectedSubscription}
                  onSubscriptionChange={setSelectedSubscription}
                  billingData={azureBillingData}
                  loading={azureLoading}
                />
              )}

              {/* Spending Trends Chart */}
              {chartData.length > 0 && (
                <div className="spending-trends">
                  <div className="trends-header">
                    <h2>Spending Trends</h2>
                    <p>Daily spending for your connected accounts</p>
                  </div>
                  
                  <div className="trends-legend">
                    {selectedProviders.includes('aws') && (
                      <span className="legend-item">
                        <span className="legend-dot aws-dot"></span>
                        AWS
                      </span>
                    )}
                    {selectedProviders.includes('azure') && (
                      <span className="legend-item">
                        <span className="legend-dot azure-dot"></span>
                        Azure
                      </span>
                    )}
                    {selectedProviders.includes('gcp') && (
                      <span className="legend-item">
                        <span className="legend-dot gcp-dot"></span>
                        Google Cloud
                      </span>
                    )}
                  </div>
                  
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        {selectedProviders.includes('aws') && <Bar dataKey="AWS" stackId="a" fill="#ff9500" />}
                        {selectedProviders.includes('azure') && <Bar dataKey="Azure" stackId="a" fill="#0078d4" />}
                        {selectedProviders.includes('gcp') && <Bar dataKey="GoogleCloud" stackId="a" fill="#34a853" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {azureError && (
                <div className="error-message">
                  <h3>Error loading Azure data</h3>
                  <p>{azureError}</p>
                  <button className="btn btn-primary" onClick={() => fetchAzureBillingData(selectedSubscription)}>
                    Retry
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}