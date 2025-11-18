# 🔒 Secure Worker Platform

A privacy-first, safety-focused content management platform designed specifically for sex workers. This platform prioritizes anonymity, security, and user safety above all else.

## 🌟 Key Features

### Security & Privacy
- **End-to-End Encryption**: All sensitive data (posts, descriptions, file paths) encrypted at rest
- **Automatic Metadata Removal**: EXIF data, GPS coordinates, and all identifying information stripped from uploads
- **No Personal Information**: Only username and encrypted data stored - no email, phone, or identifying details required
- **Secure Authentication**: Bcrypt password hashing with 12 rounds, iron-session for session management
- **Privacy Headers**: CSP, X-Frame-Options, X-Content-Type-Options, and more
- **Emergency Delete**: Instant, permanent deletion of all user data and files with one button

### Content Management
- **Monthly Calendar View**: Visual scheduling with drag-and-drop interface
- **Post Scheduling**: Schedule content for future publication
- **Media Upload**: Support for images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV)
- **Draft System**: Save posts as drafts before publishing

### Cross-Platform Integration
- **Multi-Platform Support**: Twitter/X, OnlyFans, Instagram, Fansly, Reddit, and more
- **Custom Hashtags**: Set platform-specific hashtags that auto-apply to posts
- **Encrypted Credentials**: Platform API keys stored with AES encryption
- **Status Tracking**: Monitor posting status across all platforms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd /workspaces/sw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Generate encryption keys**
   ```bash
   node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
   node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copy these values into your `.env` file.

5. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
/workspaces/sw/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post management
│   │   ├── platforms/     # Platform integrations
│   │   ├── upload/        # File upload & scrubbing
│   │   └── emergency-delete/ # Emergency data deletion
│   ├── dashboard/         # Main dashboard page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Login/register page
│   └── globals.css        # Global styles
├── components/
│   ├── Calendar.tsx       # Monthly calendar view
│   ├── PostForm.tsx       # Create/edit posts
│   ├── PostList.tsx       # View all posts
│   ├── PlatformManager.tsx # Manage platform integrations
│   └── EmergencyDelete.tsx # Emergency delete button
├── lib/
│   ├── auth.ts            # Password hashing
│   ├── encryption.ts      # Data encryption utilities
│   ├── metadata-scrubber.ts # EXIF removal service
│   ├── prisma.ts          # Database client
│   └── session.ts         # Session configuration
├── prisma/
│   └── schema.prisma      # Database schema
└── public/
    └── uploads/           # Scrubbed media files (gitignored)
```

## 🔐 Security Features Explained

### 1. Automatic Metadata Scrubbing
All uploaded images and videos are automatically processed to remove:
- EXIF data (camera model, settings, software)
- GPS coordinates and location data
- Timestamps and date information
- Device identifiers
- Any other embedded metadata

Files are given randomized names and stored securely.

### 2. Data Encryption
Sensitive data is encrypted using AES-256 before storage:
- Post titles and descriptions
- File paths
- Platform API credentials
- Any optional profile information

### 3. No Personal Information
The platform deliberately collects ZERO personal information:
- No email addresses
- No phone numbers
- No real names
- No payment information
- No tracking cookies

Only a username and encrypted password are stored.

### 4. Emergency Delete
In case of emergency, users can instantly and permanently delete:
- All posts and content
- All uploaded media files
- All platform connections
- The entire account

This action is immediate and irreversible - designed for safety emergencies.

### 5. Secure Sessions
- HTTP-only cookies prevent XSS attacks
- Strict same-site policy prevents CSRF
- Sessions expire after 7 days
- Secure flag enabled in production

## 🎯 Usage Guide

### Creating Your Account
1. Navigate to the homepage
2. Click "Register"
3. Choose a username (no personal info!)
4. Create a strong password (minimum 12 characters)
5. You're ready to go!

### Uploading Content
1. Go to the "Create" tab
2. Add a title and optional description
3. Drag and drop an image or video
4. The system automatically removes all metadata
5. Set a schedule or save as draft
6. Create the post

### Scheduling Posts
1. Use the "Calendar" tab to view all scheduled content
2. Click on any date to create a scheduled post
3. Click on existing events to view details

