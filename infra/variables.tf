variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name"
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

locals {
  assets_domain = "assets-stage.${var.domain_name}"
}
