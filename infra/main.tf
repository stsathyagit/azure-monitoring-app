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
  sku_tier            = "Standard"
  sku_size            = "Standard"

  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = "demo"
  }
}

# Application Insights (optional - logs and monitoring)
resource "azurerm_application_insights" "appinsights" {
  name                = "appi-azure-monitoring-demo"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}

# ----------------------------------------------------
# Storage Account (required for Function App)
# ----------------------------------------------------
resource "azurerm_storage_account" "func_storage" {
  name                     = "stazuremonitor${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Random suffix to ensure global uniqueness
resource "random_string" "suffix" {
  length  = 6
  upper   = false
  lower   = true
  numeric = true
  special = false
}

# ----------------------------------------------------
# Consumption Plan (Serverless)
# ----------------------------------------------------
resource "azurerm_service_plan" "func_plan" {
  name                = "asp-azure-monitoring-demo"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "Y1"   # Y1 = Consumption plan (Free)
}

# ----------------------------------------------------
# Function App (Python)
# ----------------------------------------------------
resource "azurerm_linux_function_app" "funcapp" {
  name                       = "func-azure-monitoring-demo"
  resource_group_name         = azurerm_resource_group.rg.name
  location                    = azurerm_resource_group.rg.location
  service_plan_id             = azurerm_service_plan.func_plan.id
  storage_account_name        = azurerm_storage_account.func_storage.name
  storage_account_access_key  = azurerm_storage_account.func_storage.primary_access_key
  https_only                  = true

  site_config {
    application_stack {
      python_version = "3.11"
    }
  }

  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "AzureWebJobsStorage"      = azurerm_storage_account.func_storage.primary_connection_string
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.appinsights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
  }

  identity {
    type = "SystemAssigned"
  }
}

# ----------------------------------------------------
# (Optional) Grant Static Web App permission to call Function App
# ----------------------------------------------------
# resource "azurerm_role_assignment" "swa_to_func" {
#   scope                = azurerm_linux_function_app.funcapp.id
#   role_definition_name = "Reader"
#   principal_id         = azurerm_static_site.swa.identity[0].principal_id
#   depends_on           = [azurerm_static_site.swa, azurerm_linux_function_app.funcapp]
# }

# ----------------------------------------------------
# Outputs
# ----------------------------------------------------
output "function_app_url" {
  value = azurerm_linux_function_app.funcapp.default_hostname
}


# Output connection info
output "static_web_app_url" {
  value = azurerm_static_site.swa.default_host_name
}


output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}
