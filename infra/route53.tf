data "aws_route53_zone" "pep_web" {
  name         = var.root_domain_name
  private_zone = false
}

resource "aws_route53_record" "assets_alias" {
  zone_id = data.aws_route53_zone.pep_web.zone_id
  name    = var.assets_domain
  type    = "A"

  alias {
    name                   = module.assets.s3_distribution.domain_name
    zone_id                = module.assets.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
