# Deployment Guide

This guide covers deploying the Secure Worker Platform to production.

## Pre-Deployment Checklist

### Security Essentials
- [ ] Generate unique encryption keys for production
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure secure environment variables
- [ ] Review all security headers
- [ ] Test emergency delete functionality
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure secure database

### Code Review
- [ ] Remove console.logs with sensitive data
- [ ] Verify error messages don't leak info
- [ ] Check all API endpoints require authentication
- [ ] Test file upload limits
- [ ] Verify metadata removal works correctly

### Testing
- [ ] Test full registration flow
- [ ] Test login/logout
- [ ] Test file uploads
- [ ] Test emergency delete
- [ ] Test calendar functionality
- [ ] Test platform integrations
- [ ] Load testing (if expecting traffic)

## Deployment Options

### Option 1: Vercel (Recommended for Quick Start)

**Pros**: Easy setup, automatic HTTPS, excellent Next.js support
**Cons**: Storage limitations, need external database for production

#### Steps:
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Set up PostgreSQL database**
   - Use Vercel Postgres, or
   - Use external provider (Railway, Supabase, etc.)

3. **Update Prisma schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Configure environment variables in Vercel**
   ```bash
   vercel env add ENCRYPTION_KEY
   vercel env add SESSION_SECRET
   vercel env add DATABASE_URL
   ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

6. **Run database migration**
   ```bash
   npx prisma db push
   ```

### Option 2: Railway

**Pros**: Includes PostgreSQL, simple deployment, affordable
**Cons**: Less mature than some alternatives

#### Steps:
1. **Create Railway account** at railway.app

2. **Create new project**
   - Connect GitHub repository
   - Add PostgreSQL service

3. **Configure environment variables**
   - `ENCRYPTION_KEY`: Generate new
   - `SESSION_SECRET`: Generate new
   - `DATABASE_URL`: Provided by Railway
   - `NODE_ENV`: production
   - `NEXT_PUBLIC_API_URL`: Your Railway URL

4. **Deploy**
   - Push to main branch
   - Railway auto-deploys

5. **Run migrations**
   ```bash
   railway run npx prisma db push
   ```

### Option 3: DigitalOcean App Platform

**Pros**: Full control, predictable pricing, includes database
**Cons**: More configuration required

#### Steps:
1. **Create DigitalOcean account**

2. **Create PostgreSQL database**
   - Note connection details

3. **Create new app**
   - Connect GitHub repository
   - Select Node.js environment

4. **Configure**
   ```yaml
   # app.yaml
   name: secure-worker-platform
   services:
   - name: web
     environment_slug: node-js
     github:
       repo: your-repo
       branch: main
     build_command: npm run build
     run_command: npm start
     envs:
     - key: ENCRYPTION_KEY
       value: ${ENCRYPTION_KEY}
     - key: SESSION_SECRET
       value: ${SESSION_SECRET}
     - key: DATABASE_URL
       value: ${db.DATABASE_URL}
     - key: NODE_ENV
       value: production
   databases:
   - name: db
     engine: PG
   ```

5. **Deploy and migrate**

### Option 4: Self-Hosted (VPS)

**Pros**: Complete control, privacy, any configuration
**Cons**: More maintenance, security responsibility

#### Steps:

1. **Set up Ubuntu server** (20.04 or newer)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Install nginx
   sudo apt install nginx
   
   # Install certbot for SSL
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Set up PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE secureworker;
   CREATE USER swuser WITH ENCRYPTED PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE secureworker TO swuser;
   \q
   ```

3. **Clone and setup application**
   ```bash
   cd /var/www
   git clone your-repo secure-worker-platform
   cd secure-worker-platform
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env
   # Fill in production values
   ```

5. **Build application**
   ```bash
   npm run build
   ```

6. **Set up PM2 for process management**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "secure-worker" -- start
   pm2 startup
   pm2 save
   ```

7. **Configure nginx**
   ```nginx
   # /etc/nginx/sites-available/secure-worker
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/secure-worker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Set up SSL**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment

### 1. Verify Deployment

