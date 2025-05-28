#!/bin/bash

# User Data Script for Global Learning Platform
# This script runs when the EC2 instance first starts

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "🚀 Starting Global Learning Platform setup..."

# Update the system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y curl wget git nginx postgresql-client

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally for process management
npm install -g pm2

# Create application directory
mkdir -p /opt/global-learning-platform
cd /opt/global-learning-platform

# Create a deploy user
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# Set up the application directory
chown -R deploy:deploy /opt/global-learning-platform

# Create basic application structure
sudo -u deploy mkdir -p /opt/global-learning-platform/{server,client,shared}

# Create a basic package.json
sudo -u deploy tee /opt/global-learning-platform/package.json > /dev/null << 'EOF'
{
  "name": "global-learning-platform",
  "version": "1.0.0",
  "description": "Global Learning Platform",
  "main": "server/index.js",
  "scripts": {
    "start": "NODE_ENV=production node server/index.js",
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client",
    "build:client": "cd client && npm run build",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create environment file template
sudo -u deploy tee /opt/global-learning-platform/.env > /dev/null << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=postgres

# Application Configuration
NODE_ENV=production
PORT=5000

# Session Configuration
SESSION_SECRET=your-session-secret-here

# Stripe Configuration (Add your keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Replit Auth Configuration
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.com
EOF

# Create a basic server file
sudo -u deploy tee /opt/global-learning-platform/server/index.js > /dev/null << 'EOF'
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic route
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Global Learning Platform API is running!',
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
});
EOF

# Install dependencies
cd /opt/global-learning-platform
sudo -u deploy npm install

# Configure Nginx
tee /etc/nginx/sites-available/global-learning-platform > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/global-learning-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start and enable services
systemctl enable nginx
systemctl start nginx

# Start the application with PM2
cd /opt/global-learning-platform
sudo -u deploy pm2 start server/index.js --name "global-learning-platform"
sudo -u deploy pm2 startup
sudo -u deploy pm2 save

# Set up log rotation
tee /etc/logrotate.d/global-learning-platform > /dev/null << 'EOF'
/opt/global-learning-platform/logs/*.log {
    daily
    rotate 7
    missingok
    notifempty
    sharedscripts
    compress
    delaycompress
    postrotate
        sudo -u deploy pm2 reload global-learning-platform
    endscript
}
EOF

# Create a deployment script for future updates
sudo -u deploy tee /opt/global-learning-platform/deploy-update.sh > /dev/null << 'EOF'
#!/bin/bash
set -e

echo "🔄 Updating Global Learning Platform..."

# Pull latest code (when repository is set up)
# git pull origin main

# Install/update dependencies
npm install

# Build client if needed
if [ -d "client" ]; then
    cd client && npm install && npm run build && cd ..
fi

# Restart the application
pm2 reload global-learning-platform

echo "✅ Update complete!"
EOF

chmod +x /opt/global-learning-platform/deploy-update.sh

# Create a monitoring script
sudo -u deploy tee /opt/global-learning-platform/health-check.sh > /dev/null << 'EOF'
#!/bin/bash

# Simple health check script
HEALTH_URL="http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application health check failed (HTTP $RESPONSE)"
    # Restart the application
    pm2 restart global-learning-platform
    exit 1
fi
EOF

chmod +x /opt/global-learning-platform/health-check.sh

# Set up cron job for health checks
(crontab -u deploy -l 2>/dev/null; echo "*/5 * * * * /opt/global-learning-platform/health-check.sh >> /var/log/health-check.log 2>&1") | crontab -u deploy -

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Create completion marker
touch /var/log/user-data-complete

echo "🎉 Global Learning Platform setup complete!"
echo "📝 Check /var/log/user-data.log for detailed setup logs"
echo "🌐 Application should be accessible on port 80"
echo "📊 Use 'pm2 status' to check application status"
echo "📄 Use 'pm2 logs' to view application logs"