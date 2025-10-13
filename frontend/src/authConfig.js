export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || "aad35dbf-35f4-4447-b615-4d1a99798955",
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID || "8d542808-5b3a-4b7c-ba4b-7e285151a589"}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: ["User.Read"]
};