data "aws_route53_zone" "video_previews" {
  name         = var.root_domain_name
  private_zone = false
}

resource "aws_route53_record" "assets_alias" {
  zone_id = data.aws_route53_zone.video_previews.zone_id
  name    = var.video_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
