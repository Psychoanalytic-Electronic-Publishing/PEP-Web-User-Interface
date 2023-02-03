data "aws_route53_zone" "pep_web" {
  name         = var.root_domain_name
  private_zone = false
}

resource "aws_route53_record" "web_alias" {
  zone_id = data.aws_route53_zone.pep_web.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.pep_web.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.pep_web.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web_www_redirect" {
  zone_id = data.aws_route53_zone.pep_web.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"

  records = [
    var.domain_name
  ]

  ttl = 60
}
