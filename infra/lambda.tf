module "fastboot_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name          = "${var.stack_name}-handler-${var.env}"
  source_path            = "../pep/node"
  handler                = "lambda.handler"
  runtime                = "nodejs16.x"
  timeout                = 29
  memory_size            = 1024
  ephemeral_storage_size = 512

  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

resource "aws_lambda_permission" "allow_api" {
  statement_id  = "${var.stack_name}-allow-api-${var.env}"
  action        = "lambda:InvokeFunction"
  function_name = module.fastboot_lambda.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*/*"
}
