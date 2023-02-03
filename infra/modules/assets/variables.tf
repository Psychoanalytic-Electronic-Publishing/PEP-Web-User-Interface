variable "assets_domain" {
  description = "Domain mapped to assets bucket"
  default     = "stage-assets.pep-web.org"
}

variable "root_domain_name" {
  description = "Root domain name"
  default     = "pep-web.org"
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

variable "certificate_arn" {
  description = "ARN of the certificate to use for the domain"
  type        = string
}
