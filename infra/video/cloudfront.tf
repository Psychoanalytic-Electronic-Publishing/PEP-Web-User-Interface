resource "aws_cloudfront_distribution" "s3_distribution" {
  comment = "S3 Distribution for ${var.video_domain}"

  origin {
    domain_name = aws_s3_bucket.video_previews.bucket_regional_domain_name
    origin_id   = var.video_domain
  }

  enabled         = true
  is_ipv6_enabled = true

  aliases = [var.video_domain]

  price_class = "PriceClass_100"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = var.video_domain

    compress = true

    forwarded_values {
      headers = [
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
      ]

      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 1
    max_ttl     = 31536000
    default_ttl = 86400

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  tags = {
    stage = var.env
    stack = var.stack_name
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }
}
