#!/bin/bash

# AWS Deployment Script for Global Learning Platform
# Free Tier Optimized Deployment

set -e

echo "🚀 Starting AWS deployment for Global Learning Platform..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Variables
APP_NAME="global-learning-platform"
REGION=${AWS_DEFAULT_REGION:-"us-east-1"}
KEY_NAME="${APP_NAME}-keypair"
SECURITY_GROUP="${APP_NAME}-sg"
VPC_NAME="${APP_NAME}-vpc"

echo "📍 Deploying to region: $REGION"

# Create VPC
echo "🌐 Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME}]" \
    --query 'Vpc.VpcId' \
    --output text \
    --region $REGION)

echo "✅ VPC created: $VPC_ID"

# Create Internet Gateway
echo "🌐 Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${APP_NAME}-igw}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text \
    --region $REGION)

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway \
    --vpc-id $VPC_ID \
    --internet-gateway-id $IGW_ID \
    --region $REGION

echo "✅ Internet Gateway created and attached: $IGW_ID"

# Create subnets
echo "🏗️ Creating subnets..."
PUBLIC_SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone "${REGION}a" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${APP_NAME}-public-subnet}]" \
    --query 'Subnet.SubnetId' \
    --output text \
    --region $REGION)

PRIVATE_SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone "${REGION}b" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${APP_NAME}-private-subnet}]" \
    --query 'Subnet.SubnetId' \
    --output text \
    --region $REGION)

echo "✅ Subnets created: $PUBLIC_SUBNET_ID, $PRIVATE_SUBNET_ID"

# Create route table for public subnet
echo "🛣️ Creating route tables..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${APP_NAME}-public-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text \
    --region $REGION)

# Add route to Internet Gateway
aws ec2 create-route \
    --route-table-id $ROUTE_TABLE_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID \
    --region $REGION

# Associate route table with public subnet
aws ec2 associate-route-table \
    --subnet-id $PUBLIC_SUBNET_ID \
    --route-table-id $ROUTE_TABLE_ID \
    --region $REGION

echo "✅ Route table configured"

# Create Security Group
echo "🔒 Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP \
    --description "Security group for Global Learning Platform" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $REGION)

# Add inbound rules
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $REGION

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $REGION

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $REGION

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 5000 \
    --cidr 0.0.0.0/0 \
    --region $REGION

echo "✅ Security group created: $SECURITY_GROUP_ID"

# Create Key Pair
echo "🔑 Creating key pair..."
aws ec2 create-key-pair \
    --key-name $KEY_NAME \
    --query 'KeyMaterial' \
    --output text \
    --region $REGION > "${KEY_NAME}.pem"

chmod 400 "${KEY_NAME}.pem"
echo "✅ Key pair created: ${KEY_NAME}.pem"

# Create RDS Subnet Group
echo "🗄️ Creating RDS subnet group..."
aws rds create-db-subnet-group \
    --db-subnet-group-name "${APP_NAME}-subnet-group" \
    --db-subnet-group-description "Subnet group for Global Learning Platform" \
    --subnet-ids $PUBLIC_SUBNET_ID $PRIVATE_SUBNET_ID \
    --region $REGION

# Create RDS Security Group
RDS_SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "${APP_NAME}-rds-sg" \
    --description "RDS Security group for Global Learning Platform" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $REGION)

aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 5432 \
    --source-group $SECURITY_GROUP_ID \
    --region $REGION

echo "✅ RDS subnet group and security group created"

# Generate secure database password
DB_PASSWORD=$(openssl rand -base64 32)

# Create RDS instance
echo "🗄️ Creating RDS PostgreSQL instance..."
aws rds create-db-instance \
    --db-instance-identifier "${APP_NAME}-db" \
    --db-instance-class db.t2.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --vpc-security-group-ids $RDS_SECURITY_GROUP_ID \
    --db-subnet-group-name "${APP_NAME}-subnet-group" \
    --no-publicly-accessible \
    --storage-type gp2 \
    --region $REGION

echo "✅ RDS instance creation initiated. This may take several minutes..."

# Get the latest Ubuntu 22.04 LTS AMI
echo "🔍 Finding Ubuntu 22.04 LTS AMI..."
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'Images|sort_by(@,&CreationDate)[-1].ImageId' \
    --output text \
    --region $REGION)

echo "✅ Using AMI: $AMI_ID"

# Launch EC2 instance
echo "🖥️ Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type t2.micro \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --subnet-id $PUBLIC_SUBNET_ID \
    --associate-public-ip-address \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${APP_NAME}-server}]" \
    --user-data file://user-data.sh \
    --query 'Instances[0].InstanceId' \
    --output text \
    --region $REGION)

echo "✅ EC2 instance launched: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region $REGION)

echo "✅ Instance is running at: $PUBLIC_IP"

# Wait for RDS to be available
echo "⏳ Waiting for RDS instance to be available..."
aws rds wait db-instance-available --db-instance-identifier "${APP_NAME}-db" --region $REGION

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "${APP_NAME}-db" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --region $REGION)

echo "✅ RDS instance is available at: $RDS_ENDPOINT"

# Save deployment info
cat > deployment-info.txt << EOF
🎉 AWS Deployment Complete!

Instance Details:
- Instance ID: $INSTANCE_ID
- Public IP: $PUBLIC_IP
- Key Pair: ${KEY_NAME}.pem
- Security Group: $SECURITY_GROUP_ID
- VPC: $VPC_ID

Database Details:
- RDS Instance: ${APP_NAME}-db
- Endpoint: $RDS_ENDPOINT
- Database: postgres
- Username: postgres
- Password: $DB_PASSWORD

Access:
- SSH: ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP
- Application: http://$PUBLIC_IP:5000

Next Steps:
1. SSH into the server and update the environment variables
2. Configure your domain name
3. Set up SSL certificate
4. Update database connection strings

Environment Variables to Set:
export DATABASE_URL="postgresql://postgres:$DB_PASSWORD@$RDS_ENDPOINT:5432/postgres"
export PGHOST="$RDS_ENDPOINT"
export PGPORT="5432"
export PGUSER="postgres"
export PGPASSWORD="$DB_PASSWORD"
export PGDATABASE="postgres"
EOF

echo "🎉 Deployment complete! Check deployment-info.txt for details."
echo "🌐 Your application will be available at: http://$PUBLIC_IP:5000"
echo "🔑 SSH access: ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP"
echo "🗄️ Database endpoint: $RDS_ENDPOINT"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
ECR_REPO_NAME="global-learning-platform"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the Docker image
docker build -t $ECR_REPO_NAME .

# Tag the image
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# Push the image to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

echo "Image pushed successfully to ECR"