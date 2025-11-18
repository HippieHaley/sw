import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Save OAuth tokens to JWT
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      // Make tokens available in session
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      return session
    },
  },
  pages: {
    signIn: '/dashboard', // Redirect back to dashboard after OAuth
  },
})
