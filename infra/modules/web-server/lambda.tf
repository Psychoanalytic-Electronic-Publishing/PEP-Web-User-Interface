data "archive_file" "zip_assets" {
  type        = "zip"
  source_dir  = "../../pep/"
  excludes    = ["node_modules", "dist"]
  output_path = "pep.zip"
}

resource "null_resource" "ember_build" {
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    working_dir = "../../pep"
    command     = <<-EOT
      yarn install --frozen-lockfile
      DEPLOY_TYPE=staging-live ember build --environment=production --output-path=dist
    EOT
  }
}

resource "null_resource" "create_fastboot_env" {
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    command = "echo '123'"
  }
}

resource "null_resource" "fastboot_build" {
  depends_on = [
    null_resource.create_fastboot_env,
    null_resource.ember_build
  ]
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    command = <<-EOT
      cp -r ../../pep/node/ node/
      cd node
      yarn install --frozen-lockfile
      cd ..
      cp -r ../../pep/dist/ node/dist
      cd node
      zip -r package.zip *
      mv package.zip ../node.zip
      cd ..
      rm -rf node
    EOT
  }
}

module "fastboot_lambda" {
  depends_on = [
    null_resource.ember_build,
    null_resource.create_fastboot_env,
    null_resource.fastboot_build
  ]
  source                  = "terraform-aws-modules/lambda/aws"
  function_name           = "${var.stack_name}-handler-${var.env}"
  create_package          = false
  local_existing_package  = "node.zip"
  ignore_source_code_hash = true
  handler                 = "lambda.handler"
  runtime                 = "nodejs16.x"
  timeout                 = 29
  memory_size             = 1024
  ephemeral_storage_size  = 512

  tags = {
    stage = var.env
    stack = var.stack_name
  }
}

resource "null_resource" "deploy_lambda_package" {
  depends_on = [
    null_resource.ember_build,
    null_resource.create_fastboot_env,
    null_resource.fastboot_build,
    module.fastboot_lambda
  ]
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    command = " aws lambda update-function-code --function-name ${module.fastboot_lambda.lambda_function_name} --zip-file fileb://node.zip"
  }
}

resource "aws_lambda_permission" "allow_api" {
  statement_id  = "${var.stack_name}-allow-api-${var.env}"
  action        = "lambda:InvokeFunction"
  function_name = module.fastboot_lambda.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*/*"
}
