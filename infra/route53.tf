data "aws_route53_zone" "pep_web" {
  name         = var.root_domain_name
  private_zone = false
}
