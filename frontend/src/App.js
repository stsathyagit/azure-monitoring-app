// ...existing code...
import React from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

function LoginButton() {
  const { instance } = useMsal();
  return <button onClick={() => instance.loginPopup(loginRequest)}>Sign in</button>;
}

function LogoutButton() {
  const { instance } = useMsal();
  return <button onClick={() => instance.logoutPopup()}>Sign out</button>;
}

function Profile() {
  const { accounts } = useMsal();
  const account = accounts && accounts[0];
  if (!account) return null;
  return (
    <div>
      <p>Signed in as: {account.username}</p>
      <p>Name: {account.name}</p>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Azure AD Login (MSAL)</h1>

      <UnauthenticatedTemplate>
        <p>You are not signed in.</p>
        <LoginButton />
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <p>You are signed in.</p>
        <Profile />
        <LogoutButton />
      </AuthenticatedTemplate>
    </div>
  );
}
// ...existing code...

//export default App;
