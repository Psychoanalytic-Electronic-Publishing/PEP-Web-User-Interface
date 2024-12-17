resource "random_password" "ip_hmac_secret" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "ip_hmac_secret" {
  name = "${var.stack_name}-ip-hmac-${var.env}"

  kms_key_id = var.kms_key_arn

  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

resource "aws_secretsmanager_secret_version" "ip_hmac_secret" {
  secret_id     = aws_secretsmanager_secret.ip_hmac_secret.id
  secret_string = random_password.ip_hmac_secret.result
}
