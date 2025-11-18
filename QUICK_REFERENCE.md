# Quick Reference Guide

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open database GUI
npx prisma migrate   # Create migration
```

### Generate Keys
```bash
# Encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Directory Quick Reference

```
app/
  api/               → API endpoints
    auth/           → Login, register, logout
    posts/          → Post management
    platforms/      → Platform integrations
    upload/         → File upload
    emergency-delete/ → Data deletion
  dashboard/        → Main app page
  page.tsx          → Login page
  
components/
  Calendar.tsx      → Calendar view
  PostForm.tsx      → Create posts
  PostList.tsx      → View posts
  PlatformManager.tsx → Manage platforms
  EmergencyDelete.tsx → Delete button
  
lib/
  auth.ts           → Password functions
  encryption.ts     → Encrypt/decrypt
  metadata-scrubber.ts → Strip EXIF
  prisma.ts         → Database client
  session.ts        → Session config
```

## API Quick Reference

### Auth
```bash
# Register
POST /api/auth/register
{ "username": "string", "password": "string" }

# Login
POST /api/auth/login
{ "username": "string", "password": "string" }

# Logout
POST /api/auth/logout

# Current user
GET /api/auth/me
```

### Posts
```bash
# List posts
GET /api/posts

# Create post
POST /api/posts
{ "title": "string", "description": "string?", "filePath": "string?", 
  "scheduledFor": "datetime?", "status": "draft|scheduled" }

# Get post
GET /api/posts/[id]

# Update post
PATCH /api/posts/[id]
{ "title": "string?", "description": "string?", "scheduledFor": "datetime?", 
  "status": "draft|scheduled|published|failed?" }

# Delete post
DELETE /api/posts/[id]
```

### Upload
```bash
# Upload file
POST /api/upload
FormData with 'file' field
```

### Platforms
```bash
# List platforms
GET /api/platforms

# Add platform
POST /api/platforms
{ "platformName": "string", "config": {}, "customHashtags": "string?" }
```

### Emergency
```bash
# Delete everything
POST /api/emergency-delete
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="32-byte-hex-string"
SESSION_SECRET="32-byte-hex-string"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Database Models

### User
- id, username, passwordHash, createdAt, lastLogin, encryptedData

### Post
- id, userId, encryptedTitle, encryptedDescription, encryptedFilePath
- scheduledFor, publishedAt, status, createdAt, updatedAt

### Platform
- id, userId, platformName, encryptedConfig, customHashtags, isActive

### PlatformPost
- id, postId, platformId, externalId, status, errorMessage, postedAt

## Troubleshooting

### Port in use
```bash
PORT=3001 npm run dev
```

### Prisma errors
```bash
npx prisma generate
rm -rf node_modules/.prisma
npm install
```

### Build errors
```bash
rm -rf .next
npm run build
```

### Database locked
```bash
rm prisma/dev.db
npx prisma db push
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

## Security Checklist

- [ ] .env not committed to git
- [ ] Unique encryption keys generated
- [ ] HTTPS enabled (production)
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] File upload limits set
- [ ] Backups configured
- [ ] Monitoring enabled

## Testing Checklist

- [ ] Registration works
- [ ] Login/logout works
- [ ] File upload removes metadata
- [ ] Posts can be created/edited/deleted
- [ ] Calendar displays correctly
- [ ] Platform integrations save
- [ ] Emergency delete works
- [ ] Session persists correctly
- [ ] Mobile responsive
- [ ] All API endpoints authenticated

## Production Checklist

- [ ] New encryption keys generated
- [ ] NODE_ENV=production
- [ ] Production database configured
- [ ] HTTPS/SSL certificate
- [ ] Domain configured
- [ ] Backups automated
- [ ] Monitoring tools installed
- [ ] Error tracking configured
- [ ] Rate limiting active
- [ ] Logs configured
- [ ] Tested on staging

## File Locations

- **Uploads**: `public/uploads/` (gitignored)
- **Temp files**: `temp/` (gitignored)
- **Database**: `prisma/dev.db` (gitignored)
- **Logs**: Configure in production
- **Backups**: Configure in production

## Support Resources

- Main docs: `README.md`
- Setup: `SETUP.md`
- Security: `SECURITY.md`
- Deployment: `DEPLOYMENT.md`
- Summary: `PROJECT_SUMMARY.md`

## Emergency Procedures

### If compromised
1. Rotate encryption keys
2. Invalidate all sessions
3. Review access logs
4. Update passwords
5. Audit code changes

### If down
1. Check server status
2. Check database connection
3. Review error logs
4. Check disk space
5. Restart services

### If slow
1. Check database queries
2. Review file upload sizes
3. Check memory usage
4. Review logs
5. Consider scaling

## Quick Tips

- Test metadata removal: Upload image with GPS data
- Use Prisma Studio: `npx prisma studio`
- Check file permissions: `ls -la public/uploads/`
- Monitor logs: `tail -f error.log`
- Generate test data: Use Prisma seed scripts
- Clear browser cache if CSS not updating
- Use incognito for testing login
- Check Network tab in DevTools for API errors

## Useful Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# List running processes
ps aux | grep node

# Check port usage
lsof -i :3000

# Check disk space
df -h

# Monitor logs
tail -f logs/error.log

# Database size
du -sh prisma/dev.db
```

---

Keep this handy for quick reference! 📝
