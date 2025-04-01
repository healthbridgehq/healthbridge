terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  backend "s3" {
    bucket = "healthbridge-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
}

# Database
module "database" {
  source = "./modules/database"
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  environment       = var.environment
  db_instance_class = var.db_instance_class
  db_name          = var.db_name
  db_username      = var.db_username
  db_password      = var.db_password
}

# Redis
module "redis" {
  source = "./modules/redis"
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  environment       = var.environment
  redis_node_type   = var.redis_node_type
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  environment       = var.environment
  app_name          = "healthbridge"
  container_image   = var.container_image
  container_port    = 8000
  desired_count     = var.ecs_desired_count
  
  database_url      = module.database.database_url
  redis_url         = module.redis.redis_url
}

# Load Balancer
module "alb" {
  source = "./modules/alb"
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.public_subnet_ids
  environment       = var.environment
  app_name          = "healthbridge"
  certificate_arn   = var.certificate_arn
}

# Route 53
module "dns" {
  source = "./modules/dns"
  
  domain_name       = var.domain_name
  alb_dns_name      = module.alb.dns_name
  alb_zone_id       = module.alb.zone_id
}
