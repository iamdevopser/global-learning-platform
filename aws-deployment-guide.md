# AWS Deployment Guide for Global Learning Platform

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with Free Tier access
2. **AWS CLI** installed and configured
3. **Your Stripe API Keys** (for payment processing)
4. **Domain name** (optional, for custom domain)

## Step 1: Install AWS CLI

### For Windows:
```bash
# Download and run the AWS CLI MSI installer
# https://awscli.amazonaws.com/AWSCLIV2.msi
```

### For macOS:
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### For Linux:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## Step 2: Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

## Step 3: Deploy Infrastructure

Make the deployment script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

This will create:
- ✅ VPC with public/private subnets
- ✅ Security groups for EC2 and RDS
- ✅ EC2 t2.micro instance (Free Tier)
- ✅ RDS PostgreSQL instance (Free Tier)
- ✅ Internet Gateway and routing
- ✅ SSH key pair for access

## Step 4: Wait for Deployment

The script will:
1. Create all AWS resources
2. Launch your EC2 instance
3. Install Node.js, PM2, and Nginx
4. Set up your application
5. Configure SSL-ready Nginx

**⏳ Total deployment time: 10-15 minutes**

## Step 5: Access Your Application

After deployment completes:

1. **Check deployment-info.txt** for connection details
2. **SSH into your server**:
   ```bash
   ssh -i global-learning-platform-keypair.pem ubuntu@YOUR_PUBLIC_IP
   ```
3. **Your app will be running at**: `http://YOUR_PUBLIC_IP`

## Step 6: Configure Your Application

### Upload Your Application Code

1. **Create a ZIP file** of your current project:
   ```bash
   zip -r global-learning-platform.zip . -x "node_modules/*" "*.git/*"
   ```

2. **Upload to your server**:
   ```bash
   scp -i global-learning-platform-keypair.pem global-learning-platform.zip ubuntu@YOUR_PUBLIC_IP:/tmp/
   ```

3. **SSH into server and extract**:
   ```bash
   ssh -i global-learning-platform-keypair.pem ubuntu@YOUR_PUBLIC_IP
   cd /opt/global-learning-platform
   sudo unzip /tmp/global-learning-platform.zip
   sudo chown -R deploy:deploy /opt/global-learning-platform
   ```

### Configure Environment Variables

1. **Edit the environment file**:
   ```bash
   sudo -u deploy nano /opt/global-learning-platform/.env
   ```

2. **Update with your actual values**:
   ```env
   # Database (will be auto-filled by deployment script)
   DATABASE_URL=postgresql://postgres:PASSWORD@RDS_ENDPOINT:5432/postgres
   
   # Stripe Keys (ADD YOUR KEYS)
   STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_stripe_public_key
   
   # Session Secret
   SESSION_SECRET=your-secure-random-session-secret
   
   # Replit Auth (if using)
   REPL_ID=your-actual-repl-id
   REPLIT_DOMAINS=your-domain.com
   ```

### Install Dependencies and Start

```bash
cd /opt/global-learning-platform
sudo -u deploy npm install
sudo -u deploy npm run build
sudo -u deploy pm2 restart global-learning-platform
```

## Step 7: Set Up Domain (Optional)

### Using Route 53:

1. **Create Hosted Zone**:
   ```bash
   aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)
   ```

2. **Create A Record**:
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch file://dns-record.json
   ```

### Using External DNS:
Point your domain's A record to your EC2 public IP.

## Step 8: Set Up SSL Certificate

### Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Auto-renewal:
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### Check Application Status:
```bash
sudo -u deploy pm2 status
sudo -u deploy pm2 logs
```

### Monitor Resources:
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Update Application:
```bash
cd /opt/global-learning-platform
sudo -u deploy ./deploy-update.sh
```

## Cost Optimization Tips

1. **Monitor Free Tier Usage**:
   - Set up AWS Budgets alerts
   - Check AWS Billing Dashboard regularly

2. **Auto-shutdown during off-hours**:
   ```bash
   # Stop instance at night (optional)
   sudo crontab -e
   # Add: 0 2 * * * /usr/local/bin/aws ec2 stop-instances --instance-ids i-1234567890abcdef0
   ```

3. **Use CloudWatch for monitoring**:
   - Set up CPU/Memory alerts
   - Monitor application performance

## Troubleshooting

### Application Not Starting:
```bash
sudo -u deploy pm2 logs global-learning-platform
sudo systemctl status nginx
```

### Database Connection Issues:
```bash
# Test database connection
pg_isready -h RDS_ENDPOINT -p 5432 -U postgres
```

### SSL Certificate Issues:
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl reload nginx
```

## Free Tier Limits

**Stay within these limits to avoid charges:**

- **EC2**: 750 hours/month (t2.micro)
- **RDS**: 750 hours/month (db.t2.micro)
- **Storage**: 30GB EBS + 20GB RDS
- **Data Transfer**: 15GB outbound/month

## Security Best Practices

1. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Firewall Configuration**:
   ```bash
   sudo ufw status
   ```

3. **Monitor Access Logs**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

4. **Backup Database**:
   ```bash
   # RDS automated backups are enabled
   # Manual backup:
   pg_dump -h RDS_ENDPOINT -U postgres -d postgres > backup.sql
   ```

## Support

If you encounter issues:

1. Check the logs: `/var/log/user-data.log`
2. Review application logs: `pm2 logs`
3. Check system status: `systemctl status nginx`
4. Monitor AWS CloudWatch for resource usage

Your Global Learning Platform is now running on AWS Free Tier! 🎉