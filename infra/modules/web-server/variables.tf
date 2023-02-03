variable "env" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "stack_name" {
  description = "Root name for the stack"
  default     = "pep-web"
}

variable "certificate_arn" {
  description = "ARN of the certificate to use for the domain"
  type        = string
}

variable "api_name" {
  description = "Name of the API Gateway"
  default     = "pep-web-api"
}

variable "domain_name" {
  description = "Domain name"
  default     = "stage.pep-web.org"
}

variable "root_domain_name" {
  description = "Root domain name"
  default     = "pep-web.org"
}

variable "api_description" {
  description = "Description of the API Gateway"
  default     = "API Gateway for PEP-Web"
}
