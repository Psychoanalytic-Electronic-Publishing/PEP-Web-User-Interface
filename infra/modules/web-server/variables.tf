variable "env" {
  description = "Environment name"
  type        = string
}

variable "stack_name" {
  description = "Root name for the stack"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the certificate to use for the domain"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "root_domain_name" {
  description = "Root domain name"
  type        = string
}

locals {
  api_description = "API Gateway for ${var.stack_name} ${var.env}"
}

variable "font_awesome_token" {
  sensitive   = true
  description = "Font AWesome licene token"
  type        = string
}

variable "assets_domain" {
  description = "Domain mapped to assets bucket"
  type        = string
}
