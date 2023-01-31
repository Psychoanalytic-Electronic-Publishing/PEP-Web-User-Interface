resource "aws_api_gateway_domain_name" "pep_web" {
  certificate_arn = aws_acm_certificate_validation.validation.certificate_arn
  domain_name     = var.domain_name
  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

