resource "aws_s3_bucket" "pep_web" {
  bucket = local.assets_domain
  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.pep_web.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.pep_web.id

  cors_rule {
    allowed_headers = []
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
}
