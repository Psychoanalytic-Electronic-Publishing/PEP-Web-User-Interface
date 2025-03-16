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

variable "certificate_arn" {
  description = "ARN of the certificate as output by infra/certificate"
  type        = string
  default     = "arn:aws:acm:us-east-1:547758924192:certificate/0ef7fa01-6a14-4342-a5cd-a3a55719b160"
}

variable "font_awesome_token" {
  sensitive   = true
  description = "Font AWesome licene token"
  type        = string
}

variable "build_version" {
  description = "Build number"
  type        = string
}

variable "pep_waf_key" {
  description = "WAF secret key"
  type        = string
}
