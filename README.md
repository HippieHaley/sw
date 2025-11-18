# Secure Platform for Sex Workers

A privacy-first, safety-focused platform designed specifically for sex workers to manage content, schedules, and cross-platform posting with built-in security features.

## 🔒 Security & Privacy Features

- **Private Profile Logins**: Secure authentication with JWT tokens
- **Encrypted Data Storage**: All sensitive data encrypted at rest using AES-256-GCM
- **Automatic Metadata Scrubbing**: Removes EXIF and metadata from uploaded images automatically
- **No Personal Information Collection**: Minimal data collection - only username and password
- **Emergency Delete Button**: Instantly delete all content with one click
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js integration for enhanced security
- **No Tracking**: Zero analytics or tracking scripts

## ✨ Features

### 1. Content Management
- Upload images and videos with automatic metadata removal
- Schedule content for future posting
- Track content status (draft, scheduled, published)
- Emergency delete all content instantly

### 2. Monthly Scheduling Calendar
- Visual calendar view for planning content
- Create and manage events
- Link content to specific dates
- Navigate between months

### 3. Cross-Platform Posting
- Connect to multiple platforms:
  - Twitter/X
  - Instagram
  - OnlyFans
  - Fansly
  - ManyVids
  - Reddit
- Encrypted credential storage
- Cross-post content to multiple platforms simultaneously

### 4. Custom Hashtags per Platform
- Set platform-specific hashtag collections
- Save and reuse hashtags for each platform
- Optimize content for different audiences

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HippieHaley/sw.git
cd sw
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `JWT_SECRET`: Strong random string for JWT tokens
- `ENCRYPTION_KEY`: 32-character key for data encryption
- Other settings as needed

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## 📁 Project Structure

```
sw/
├── server/
│   ├── index.js              # Main server file
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── content.js        # Content management routes
│   │   ├── calendar.js       # Calendar routes
│   │   └── platforms.js      # Platform integration routes
│   ├── models/               # Database models
│   └── utils/
│       ├── database.js       # SQLite database setup
│       ├── encryption.js     # Encryption utilities
│       └── metadataScrubber.js  # EXIF removal
├── public/
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   └── style.css         # Styles
│   └── js/
│       └── app.js            # Frontend application
├── uploads/                  # Uploaded files (git-ignored)
├── data/                     # Database files (git-ignored)
├── package.json
└── .env.example              # Environment variables template
```

## 🔐 Security Best Practices

### For Users
1. **Use strong passwords** - minimum 8 characters
2. **Keep your credentials secure** - never share your login
3. **Use the emergency delete** - if you ever feel unsafe
4. **Review connected platforms** - regularly audit platform connections
5. **Verify metadata removal** - test with a sample image to verify EXIF data is removed

### For Deployment
1. **Change all default secrets** in `.env`
2. **Use HTTPS** - always deploy behind SSL/TLS
3. **Set strong JWT_SECRET** - use a cryptographically secure random string
4. **Set strong ENCRYPTION_KEY** - exactly 32 characters, randomly generated
5. **Regular backups** - backup your database regularly
6. **Keep dependencies updated** - run `npm audit` regularly
7. **Restrict CORS** - set `ALLOWED_ORIGINS` in production
8. **Use environment variables** - never commit secrets to git

## 🛡️ Privacy Guarantees

- **No analytics or tracking** - Zero third-party scripts
- **No IP logging** - We don't track your location
- **No email required** - Just username and password
- **Encrypted storage** - All data encrypted at rest
- **Metadata removal** - EXIF data automatically stripped from uploads
- **Emergency deletion** - Complete data removal available instantly

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/emergency-logout` - Emergency logout

### Content
- `GET /api/content` - List all content
- `POST /api/content/upload` - Upload with metadata scrubbing
- `GET /api/content/:id` - Get specific content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `POST /api/content/emergency-delete` - Delete all content

### Calendar
- `GET /api/calendar/events` - Get events for month
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### Platforms
- `GET /api/platforms` - List connected platforms
- `POST /api/platforms/connect` - Connect platform
- `DELETE /api/platforms/:id` - Disconnect platform
- `GET /api/platforms/:platform/hashtags` - Get hashtags
- `POST /api/platforms/:platform/hashtags` - Set hashtags
- `POST /api/platforms/cross-post` - Cross-post content

## 🧪 Testing

Run tests:
```bash
npm test
```

## 🤝 Contributing

This is a safety-critical application. All contributions must prioritize:
1. User privacy and security
2. Data protection
3. Safe handling of sensitive information

## 📄 License

MIT License - See LICENSE file for details

## ⚠️ Important Notes

1. **Metadata Scrubbing**: Currently supports JPEG images. Video metadata removal requires ffmpeg integration.
2. **Platform APIs**: Cross-posting is simulated - requires actual API integration with each platform.
3. **Encryption**: Uses AES-256-GCM. Ensure `ENCRYPTION_KEY` is kept secure and backed up.
4. **Database**: Uses SQLite for simplicity. Consider PostgreSQL for production.

## 🆘 Support

For security issues, please report responsibly by creating a private security advisory.

For general issues or questions, please open an issue on GitHub.

---

**Remember**: Your safety and privacy are the top priorities. Use the emergency delete button if you ever feel unsafe.