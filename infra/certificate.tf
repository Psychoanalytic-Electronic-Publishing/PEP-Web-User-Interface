resource "aws_acm_certificate" "cert" {
  domain_name               = "*.${var.root_domain_name}"
  subject_alternative_names = ["www.${var.root_domain_name}", var.root_domain_name]
  validation_method         = "DNS"

  tags = {
    stage = var.env
    stack = var.stack_name
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "acm_cert" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  name    = each.value.name
  records = [each.value.record]
  ttl     = 300
  type    = each.value.type
  zone_id = data.aws_route53_zone.pep_web.zone_id
}


resource "aws_acm_certificate_validation" "validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_cert : record.fqdn]
}


