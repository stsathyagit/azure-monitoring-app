import React, { useState } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import BillingData from "./BillingData";
import InvoiceData from "./InvoiceData";

function AzureSection() {
  const { instance } = useMsal();
  const [activeSubTab, setActiveSubTab] = useState("billing");

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-6">
      <UnauthenticatedTemplate>
        <div className="flex flex-col items-center justify-center h-full py-10">
          <p className="text-gray-600 mb-4 text-lg">
            Sign in with your Azure account to view details.
          </p>
          <button
            onClick={() => instance.loginPopup(loginRequest)}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </div>
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <div>
          {/* Sub Tabs */}
          <div className="flex space-x-6 border-b border-gray-200 mb-4">
            <button
                onClick={() => setActiveSubTab("billing")}
                className={`pb-2 font-medium ${
                activeSubTab === "billing"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Billing
            </button>
            <button
                onClick={() => setActiveSubTab("invoice")}
                className={`pb-2 font-medium ${
                activeSubTab === "invoice"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Invoice
            </button>
            <button
                onClick={() => setActiveSubTab("resources")}
                className={`pb-2 font-medium ${
                activeSubTab === "resources"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Resources
            </button>
            </div>


          {/* Subtab content */}
          {activeSubTab === "billing" && <BillingData />}
          {activeSubTab === "invoice" && <InvoiceData />}
          {activeSubTab === "resources" && (
            <div className="text-gray-700 mt-4">
                <h3 className="text-xl font-semibold mb-2">Azure Resources</h3>
                <p>Coming soon: your Azure resources will be listed here!</p>
            </div>
          )}

        </div>
      </AuthenticatedTemplate>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-gray-800 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          <h1 className="text-2xl font-bold text-blue-700">☁️ Cloud Monitor</h1>
          <nav className="space-x-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`font-medium ${
                activeTab === "home" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("azure")}
              className={`font-medium ${
                activeTab === "azure" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Azure
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              className={`font-medium ${
                activeTab === "aws" ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"
              }`}
            >
              AWS
            </button>
            <button
              onClick={() => setActiveTab("gcp")}
              className={`font-medium ${
                activeTab === "gcp" ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            >
              GCP
            </button>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {activeTab === "home" && (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold text-blue-700 mb-4">Welcome to Cloud Monitor</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage and monitor your cloud usage, billing, and resources across multiple platforms — all in one place.
            </p>
          </div>
        )}

        {activeTab === "azure" && <AzureSection />}

        {activeTab === "aws" && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center mt-10">
            <h3 className="text-xl font-semibold text-yellow-600">AWS Integration</h3>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        )}

        {activeTab === "gcp" && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center mt-10">
            <h3 className="text-xl font-semibold text-red-600">GCP Integration</h3>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-3 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cloud Monitor — Built with Azure & React
      </footer>
    </div>
  );
}
