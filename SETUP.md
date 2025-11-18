# Setup Guide

This guide will walk you through setting up the Secure Worker Platform from scratch.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm**: Usually comes with Node.js
  - Check: `npm --version`

### Optional (Recommended)
- **ffmpeg**: For video metadata removal
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: Download from https://ffmpeg.org/

- **Git**: For version control
  - Check: `git --version`

## Step-by-Step Setup

### 1. Project Setup

```bash
# Navigate to the project directory
cd /workspaces/sw

# Install all dependencies
npm install
```

This will install all required packages from `package.json`.

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Now edit the `.env` file with your configuration:

```bash
# Generate a secure encryption key (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate a secure session secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy these generated values into your `.env` file:

```env
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="<paste-your-encryption-key-here>"
SESSION_SECRET="<paste-your-session-secret-here>"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**IMPORTANT**: 
- Never commit `.env` to version control
- Use different keys for different environments
- Keep these keys secret and secure

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create database and apply schema
npx prisma db push
```

You should see output confirming the database was created with all tables.

### 4. Create Required Directories

```bash
# Create uploads directory (for processed media)
mkdir -p public/uploads

# Create temp directory (for upload processing)
mkdir -p temp
```

These directories are gitignored by default.

### 5. Start Development Server

```bash
npm run dev
```

The application should now be running at http://localhost:3000

### 6. Create Your First Account

1. Open http://localhost:3000 in your browser
2. Click "Register"
3. Enter a username (no personal info!)
4. Create a strong password (minimum 12 characters)
5. Click "Create Account"

You'll be automatically logged in and redirected to the dashboard.

## Verifying the Setup

### Check Database
```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can:
- View all tables
- See your user record (with hashed password)
- Check that encryption is working

### Test File Upload
1. Go to the "Create" tab
2. Try uploading a test image
3. Check that metadata was removed
4. Verify the file appears in `public/uploads/`

### Test Calendar
1. Go to the "Calendar" tab
2. Click on a future date
3. Create a scheduled post
4. Verify it appears on the calendar

### Test Emergency Delete
**WARNING**: This will delete all your data!
1. Create some test content first
2. Click the red "🚨 Emergency Delete" button
3. Type "DELETE EVERYTHING"
4. Confirm deletion
5. Verify you're logged out and all data is gone

## Common Issues

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Database Issues
```bash
# Reset database (WARNING: deletes all data)
rm prisma/dev.db
npx prisma db push
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Sharp Installation Issues (Windows/ARM)
```bash
# Force rebuild sharp
npm rebuild sharp
```

## Development Tips

### Hot Reload
The development server supports hot reload. Changes to:
- React components: Instant reload
- API routes: Server restart required
- Prisma schema: Run `npx prisma generate` after changes

### Viewing Logs
- Server logs: Shown in terminal
- Browser console: F12 or Cmd+Option+I (Mac)

### Database Inspection
```bash
# CLI access to database
npx prisma studio

# Or use SQLite browser
sqlite3 prisma/dev.db
```

## Production Setup

### 1. Choose Hosting Provider
Recommended providers:
- **Vercel**: Easy deployment, HTTPS included
- **Railway**: Simple setup with database
- **DigitalOcean**: Full control
- **AWS**: Scalable but complex

### 2. Database Setup
For production, use PostgreSQL or MySQL:

```prisma
// In prisma/schema.prisma, change datasource:
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

Then migrate:
```bash
npx prisma db push
```

### 3. Environment Variables
Set these in your hosting provider:
- `ENCRYPTION_KEY`: New, unique key
- `SESSION_SECRET`: New, unique key  
- `NODE_ENV`: "production"
- `DATABASE_URL`: Your production database URL
- `NEXT_PUBLIC_API_URL`: Your production URL

### 4. Build and Deploy
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy (depends on hosting provider)
# Vercel: vercel deploy
# Railway: git push
# Others: Follow provider docs
```

### 5. Post-Deployment
- [ ] Test login/registration
- [ ] Test file upload
- [ ] Verify HTTPS is working
- [ ] Test emergency delete
- [ ] Check security headers
- [ ] Set up monitoring
- [ ] Configure backups

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check disk space (uploads directory)

**Weekly**:
- Review security advisories
- Check for dependency updates

**Monthly**:
- Run `npm audit`
- Review access logs
- Test backup restoration
- Rotate encryption keys (advanced)

### Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update Prisma
npx prisma migrate dev
```

### Backups

**Database**:
```bash
# SQLite
cp prisma/dev.db backup-$(date +%Y%m%d).db

# PostgreSQL
pg_dump dbname > backup-$(date +%Y%m%d).sql
```

**Uploads**:
```bash
# Create encrypted backup
tar -czf uploads-backup.tar.gz public/uploads/
gpg -c uploads-backup.tar.gz
```

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database locked
```bash
# Kill any processes using the database
lsof prisma/dev.db
# Then restart dev server
```

### Session issues
```bash
# Clear cookies in browser
# Or use incognito mode
```

### Upload failures
- Check disk space: `df -h`
- Verify directory permissions: `ls -la public/uploads`
- Check file size limits

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Need Help?

1. Check error messages in terminal
2. Review browser console for frontend errors
3. Check `SECURITY.md` for security questions
4. Review `README.md` for usage guides
5. Check Prisma logs: Set `DEBUG=prisma:*`

## Next Steps

After successful setup:
1. Read `SECURITY.md` for security best practices
2. Review `README.md` for full documentation
3. Customize styling in `tailwind.config.ts`
4. Add platform integrations
5. Set up monitoring and alerts
6. Plan your content strategy

---

**Congratulations!** Your secure platform is now ready to use. Stay safe! 💜