### Adding Platforms
1. Go to the "Platforms" tab
2. Click "+ Add Platform"
3. Select the platform type
4. Enter API credentials (securely encrypted)
5. Add custom hashtags if desired
6. Your platform is ready for cross-posting

### Emergency Situations
If you need to immediately delete everything:
1. Click the red "🚨 Emergency Delete" button in the header
2. Type "DELETE EVERYTHING" to confirm
3. All your data will be permanently erased immediately

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Encryption Keys (MUST be changed in production!)
ENCRYPTION_KEY="your-32-byte-encryption-key-here"
SESSION_SECRET="your-session-secret-here"

# Environment
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Optional: Platform API Keys
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
# Add other platform keys as needed
```

### Database

The platform uses SQLite for development (easy setup, no external database needed). For production, you can easily switch to PostgreSQL or MySQL by updating the `DATABASE_URL` in `.env` and changing the provider in `prisma/schema.prisma`.

### Production Deployment

**IMPORTANT**: Before deploying to production:

1. **Generate strong encryption keys**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use HTTPS only** - Never run in production without SSL/TLS

3. **Update database** - Consider PostgreSQL or MySQL for production

4. **Set NODE_ENV=production** in environment variables

5. **Configure platform APIs** - Add production API credentials

6. **Review security headers** in `next.config.js`

7. **Set up regular backups** (encrypted, of course!)

## 🛡️ Safety Best Practices

### For Users
1. **Use a VPN** when accessing the platform
2. **Never use personal information** in usernames or content
3. **Use strong, unique passwords** (consider a password manager)
4. **Enable 2FA on platform integrations** when possible
5. **Keep the Emergency Delete button** in mind for emergencies
6. **Regularly review** what content is scheduled/published

### For Deployment
1. Always use HTTPS in production
2. Keep dependencies updated for security patches
3. Regularly rotate encryption keys (with data migration)
4. Monitor for suspicious activity
5. Implement rate limiting on API endpoints
6. Set up logging (but never log sensitive data!)
7. Regular security audits

## 🎨 Customization

### Adding New Platforms
To add support for a new platform:

1. Add the platform option in `components/PlatformManager.tsx`
2. Create a new posting service in `lib/platforms/`
3. Implement the platform's API integration
4. Update the cross-posting logic

### Styling
The platform uses Tailwind CSS for styling. Customize:
- Colors in `tailwind.config.ts`
- Global styles in `app/globals.css`
- Component-specific styles inline

## 🔧 Advanced Features

### Video Metadata Scrubbing
For production video metadata removal, install ffmpeg:

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

The system will automatically use ffmpeg when available for more thorough video scrubbing.

### Rate Limiting
Consider adding rate limiting middleware for API routes in production to prevent abuse.

### Backup System
While the platform is designed for minimal data retention, consider implementing encrypted backups for user safety.

## 📝 Development

### Database Changes
After modifying `prisma/schema.prisma`:
```bash
npx prisma generate
npx prisma db push
```

### View Database
```bash
npx prisma studio
```

### Linting
```bash
npm run lint
```

## ⚠️ Important Warnings

1. **This is beta software** - Test thoroughly before production use
2. **Encryption keys** - NEVER commit `.env` to version control
3. **Legal compliance** - Ensure compliance with local laws regarding content
4. **Platform ToS** - Review terms of service for each integrated platform
5. **Data retention** - Even with deletion, backups may exist elsewhere
6. **No guarantees** - Use at your own risk; this is provided as-is

## 🤝 Contributing

This project is designed with safety in mind. If you find security vulnerabilities, please report them privately.

## 📄 License

This project is provided as-is for personal use. Modify as needed for your specific requirements.

## 💡 Philosophy

This platform was built on these core principles:

1. **Privacy is paramount** - Collect nothing, encrypt everything
2. **Safety over features** - Every feature considers user safety
3. **User control** - Users own and control their data completely
4. **Transparency** - Open source, auditable code
5. **Simplicity** - Easy to use, hard to misuse

## 🆘 Support

For security issues: DO NOT create public issues. Contact privately.

For feature requests and bugs: Create issues on the project repository.

---

**Remember**: Your safety and privacy are the top priorities. Use strong passwords, stay vigilant, and never hesitate to use the Emergency Delete button if needed.

Stay safe! 💜