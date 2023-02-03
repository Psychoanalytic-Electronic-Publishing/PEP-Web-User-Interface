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


module "assets" {
  source          = "./modules/assets"
  stack_name      = var.stack_name
  env             = var.env
  assets_domain   = var.assets_domain
  certificate_arn = aws_acm_certificate_validation.validation.certificate_arn
}
