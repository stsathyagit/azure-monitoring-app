import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import BillingData from "./BillingData"; // reuse your billing chart component


function AzureSection() {
  const { instance } = useMsal();
  const [selectedTab, setSelectedTab] = useState("billing");

  return (
    <div className="p-6">
      <UnauthenticatedTemplate>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-600 mb-4">Sign in with your Azure account to view details.</p>
          <button
            onClick={() => instance.loginPopup(loginRequest)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="flex space-x-4 border-b border-gray-200">
            <TabsTrigger value="billing" className="px-3 py-2 text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Billing
            </TabsTrigger>
            <TabsTrigger value="resources" className="px-3 py-2 text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="mt-4">
            <BillingData />
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <p className="text-gray-700">Coming soon: Resource listing!</p>
          </TabsContent>
        </Tabs>
      </AuthenticatedTemplate>
    </div>
  );
}

export default function HomePage() {
  const [activeMainTab, setActiveMainTab] = useState("azure");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Right-side tabs */}
      <div className="ml-auto w-64 border-l border-gray-200 bg-white shadow-sm p-4">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} orientation="vertical">
          <TabsList className="flex flex-col space-y-2">
            <TabsTrigger
              value="azure"
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 data-[state=active]:bg-blue-100"
            >
              ☁️ Azure
            </TabsTrigger>
            <TabsTrigger
              value="aws"
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 data-[state=active]:bg-blue-100"
            >
              🟡 AWS
            </TabsTrigger>
            <TabsTrigger
              value="gcp"
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 data-[state=active]:bg-blue-100"
            >
              🔴 GCP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="azure" className="w-[calc(100vw-17rem)] p-6">
            <AzureSection />
          </TabsContent>

          <TabsContent value="aws" className="p-6 text-gray-600">
            AWS integration coming soon!
          </TabsContent>

          <TabsContent value="gcp" className="p-6 text-gray-600">
            GCP integration coming soon!
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
