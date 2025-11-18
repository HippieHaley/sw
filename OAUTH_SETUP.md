# OAuth Integration Setup Guide

This guide will help you set up OAuth authentication for cross-posting to various platforms.

## Step 1: Install Dependencies

First, we'll install the necessary OAuth libraries:

```bash
npm install next-auth@beta twitter-api-v2
```

## Step 2: Get Twitter/X Developer Credentials

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new Project and App
3. Navigate to your App Settings → Keys and Tokens
4. Generate:
   - **API Key** (Client ID)
   - **API Secret** (Client Secret)
5. Set up OAuth 2.0 settings:
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
   - Website URL: `http://localhost:3000`
6. Enable permissions: Read and Write

## Step 3: Add Environment Variables

Add these to your `.env` file:

```env
# Twitter/X OAuth
TWITTER_CLIENT_ID="your-api-key-here"
TWITTER_CLIENT_SECRET="your-api-secret-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"
```

Generate a random secret with:
```bash
openssl rand -base64 32
```

## Step 4: What We're Building

- **OAuth Flow**: Users click "Connect Twitter" → redirected to Twitter → authorize → redirected back with tokens
- **Token Storage**: Access and refresh tokens stored encrypted in database
- **Auto-Posting**: When you create a post, it can automatically post to connected platforms
- **Token Refresh**: Automatically refresh expired tokens

## Next Steps

I'll create the OAuth configuration and routes. Once you have your Twitter credentials, we can test the connection flow!

## Future Platforms

After Twitter works, we can add:
- Instagram (via Meta/Facebook OAuth)
- Reddit OAuth
- Custom platform integrations
