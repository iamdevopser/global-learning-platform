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
cat > /opt/docker-compose.yml << 'EOF'
version: '3'
services:
  app:
    image: 788262643345.dkr.ecr.us-east-1.amazonaws.com/global-learning-platform:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:your-secure-password-here@glp-postgres.czo842ucseof.us-east-1.rds.amazonaws.com:5432/postgres
    restart: always
EOF

# Install docker-compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start the application
cd /opt
docker-compose up -d 