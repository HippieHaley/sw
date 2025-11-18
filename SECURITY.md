# Security Architecture

## Overview
This document details the security measures implemented in the Secure Worker Platform.

## Authentication & Authorization

### Password Security
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Minimum Length**: 12 characters required for registration
- **Storage**: Only password hash stored, never plaintext
- **Login Attempts**: Consider implementing rate limiting in production

### Session Management
- **Library**: iron-session for encrypted, signed sessions
- **Cookie Settings**:
  - `httpOnly: true` - Prevents JavaScript access (XSS protection)
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'strict'` - CSRF protection
  - `maxAge: 7 days` - Auto-expiration
- **Session Data**: Only userId and username stored
- **Destruction**: Immediate session destruction on logout

## Data Encryption

### At-Rest Encryption
All sensitive database fields are encrypted using AES-256:
- Post titles and descriptions
- File paths
- Platform API credentials
- Any user profile data

### Encryption Implementation
```typescript
// Uses crypto-js AES encryption
- Algorithm: AES-256
- Key: 32-byte random key from environment
- Storage: Encrypted string in database
```

### Key Management
- Encryption key stored in environment variables
- NEVER committed to version control
- Should be rotated periodically in production
- Different keys for different environments

## Metadata Removal

### Image Processing
Using `sharp` and `exifr` libraries:
1. Parse and extract original metadata (for logging only)
2. Process image with all metadata removed:
   - EXIF data
   - IPTC data
   - XMP data
   - ICC profiles
3. Save with randomized filename
4. Verify metadata removal
5. Delete original upload

### Video Processing
- Current: File copy with randomized name
- Production: Requires ffmpeg for full metadata stripping
- Command: `ffmpeg -i input.mp4 -map_metadata -1 -c:v copy -c:a copy output.mp4`

### File Naming
- Random 32-character hex string
- No original filename preserved
- Extension maintained for compatibility

## Network Security

### HTTP Headers
Configured in `next.config.js`:

```javascript
X-Frame-Options: DENY              // Prevent clickjacking
X-Content-Type-Options: nosniff    // Prevent MIME sniffing
Referrer-Policy: no-referrer       // No referer leakage
X-XSS-Protection: 1; mode=block    // XSS protection
Content-Security-Policy: ...        // Restrict resource loading
```

### HTTPS
- Required in production (secure cookies)
- Redirects from HTTP to HTTPS recommended
- Consider HSTS header in production

### CORS
- Default: Same-origin only
- Configure carefully if adding external API access

## Database Security

### Schema Design
- No personal information fields
- Cascading deletes for data cleanup
- UUIDs for non-sequential IDs
- Encrypted fields for sensitive data

### Access Control
- All queries verify user ownership
- No direct ID-based lookups without user check
- Prisma ORM prevents SQL injection

### Example Secure Query
```typescript
const post = await prisma.post.findFirst({
  where: {
    id: postId,
    userId: session.userId  // Always verify ownership
  }
});
```

## Emergency Delete

### Implementation
1. Find all posts for user
2. Delete all associated media files from disk
3. Delete user record (cascade deletes related records)
4. Destroy session
5. Return success even on partial failure (safety first)

### What Gets Deleted
- User account
- All posts
- All platform connections
- All scheduled content
- All uploaded files
- Session data

### Irreversibility
- No soft deletes
- No recovery mechanism
- Immediate execution
- Designed for emergency situations

## File Storage

### Upload Directory
- Located at `public/uploads/`
- Gitignored by default
- Should be outside public directory in production
- Consider separate storage service (S3, etc.)

### File Access
- Files served through Next.js public directory
- Consider authentication for file access in production
- Implement signed URLs for sensitive content

## API Security

### Rate Limiting
Not currently implemented - **CRITICAL for production**:
- Login attempts: 5 per 15 minutes
- Upload endpoints: 10 per hour
- Emergency delete: 1 per 24 hours
- API calls: 100 per 15 minutes

### Input Validation
- Zod schemas for all API inputs
- Type checking with TypeScript
- File type validation on uploads
- File size limits recommended

### Error Handling
- Generic error messages to users
- Detailed errors logged server-side
- No sensitive data in error responses
- No stack traces in production

## Dependency Security

### Regular Updates
```bash
npm audit
npm audit fix
npm outdated
```

### Critical Dependencies
- bcryptjs: Password hashing
- iron-session: Session management
- crypto-js: Encryption
- sharp: Image processing
- exifr: Metadata extraction

### Monitoring
- Dependabot alerts
- Regular security audits
- Test updates in staging first

## Production Checklist

- [ ] Generate unique encryption keys
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS only
- [ ] Configure production database (PostgreSQL/MySQL)
- [ ] Implement rate limiting
- [ ] Set up logging (without sensitive data)
- [ ] Configure file storage (S3, etc.)
- [ ] Add monitoring and alerts
- [ ] Review all environment variables
- [ ] Test emergency delete thoroughly
- [ ] Set up encrypted backups
- [ ] Configure firewall rules
- [ ] Implement IP allowlisting if applicable
- [ ] Set up DDoS protection
- [ ] Configure CDN if needed
- [ ] Document incident response plan

## Threat Model

### Threats Addressed
1. **Identity exposure**: No personal info collected
2. **Location tracking**: EXIF/GPS data removed
3. **Data breaches**: Encryption at rest
4. **Session hijacking**: Secure cookie settings
5. **XSS attacks**: CSP headers, httpOnly cookies
6. **CSRF attacks**: SameSite cookies
7. **SQL injection**: Prisma ORM, parameterized queries
8. **Emergency situations**: Emergency delete button

### Potential Vulnerabilities
1. **Backup retention**: External backups may persist
2. **Memory dumps**: Encryption keys in memory
3. **Browser history**: URLs may be logged
4. **Platform APIs**: Third-party services have data
5. **Network monitoring**: Use VPN recommended
6. **Physical access**: Device security important

## Compliance Considerations

### Data Protection
- GDPR: Right to deletion (emergency delete)
- CCPA: Data minimization (no personal info)
- User consent: No analytics or tracking

### Content Regulations
- Platform-specific: Comply with each platform's ToS
- Local laws: Vary by jurisdiction
- Age verification: Not implemented (add if required)

## Incident Response

### If Breach Suspected
1. Immediately invalidate all sessions
2. Rotate encryption keys (requires data migration)
3. Audit access logs
4. Notify affected users
5. Document incident
6. Implement additional security measures

### If Vulnerability Found
1. Do not disclose publicly
2. Contact maintainers privately
3. Provide detailed report
4. Allow time for patch before disclosure

## Logging

### What to Log
- Failed login attempts
- API errors (without sensitive data)
- File upload events
- Emergency delete actions
- Unusual activity patterns

### What NOT to Log
- Passwords (even hashed)
- Session tokens
- Encryption keys
- Decrypted content
- User IP addresses (optional)
- Personal information

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular audits, updates, and testing are essential.
