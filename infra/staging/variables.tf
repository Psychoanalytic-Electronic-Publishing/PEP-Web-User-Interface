variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name"
  default     = "stage.pep-web.org"
}

variable "root_domain_name" {
  description = "Root domain name"
  default     = "pep-web.org"
}

variable "assets_domain" {
  description = "Domain mapped to assets bucket"
  default     = "stage-assets.pep-web.org"
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "stack_name" {
  description = "Root name for the stack"
  default     = "pep-web"
}

variable "api_description" {
  description = "Description of the API Gateway"
  default     = "API Gateway for PEP-Web"
}
