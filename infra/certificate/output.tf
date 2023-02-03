
output "arn" {
  description = "ARN of the certificate"
  value       = aws_acm_certificate_validation.validation.certificate_arn
}
