# Set environment variables for Azure Static Web App
# Replace <your-static-web-app-name> with your actual Static Web App name
# Replace <your-resource-group> with your actual resource group name

az staticwebapp appsettings set \
  --name <your-static-web-app-name> \
  --resource-group <your-resource-group> \
  --setting-names REACT_APP_CLIENT_ID=aad35dbf-35f4-4447-b615-4d1a99798955 REACT_APP_TENANT_ID=8d542808-5b3a-4b7c-ba4b-7e285151a589