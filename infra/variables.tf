variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "West Europe"
}

variable "github_username" {
  description = "Your GitHub username or organization"
  type        = string
}

variable "github_repo" {
  description = "Your GitHub repository name"
  type        = string
}

variable "github_branch" {
  description = "Branch name for deployment"
  type        = string
  default     = "main"
}
