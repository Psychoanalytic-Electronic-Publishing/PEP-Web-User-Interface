variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "root_domain_name" {
  description = "Root domain name"
  default     = "pep-web.org"
}

variable "video_domain" {
  description = "Domain mapped to video bucket"
  default     = "video.pep-web.org"
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "production"
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

variable "bucket_name" {
  description = "Name of the bucket"
  default     = "pep-web-video-previews"
}
