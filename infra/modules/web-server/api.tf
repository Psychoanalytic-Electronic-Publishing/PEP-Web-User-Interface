resource "aws_api_gateway_rest_api" "api_gateway" {
  name        = "${var.stack_name}-${var.env}-api"
  description = local.api_description
  tags = {
    stage = var.env
    stack = var.stack_name
  }
  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = "example"
      version = "1.0"
    }
    paths = {
      "/" = {
        x-amazon-apigateway-any-method = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = module.fastboot_lambda.lambda_function_invoke_arn
          }
        }
      }
      "/{proxy+}" = {
        x-amazon-apigateway-any-method = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = module.fastboot_lambda.lambda_function_invoke_arn
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api_gateway.body))
  }
  lifecycle {
    create_before_destroy = true
  }
  stage_name = "v1"
}
