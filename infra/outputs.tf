output "resource_group" {
  value = data.azurerm_resource_group.rg.name
}

output "static_web_app_default_url" {
  value = "https://${azurerm_static_site.swa.default_host_name}"
}
