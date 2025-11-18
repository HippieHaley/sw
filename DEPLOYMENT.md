# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

**Critical Security Settings** (MUST change from defaults):

```bash
# Generate secure JWT secret (32+ characters)
JWT_SECRET=$(openssl rand -base64 48)

# Generate secure encryption key (exactly 32 characters)
ENCRYPTION_KEY=$(openssl rand -base64 24)

# Set production environment
NODE_ENV=production

# Configure allowed origins (your domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Server Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **SSL Certificate**: Required for production
- **Reverse Proxy**: Nginx or Apache recommended
- **Firewall**: Configure to allow only necessary ports

### 3. Database Setup

**Development:**
- SQLite is sufficient (included)
- Automatic initialization on first run

**Production:**
- Consider PostgreSQL for better performance
- Regular automated backups
- Encrypted backups recommended

### 4. Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/HippieHaley/sw.git
cd sw

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
nano .env  # Update with secure values

# 4. Test locally
npm start

# 5. Run tests
node test/api.test.js
```

### 5. Production Deployment

#### Option A: Direct Node.js

```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server/index.js --name sw-platform

# Enable startup on boot
pm2 startup
pm2 save

# Monitor
pm2 logs sw-platform
```

#### Option B: Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server/index.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

### 6. Nginx Configuration

Create `/etc/nginx/sites-available/sw-platform`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/sw-platform /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### 8. Firewall Configuration

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### 9. Monitoring & Logging

**Application Logs:**
```bash
# PM2 logs
pm2 logs sw-platform

# Or direct logs
tail -f /path/to/logs/app.log
```

**System Monitoring:**
```bash
# CPU, Memory, Disk
htop

# Disk usage
df -h

# Check service status
pm2 status
# or
systemctl status sw-platform
```

### 10. Backup Strategy

**Database Backup:**
```bash
# Create backup script
cat > /usr/local/bin/backup-sw.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/sw"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
cp /app/data/secure.db $BACKUP_DIR/secure_$DATE.db

# Backup uploads (optional, can be large)
# tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /app/uploads

# Keep only last 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

# Encrypt backup
openssl enc -aes-256-cbc -salt -in $BACKUP_DIR/secure_$DATE.db \
    -out $BACKUP_DIR/secure_$DATE.db.enc -k "your-backup-password"
rm $BACKUP_DIR/secure_$DATE.db
EOF

chmod +x /usr/local/bin/backup-sw.sh

# Add to crontab (daily at 2 AM)
(crontab -l; echo "0 2 * * * /usr/local/bin/backup-sw.sh") | crontab -
```

### 11. Security Hardening

**System Updates:**
```bash
apt-get update && apt-get upgrade -y
```

**Disable Root Login:**
```bash
# Edit SSH config
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd
```

**Install Fail2Ban:**
```bash
apt-get install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

**Node.js Security:**
```bash
# Audit dependencies
npm audit

# Update vulnerable packages
npm audit fix
```

### 12. Post-Deployment Testing

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Test registration
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Test rate limiting
for i in {1..150}; do 
  curl https://yourdomain.com/api/health; 
done
```

### 13. Monitoring Setup

**Option A: Simple Uptime Monitoring**
```bash
# Add to crontab (check every 5 minutes)
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Site down!" | mail -s "SW Platform Alert" admin@yourdomain.com
```

**Option B: Professional Monitoring**
- UptimeRobot (free tier available)
- Pingdom
- StatusCake
- Self-hosted: Prometheus + Grafana

### 14. Performance Optimization

**Enable Compression:**
Already included in Helmet.js and Nginx config.

**Database Optimization:**
```sql
-- For SQLite
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA temp_store=MEMORY;
```

**Caching Headers:**
Already configured in Express static middleware.

### 15. Maintenance

**Regular Tasks:**
- Weekly: Check logs for errors
- Monthly: Review and rotate logs
- Monthly: Test backups
- Quarterly: Security audit
- Quarterly: Update dependencies

**Update Application:**
```bash
# Backup first
/usr/local/bin/backup-sw.sh

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart sw-platform
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs sw-platform --lines 100

# Check environment variables
pm2 env 0

# Check port availability
netstat -tulpn | grep 3000
```

### Database Errors
```bash
# Check permissions
ls -la /app/data/

# Verify database integrity
sqlite3 /app/data/secure.db "PRAGMA integrity_check;"
```

### High Memory Usage
```bash
# Check Node.js process
pm2 monit

# Restart if needed
pm2 restart sw-platform
```

### SSL Certificate Issues
```bash
# Check certificate expiry
certbot certificates

# Force renewal
certbot renew --force-renewal
```

## Support

For issues during deployment:
1. Check logs first: `pm2 logs` or `journalctl -u sw-platform`
2. Review this guide
3. Check GitHub issues
4. Create new issue with logs

## Security Contacts

For security issues during deployment:
- Use GitHub Security Advisories
- Do not post security issues publicly

---

**Remember:** Never commit `.env` file with real secrets to version control!
