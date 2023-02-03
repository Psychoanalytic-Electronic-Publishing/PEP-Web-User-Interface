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

variable "api_description" {
  description = "Description of the API Gateway"
  type        = string
}
