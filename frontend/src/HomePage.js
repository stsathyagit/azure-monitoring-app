import React, { useState } from "react";
import { 
  useMsal, 
  AuthenticatedTemplate, 
  UnauthenticatedTemplate 
} from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import BillingData from "./BillingData";
import "./HomePage.css";

function LoginButton() {
  const { instance } = useMsal();
  return (
    <button 
      className="btn btn-primary"
      onClick={() => instance.loginPopup(loginRequest)}
    >
      <span className="btn-icon">🔐</span>
      Sign in to Azure
    </button>
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

function AzureSection() {
  const { instance } = useMsal();
  const [activeSubTab, setActiveSubTab] = useState("billing");

  return (
    <div className="cloud-section">
      <div className="section-header">
        <div className="section-title">
          <span className="cloud-icon azure-icon">☁️</span>
          <div>
            <h2>Microsoft Azure</h2>
            <p>Cost management and resource monitoring</p>
          </div>
        </div>
        
        <div className="section-actions">
          <AuthenticatedTemplate>
            <div className="sub-tabs">
              <button 
                className={`sub-tab ${activeSubTab === "billing" ? "active" : ""}`}
                onClick={() => setActiveSubTab("billing")}
              >
                💰 Billing
              </button>
              <button 
                className={`sub-tab ${activeSubTab === "resources" ? "active" : ""}`}
                onClick={() => setActiveSubTab("resources")}
              >
                🛠️ Resources
              </button>
              <button 
                className={`sub-tab ${activeSubTab === "monitoring" ? "active" : ""}`}
                onClick={() => setActiveSubTab("monitoring")}
              >
                📊 Monitoring
              </button>
            </div>
          </AuthenticatedTemplate>
        </div>
      </div>

      <div className="section-content">
        <UnauthenticatedTemplate>
          <div className="auth-prompt">
            <div className="auth-card azure-auth">
              <span className="auth-icon">☁️</span>
              <h3>Connect to Microsoft Azure</h3>
              <p>Sign in with your Azure account to access billing data, resource monitoring, and cost management.</p>
              <LoginButton />
            </div>
          </div>
        </UnauthenticatedTemplate>

        <AuthenticatedTemplate>
          <div className="authenticated-content">
            {activeSubTab === "billing" && (
              <div className="tab-content">
                <BillingData />
              </div>
            )}
            
            {activeSubTab === "resources" && (
              <div className="tab-content">
                <div className="placeholder-content">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="card-header">
                        <h3>Virtual Machines</h3>
                        <span className="card-icon">🖥️</span>
                      </div>
                      <div className="card-value">12</div>
                      <div className="card-subtitle">Active instances</div>
                    </div>
                    <div className="summary-card">
                      <div className="card-header">
                        <h3>Storage Accounts</h3>
                        <span className="card-icon">💾</span>
                      </div>
                      <div className="card-value">8</div>
                      <div className="card-subtitle">Total accounts</div>
                    </div>
                    <div className="summary-card">
                      <div className="card-header">
                        <h3>App Services</h3>
                        <span className="card-icon">🌐</span>
                      </div>
                      <div className="card-value">5</div>
                      <div className="card-subtitle">Running services</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSubTab === "monitoring" && (
              <div className="tab-content">
                <div className="placeholder-content">
                  <div className="monitoring-grid">
                    <div className="monitoring-card">
                      <h3>Performance Metrics</h3>
                      <p>CPU, Memory, and Network utilization across your Azure resources.</p>
                      <button className="btn btn-outline">View Metrics</button>
                    </div>
                    <div className="monitoring-card">
                      <h3>Application Insights</h3>
                      <p>Application performance monitoring and diagnostics.</p>
                      <button className="btn btn-outline">Open Insights</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AuthenticatedTemplate>
      </div>
    </div>
  );
}

function AWSSection() {
  return (
    <div className="cloud-section">
      <div className="section-header">
        <div className="section-title">
          <span className="cloud-icon aws-icon">🟠</span>
          <div>
            <h2>Amazon Web Services</h2>
            <p>AWS cost management and resource monitoring</p>
          </div>
        </div>
      </div>

      <div className="section-content">
        <div className="auth-prompt">
          <div className="auth-card aws-auth">
            <span className="auth-icon">🟠</span>
            <h3>Connect to AWS</h3>
            <p>Connect your AWS account to monitor costs, resources, and performance metrics.</p>
            <button className="btn btn-aws" disabled>
              <span className="btn-icon">🔗</span>
              Connect AWS (Coming Soon)
            </button>
          </div>
        </div>
        
        <div className="placeholder-content">
          <div className="summary-cards">
            <div className="summary-card coming-soon">
              <div className="card-header">
                <h3>EC2 Instances</h3>
                <span className="card-icon">🖥️</span>
              </div>
              <div className="card-value">--</div>
              <div className="card-subtitle">Coming soon</div>
            </div>
            <div className="summary-card coming-soon">
              <div className="card-header">
                <h3>S3 Storage</h3>
                <span className="card-icon">🪣</span>
              </div>
              <div className="card-value">--</div>
              <div className="card-subtitle">Coming soon</div>
            </div>
            <div className="summary-card coming-soon">
              <div className="card-header">
                <h3>Lambda Functions</h3>
                <span className="card-icon">⚡</span>
              </div>
              <div className="card-value">--</div>
              <div className="card-subtitle">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GCPSection() {
  return (
    <div className="cloud-section">
      <div className="section-header">
        <div className="section-title">
          <span className="cloud-icon gcp-icon">🔵</span>
          <div>
            <h2>Google Cloud Platform</h2>
            <p>GCP cost management and resource monitoring</p>
          </div>
        </div>
      </div>

      <div className="section-content">
        <div className="auth-prompt">
          <div className="auth-card gcp-auth">
            <span className="auth-icon">🔵</span>
            <h3>Connect to Google Cloud</h3>
            <p>Connect your GCP account to monitor costs, resources, and performance metrics.</p>
            <button className="btn btn-gcp" disabled>
              <span className="btn-icon">🔗</span>
              Connect GCP (Coming Soon)
            </button>
          </div>
        </div>
        
        <div className="placeholder-content">
          <div className="summary-cards">
            <div className="summary-card coming-soon">
              <div className="card-header">
                <h3>Compute Engine</h3>
                <span className="card-icon">🖥️</span>
              </div>
              <div className="card-value">--</div>
              <div className="card-subtitle">Coming soon</div>
            </div>
            <div className="summary-card coming-soon">
              <div className="card-header">
                <h3>Cloud Storage</h3>
                <span className="card-icon">☁️</span>
              </div>
              <div className="card-value">--</div>
              <div className="card-subtitle">Coming soon</div>
            </div>
            <div className="summary-card coming-soon">
              <div className="card-header">
                <h3>Cloud Functions</h3>
                <span className="card-icon">⚡</span>
              </div>
              <div className="card-value">--</div>
              <div className="card-subtitle">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("azure");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="header-cloud-icon">☁️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Multi-Cloud Monitoring Dashboard</h1>
                <p className="text-sm text-muted-foreground">Unified cost management across Azure, AWS, and GCP</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <span className={`refresh-icon ${isLoading ? 'animate-spin' : ''}`}>🔄</span>
                Refresh
              </button>
              <button className="btn btn-outline btn-sm">
                <span className="btn-icon">⚙️</span>
                Settings
              </button>
              <AuthenticatedTemplate>
                <Profile />
                <LogoutButton />
              </AuthenticatedTemplate>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              className={`tab-button ${activeTab === "azure" ? "active" : ""}`}
              onClick={() => setActiveTab("azure")}
            >
              <span className="tab-icon azure-tab-icon">☁️</span>
              Microsoft Azure
            </button>
            <button
              className={`tab-button ${activeTab === "aws" ? "active" : ""}`}
              onClick={() => setActiveTab("aws")}
            >
              <span className="tab-icon aws-tab-icon">🟠</span>
              Amazon AWS
            </button>
            <button
              className={`tab-button ${activeTab === "gcp" ? "active" : ""}`}
              onClick={() => setActiveTab("gcp")}
            >
              <span className="tab-icon gcp-tab-icon">🔵</span>
              Google Cloud
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "azure" && <AzureSection />}
        {activeTab === "aws" && <AWSSection />}
        {activeTab === "gcp" && <GCPSection />}
      </main>
    </div>
  );
}