resource "aws_s3_bucket" "video_previews" {
  bucket = var.bucket_name
  tags = {
    Bucket = var.bucket_name
    stage  = var.env
    stack  = var.stack_name
  }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.video_previews.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.video_previews.id

  cors_rule {
    allowed_headers = []
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
}