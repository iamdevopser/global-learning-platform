terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

##############################
# Providers
##############################
provider "aws" {
  region = var.aws_region
}

##############################
# Networking (minimal VPC)
##############################
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "glp-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "glp-igw"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "glp-public-subnet"
  }
}

resource "aws_subnet" "public2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}b"

  tags = {
    Name = "glp-public-subnet-2"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "glp-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public2" {
  subnet_id      = aws_subnet.public2.id
  route_table_id = aws_route_table.public.id
}

##############################
# Security Groups
##############################
resource "aws_security_group" "ec2" {
  name        = "glp-ec2-sg"
  description = "Allow SSH, HTTP, HTTPS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "glp-ec2-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "glp-rds-sg"
  description = "Allow Postgres from EC2 SG"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "glp-rds-sg"
  }
}

##############################
# EC2 Instance (t2.micro)
##############################
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_pair_name
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl enable docker
              systemctl start docker

              # Install AWS CLI
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              yum install -y unzip
              unzip awscliv2.zip
              ./aws/install

              # Login to ECR
              aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 788262643345.dkr.ecr.us-east-1.amazonaws.com

              # Pull the Docker image
              docker pull 788262643345.dkr.ecr.us-east-1.amazonaws.com/global-learning-platform:latest

              # Create a docker-compose file
              cat > /opt/docker-compose.yml << 'DOCKERCOMPOSE'
              version: '3'
              services:
                app:
                  image: 788262643345.dkr.ecr.us-east-1.amazonaws.com/global-learning-platform:latest
                  ports:
                    - "3000:3000"
                  environment:
                    - NODE_ENV=production
                    - DATABASE_URL=postgresql://postgres:${var.db_password}@${aws_db_instance.postgres.address}:5432/postgres
                  restart: always
              DOCKERCOMPOSE

              # Install docker-compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose

              # Start the application
              cd /opt
              docker-compose up -d
              EOF

  tags = {
    Name = "glp-app"
  }
}

##############################
# RDS PostgreSQL (db.t3.micro)
##############################
resource "aws_db_subnet_group" "main" {
  name       = "glp-db-subnet-group"
  subnet_ids = [
    aws_subnet.public.id,
    aws_subnet.public2.id
  ]

  tags = {
    Name = "glp-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "glp-postgres"
  engine                 = "postgres"
  engine_version         = "17.5"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true
  skip_final_snapshot    = true
  deletion_protection    = false
  backup_retention_period = 0

  tags = {
    Name = "glp-postgres"
  }
}

##############################
# ECR Repository
##############################
resource "aws_ecr_repository" "app" {
  name                 = "global-learning-platform"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

##############################
# Outputs
##############################
output "ec2_public_ip" {
  description = "Public IP of the application server"
  value       = aws_instance.app.public_ip
}

output "rds_endpoint" {
  description = "Endpoint for the PostgreSQL instance"
  value       = aws_db_instance.postgres.address
}

output "rds_connection_string" {
  description = "psql connection string"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/postgres"
  sensitive   = true
}
