# 🚀 Getting Started - 5 Minutes to Launch

## Absolute Fastest Setup

### Step 1: Install Dependencies (1 min)
```bash
cd /workspaces/sw
npm install
```

### Step 2: Generate Keys (30 seconds)
```bash
# Run these two commands and copy the output
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Create .env File (30 seconds)
```bash
cp .env.example .env
```

Edit `.env` and paste your generated keys:
```env
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="<paste-first-key-here>"
SESSION_SECRET="<paste-second-key-here>"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Step 4: Setup Database (1 min)
```bash
npx prisma generate
npx prisma db push
```

### Step 5: Launch! (10 seconds)
```bash
npm run dev
```

✅ **Done!** Open http://localhost:3000

---

## First Login

1. **Click "Register"**
2. **Choose username**: `testuser` (no personal info!)
3. **Create password**: At least 12 characters
4. **You're in!** 🎉

---

## Quick Test

### Test 1: Create a Post
1. Click **"Create"** tab
2. Enter title: "Test Post"
3. Click **"Create Post"**
4. ✅ Post created!

### Test 2: Upload Media
1. Stay on **"Create"** tab
2. **Drag and drop** an image
3. Wait for "✓ File uploaded and metadata removed"
4. ✅ EXIF data removed!

### Test 3: Schedule Post
1. Click **"Calendar"** tab
2. **Click on a future date**
3. Enter post title
4. ✅ Scheduled!

### Test 4: View Posts
1. Click **"Posts"** tab
2. See all your posts
3. Click **"Delete"** to remove one
4. ✅ Working!

---

## What Now?

### Add a Platform
1. Go to **"Platforms"** tab
2. Click **"+ Add Platform"**
3. Select platform (Twitter, OnlyFans, etc.)
4. Add API credentials (encrypted automatically)
5. Add custom hashtags

### Explore Features
- **Calendar**: Visual scheduling
- **Posts**: Manage all content
- **Create**: New posts with media
- **Platforms**: Cross-posting setup

### Read the Docs
- `README.md` - Full documentation
- `SECURITY.md` - How security works
- `DEPLOYMENT.md` - Deploy to production
- `QUICK_REFERENCE.md` - Command cheat sheet

---

## Emergency Delete (Important!)

**🚨 In case of emergency:**

1. Click red **"🚨 Emergency Delete"** button (top right)
2. Type **"DELETE EVERYTHING"**
3. Click **"Delete Everything"**
4. All data instantly and permanently erased

**This is irreversible - designed for safety emergencies.**

---

## Common Issues

### "Port 3000 already in use"
```bash
PORT=3001 npm run dev
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Database locked"
```bash
rm prisma/dev.db
npx prisma db push
```

---

## Production Deployment

**Ready for production?** See `DEPLOYMENT.md`

**Quick options:**
- **Vercel**: Easiest (1-click deploy)
- **Railway**: Includes database
- **DigitalOcean**: Full control
- **Self-hosted**: Maximum privacy

**Before going live:**
1. ✅ Generate new encryption keys
2. ✅ Set up HTTPS
3. ✅ Use PostgreSQL/MySQL
4. ✅ Configure backups
5. ✅ Review security settings

---

## Need Help?

- **Setup issues**: Check `SETUP.md`
- **Security questions**: See `SECURITY.md`
- **Commands**: Check `QUICK_REFERENCE.md`
- **Full guide**: Read `README.md`

---

## Key Features Recap

✅ **Privacy**: No email, no tracking, no personal info
✅ **Security**: End-to-end encryption, secure sessions
✅ **Metadata Removal**: Automatic EXIF stripping
✅ **Scheduling**: Visual calendar for planning
✅ **Cross-posting**: Multiple platforms, custom hashtags
✅ **Emergency Delete**: One-click complete erasure
✅ **Mobile Friendly**: Works on all devices

---

## Architecture Quick View

```
Frontend (React/Next.js)
    ↓
API Routes (Next.js API)
    ↓
Prisma ORM
    ↓
Database (SQLite/PostgreSQL)
    ↓
Encrypted Storage
```

**Security Layers:**
- Bcrypt passwords
- Encrypted sessions
- AES-256 data encryption
- Automatic metadata removal
- No PII collection

---

## That's It!

You now have a fully functional, secure platform running locally.

**Remember:**
- Use strong passwords
- Never use personal information
- Test the emergency delete
- Read the security documentation
- Deploy with HTTPS in production

**Stay safe! 💜**

---

For detailed information, see:
- 📖 `README.md` - Complete guide
- 🔧 `SETUP.md` - Detailed setup
- 🔐 `SECURITY.md` - Security architecture  
- 🚀 `DEPLOYMENT.md` - Production deployment
- ⚡ `QUICK_REFERENCE.md` - Command reference
- 📋 `PROJECT_SUMMARY.md` - Technical overview
