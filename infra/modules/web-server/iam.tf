resource "aws_secretsmanager_secret_policy" "secret_policy" {
  secret_arn = aws_secretsmanager_secret.ip_hmac_secret.arn
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCrossAccountAccess"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::631911044226:root"
        }
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_secrets" {
  role       = module.fastboot_lambda.lambda_role_name
  policy_arn = aws_iam_policy.lambda_secrets.arn
}

resource "aws_iam_policy" "lambda_secrets" {
  name = "${var.stack_name}-lambda-secrets-${var.env}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = [
          aws_secretsmanager_secret.ip_hmac_secret.arn,
          var.kms_key_arn
        ]
      }
    ]
  })
}

resource "aws_lambda_permission" "allow_api" {
  statement_id  = "${var.stack_name}-allow-api-${var.env}"
  action        = "lambda:InvokeFunction"
  function_name = module.fastboot_lambda.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*/*"
}