Test all critical features:
```bash
# Check if site is accessible
curl -I https://yourdomain.com

# Test API endpoints
curl https://yourdomain.com/api/auth/me

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

### 2. Set Up Monitoring

**Uptime Monitoring**:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

**Error Tracking**:
- Sentry
- LogRocket
- Rollbar

**Server Monitoring**:
- Grafana + Prometheus
- New Relic
- DataDog

### 3. Configure Backups

**Database Backups**:
```bash
# PostgreSQL automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump secureworker | gzip > /backups/db-$DATE.sql.gz
# Encrypt backup
gpg --symmetric --cipher-algo AES256 /backups/db-$DATE.sql.gz
# Delete unencrypted
rm /backups/db-$DATE.sql.gz
# Keep only last 7 days
find /backups -name "*.gpg" -mtime +7 -delete
```

**File Backups**:
```bash
# Backup uploads directory (encrypted)
tar -czf - /var/www/secure-worker-platform/public/uploads | \
  gpg --symmetric --cipher-algo AES256 > \
  /backups/uploads-$(date +%Y%m%d).tar.gz.gpg
```

Schedule with cron:
```bash
# Daily at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh
0 3 * * * /usr/local/bin/backup-uploads.sh
```

### 4. Set Up Logging

**Application Logs**:
```javascript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Never log sensitive data!
```

**Log Rotation**:
```bash
# /etc/logrotate.d/secure-worker
/var/www/secure-worker-platform/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 5. Performance Optimization

**Enable Compression**:
```nginx
# In nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

**Add Caching**:
```nginx
# Cache static assets
location /_next/static/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Database Optimization**:
```sql
-- Add indexes for common queries
CREATE INDEX idx_posts_user_scheduled ON posts(userId, scheduledFor);
CREATE INDEX idx_platform_posts_status ON platform_posts(status);
```

### 6. Security Hardening

**Firewall**:
```bash
# UFW on Ubuntu
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

**Fail2Ban** (prevent brute force):
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

**Rate Limiting** (nginx):
```nginx
# Define rate limit zones
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

# Apply to locations
location /api/auth/login {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://localhost:3000;
}

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

## Maintenance

### Regular Updates
```bash
# Weekly: Update dependencies
npm update
npm audit fix

# Monthly: Update system packages
sudo apt update && sudo apt upgrade

# As needed: Update Node.js
npm install -g n
n lts
```

### Health Checks
```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check process status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check database connections
psql secureworker -c "SELECT count(*) FROM pg_stat_activity;"
```

### Backup Testing
```bash
# Regularly test backup restoration
# Create test environment
# Restore backup
# Verify data integrity
```

## Rollback Procedure

If deployment fails:

1. **Quick rollback (Vercel/Railway)**:
   - Revert to previous deployment in dashboard

2. **Manual rollback (Self-hosted)**:
   ```bash
   cd /var/www/secure-worker-platform
   git checkout previous-stable-tag
   npm install
   npm run build
   pm2 restart secure-worker
   ```

3. **Database rollback**:
   ```bash
   # Restore from backup
   gunzip < /backups/db-backup.sql.gz | psql secureworker
   ```

## Troubleshooting

### Site is down
1. Check process: `pm2 status`
2. Check logs: `pm2 logs secure-worker`
3. Check nginx: `sudo nginx -t`
4. Check firewall: `sudo ufw status`

### Database connection issues
1. Check PostgreSQL: `sudo systemctl status postgresql`
2. Test connection: `psql $DATABASE_URL`
3. Check connection limits
4. Review logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

### SSL certificate expired
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Out of disk space
```bash
# Check usage
du -sh /var/www/secure-worker-platform/public/uploads/*

# Clean old uploads (carefully!)
# Implement automatic cleanup in application

# Clean logs
sudo journalctl --vacuum-time=7d
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Share session storage (Redis)
- Centralized file storage (S3, Backblaze B2)
- Database read replicas

### Vertical Scaling
- Upgrade server resources
- Optimize database queries
- Implement caching (Redis)
- Use CDN for static assets

## Cost Estimates

**Small (< 100 users)**:
- Vercel + Railway DB: ~$20/month
- DigitalOcean: ~$12/month (droplet + DB)

**Medium (100-1000 users)**:
- Railway: ~$50/month
- DigitalOcean: ~$50/month (larger droplet + DB)

**Large (1000+ users)**:
- Custom setup: $200+/month
- Consider managed services
- Implement CDN

## Support Resources

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Support: https://vercel.com/support
- Railway Docs: https://docs.railway.app

---

**Remember**: Security and privacy are paramount. Regularly review logs, update dependencies, and monitor for unusual activity.

Good luck with your deployment! 🚀
