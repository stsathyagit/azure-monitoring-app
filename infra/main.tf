# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "rg-azure-monitoring-demo"
  location = var.location
}

# Azure Static Web App
resource "azurerm_static_site" "swa" {
  name                = "azure-monitoring-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku_tier            = "Free"
  sku_size            = "Free"

}

# Application Insights (optional - logs and monitoring)
resource "azurerm_application_insights" "appinsights" {
  name                = "appi-azure-monitoring-demo"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}

# Output connection info
output "static_web_app_url" {
  value = azurerm_static_site.swa.default_host_name
}


output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}
