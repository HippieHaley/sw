# Security Policy

## Security Features

This platform implements multiple layers of security to protect users:

### 1. Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt (10 rounds)
- **Token Expiration**: 24-hour token lifetime
- **Minimum Password Length**: 8 characters required

### 2. Data Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Encrypted Fields**: 
  - Platform API credentials
  - Sensitive user data
- **Key Management**: Environment variable configuration

### 3. Metadata Scrubbing
- **Automatic EXIF Removal**: All uploaded images
- **JPEG Support**: Full EXIF/IPTC removal
- **Privacy Protection**: Location and device data removed

### 4. Network Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Configuration**: Configurable allowed origins
- **Security Headers**: Helmet.js implementation
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options

### 5. Privacy Measures
- **Minimal Data Collection**: Only username and password
- **No Email Required**: Anonymous registration
- **No IP Logging**: No location tracking
- **No Analytics**: Zero third-party tracking
- **Emergency Delete**: Complete data removal on demand

## Deployment Security Checklist

### Before Production Deployment:

- [ ] Generate strong `JWT_SECRET` (minimum 32 characters)
- [ ] Generate secure `ENCRYPTION_KEY` (exactly 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Review and update rate limiting settings
- [ ] Change default database path
- [ ] Set up monitoring and logging
- [ ] Review all environment variables
- [ ] Test emergency delete functionality
- [ ] Verify metadata scrubbing on all file types

### Environment Variables

Required production environment variables:

```bash
# Server
PORT=3000
NODE_ENV=production

# Security (MUST CHANGE!)
JWT_SECRET=<your-secure-random-string-min-32-chars>
ENCRYPTION_KEY=<exactly-32-character-random-string>

# Database
DB_PATH=./data/secure.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS (production only)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Vulnerability Reporting

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Create a private security advisory on GitHub
3. Or email security concerns to repository maintainers
4. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices for Users

### Account Security
1. Use strong, unique passwords
2. Don't share your credentials
3. Log out after each session
4. Use the emergency delete if compromised

### Content Safety
1. Review files before upload
2. Verify metadata has been removed
3. Use different usernames across platforms
4. Regularly review connected platforms
5. Keep platform credentials secure

### Emergency Procedures
1. **Compromised Account**: Use emergency delete button
2. **Data Breach Concern**: Delete all content immediately
3. **Safety Threat**: Emergency logout + delete all
4. **Platform Compromise**: Disconnect affected platforms

## Known Limitations

### Current Implementation
1. **Video Metadata**: Video EXIF removal requires ffmpeg (not yet implemented)
2. **Database**: SQLite for development (recommend PostgreSQL for production)
3. **Platform APIs**: Cross-posting simulation (requires API integration)
4. **Backup/Recovery**: No built-in encrypted backup (manual backups required)

### Recommended Enhancements
1. Implement 2FA (Two-Factor Authentication)
2. Add session invalidation on password change
3. Implement IP-based access control
4. Add encrypted backup system
5. Implement audit logging
6. Add video metadata scrubbing with ffmpeg
7. Implement platform-specific API integrations
8. Add end-to-end encryption for stored content

## Security Update Policy

- Security patches will be released as soon as possible
- Users will be notified of critical security updates
- Regular dependency updates to address vulnerabilities
- Monthly security audits recommended

## Compliance Notes

This platform is designed with privacy and security in mind, but:
- Not HIPAA compliant
- Not PCI DSS compliant (no payment processing)
- GDPR considerations: Minimal data collection, right to deletion
- Users are responsible for platform-specific compliance

## Incident Response

In case of a security incident:
1. Assess the scope and impact
2. Notify affected users immediately
3. Implement immediate fixes
4. Document the incident
5. Update security measures
6. Publish post-mortem (if appropriate)

## Security Testing

### Automated Testing
- CodeQL security scanning
- Dependency vulnerability scanning
- Unit tests for authentication
- API endpoint security tests

### Manual Testing Required
- Penetration testing before production
- Security code review
- Third-party security audit
- Load testing with rate limiting

## Contact

For security concerns, please use GitHub's private security advisory feature or contact repository maintainers directly.

---

**Remember**: Your safety is the top priority. When in doubt, use the emergency delete button.
