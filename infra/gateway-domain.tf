resource "aws_api_gateway_domain_name" "pep_web" {
  certificate_arn = aws_acm_certificate_validation.validation.certificate_arn
  domain_name     = var.domain_name
  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

resource "aws_api_gateway_base_path_mapping" "mapping" {
  api_id      = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = aws_api_gateway_deployment.api_deployment.stage_name
  domain_name = aws_api_gateway_domain_name.pep_web.domain_name
}
