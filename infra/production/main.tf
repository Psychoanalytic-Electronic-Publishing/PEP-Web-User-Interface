terraform {
  backend "s3" {
    key = "global/s3/pep-web-prod.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.80.0"
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
  source             = "../modules/web-server"
  stack_name         = var.stack_name
  env                = var.env
  domain_name        = var.domain_name
  certificate_arn    = var.certificate_arn
  root_domain_name   = var.root_domain_name
  font_awesome_token = var.font_awesome_token
  assets_domain      = var.assets_domain
  build_version      = var.build_version
  kms_key_arn        = "arn:aws:kms:us-east-1:547758924192:key/7b802a2f-38b3-40af-bca1-cdbc45ad8ceb"
  pep_waf_key        = var.pep_waf_key
}

resource "aws_sns_topic" "translation_updates" {
  name = "${var.stack_name}-translation-updates-${var.env}"
}
