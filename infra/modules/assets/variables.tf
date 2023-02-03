variable "assets_domain" {
  description = "Domain mapped to assets bucket"
  type        = string
}

variable "root_domain_name" {
  description = "Root domain name"
  type        = string
}

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
