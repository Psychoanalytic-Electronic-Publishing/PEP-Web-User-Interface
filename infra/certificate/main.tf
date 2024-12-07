terraform {
  backend "s3" {
    key = "global/s3/pep-web-cert.tfstate"
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
