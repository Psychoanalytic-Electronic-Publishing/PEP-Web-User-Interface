resource "aws_api_gateway_domain_name" "pep_web" {
  count = var.enable_custom_domain ? 1 : 0

  certificate_arn = var.certificate_arn
  domain_name     = var.domain_name
  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

resource "aws_api_gateway_base_path_mapping" "mapping" {
  count = var.enable_custom_domain ? 1 : 0

  api_id      = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = aws_api_gateway_stage.api_stage.stage_name
  domain_name = aws_api_gateway_domain_name.pep_web[0].domain_name
}
