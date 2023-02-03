terraform {
  backend "s3" {
    key = "global/s3/pep-web-prod.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

module "assets" {
  source           = "../modules/assets"
  stack_name       = var.stack_name
  env              = var.env
  assets_domain    = var.assets_domain
  root_domain_name = var.root_domain_name
  certificate_arn  = var.certificate_arn
}

module "web_server" {
  source           = "../modules/web-server"
  stack_name       = var.stack_name
  env              = var.env
  domain_name      = var.domain_name
  certificate_arn  = var.certificate_arn
  root_domain_name = var.root_domain_name
}
