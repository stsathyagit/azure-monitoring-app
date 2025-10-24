// Validate required environment variables
if (!process.env.REACT_APP_CLIENT_ID) {
  throw new Error('REACT_APP_CLIENT_ID environment variable is required');
}

if (!process.env.REACT_APP_TENANT_ID) {
  throw new Error('REACT_APP_TENANT_ID environment variable is required');
}

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: ["https://management.azure.com/user_impersonation"]
};