moved {
  from = aws_api_gateway_domain_name.pep_web
  to   = aws_api_gateway_domain_name.pep_web[0]
}

moved {
  from = aws_api_gateway_base_path_mapping.mapping
  to   = aws_api_gateway_base_path_mapping.mapping[0]
}

moved {
  from = aws_route53_record.web_alias
  to   = aws_route53_record.web_alias[0]
}
