import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { pool } from "../../../lib/database";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          // Check for game owner (admin) first
          if (
            credentials.username === "admin" &&
            credentials.password === "password"
          ) {
            const result = await pool.query(
              "SELECT * FROM users WHERE username = $1 AND type = $2",
              ["admin", "game_owner"]
            );

            if (result.rows.length > 0) {
              const user = result.rows[0];
              return {
                id: user.id,
                email: user.email,
                name: user.username,
                type: user.type,
                diamonds: user.diamonds,
                avatar: user.avatar,
              };
            }
          }

          // Check for regular users by username
          const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [credentials.username]
          );

          if (result.rows.length > 0) {
            const user = result.rows[0];
            // In production, verify password hash here
            return {
              id: user.id,
              email: user.email,
              name: user.username,
              type: user.type,
              diamonds: user.diamonds,
              avatar: user.avatar,
              rank: user.rank,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.type = user.type;
        token.diamonds = user.diamonds;
        token.avatar = user.avatar;
        token.rank = user.rank;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.type = token.type;
        session.user.diamonds = token.diamonds;
        session.user.avatar = token.avatar;
        session.user.rank = token.rank;
        session.user.provider = token.provider;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
