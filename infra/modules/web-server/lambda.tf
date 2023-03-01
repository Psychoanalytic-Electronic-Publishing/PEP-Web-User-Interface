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
      npm config set '@fortawesome:registry=https://npm.fontawesome.com/'
      npm config set '//npm.fontawesome.com/:_authToken' "${var.font_awesome_token}"
      yarn install --frozen-lockfile
      npm install -g ember-cli
      DEPLOY_TYPE=${var.env} ember build --environment=production --output-path=dist
    EOT
  }
}

resource "null_resource" "fastboot_build" {
  depends_on = [
    null_resource.ember_build
  ]
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    working_dir = "../.."
    command     = <<-EOT
      cp -r pep/node/ infra/${var.env}/node
      cp -r pep/dist/ infra/${var.env}/node/dist
      cp .env-${var.env} infra/${var.env}/node/.env
      cd infra/${var.env}/node
      echo "BUILD_VERSION=${var.build_version}" >> .env
      yarn install --frozen-lockfile
      zip -r package.zip .
      cd ..
      mv node/package.zip package.zip
      rm -rf node
    EOT
  }
}

module "fastboot_lambda" {
  depends_on = [
    null_resource.ember_build,
    null_resource.fastboot_build
  ]
  source                  = "terraform-aws-modules/lambda/aws"
  function_name           = "${var.stack_name}-handler-${var.env}"
  create_package          = false
  local_existing_package  = "package.zip"
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
    null_resource.fastboot_build,
    module.fastboot_lambda
  ]
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    command = "aws lambda update-function-code --function-name ${module.fastboot_lambda.lambda_function_name} --zip-file fileb://package.zip"
  }
}

resource "null_resource" "upload_assets_to_s3" {
  depends_on = [
    null_resource.ember_build,
    null_resource.fastboot_build,
    module.fastboot_lambda
  ]
  triggers = {
    src_hash = "${data.archive_file.zip_assets.output_sha}"
  }
  provisioner "local-exec" {
    working_dir = "../.."
    command     = "aws s3 sync pep/dist/ s3://${var.assets_domain}/ --delete --acl public-read"
  }
}

resource "aws_lambda_permission" "allow_api" {
  statement_id  = "${var.stack_name}-allow-api-${var.env}"
  action        = "lambda:InvokeFunction"
  function_name = module.fastboot_lambda.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*/*"
}
