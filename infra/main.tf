terraform {
  backend "s3" {
    key = "global/s3/pep-web-stage.tfstate"
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

module "certificate" {
  source           = "./modules/certificate"
  stack_name       = var.stack_name
  env              = var.env
  root_domain_name = var.root_domain_name
}

module "assets" {
  source           = "./modules/assets"
  stack_name       = var.stack_name
  env              = var.env
  assets_domain    = var.assets_domain
  root_domain_name = var.root_domain_name
  certificate_arn  = module.certificate.arn
}

module "web_server" {
  source           = "./modules/web-server"
  stack_name       = var.stack_name
  env              = var.env
  domain_name      = var.domain_name
  certificate_arn  = module.certificate.arn
  api_name         = var.api_name
  api_description  = var.api_description
  root_domain_name = var.root_domain_name
}
