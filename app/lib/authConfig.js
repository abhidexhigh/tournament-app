import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const identifier = credentials?.username || credentials?.email;
          const password = credentials?.password;

          if (!identifier || !password) {
            console.log("Missing credentials");
            return null;
          }

          // Check for game owner (admin) first - uses username
          if (identifier === "admin" && password === "password") {
            const result = await sql`
              SELECT * FROM users 
              WHERE username = 'admin' AND type = 'game_owner'
            `;

            if (result.rows.length > 0) {
              const user = result.rows[0];
              console.log("Admin login successful:", user.username);
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

          // Check for regular users by email
          const result = await sql`
            SELECT * FROM users WHERE email = ${identifier}
          `;

          if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log("User login successful:", user.username);
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

          console.log("No user found for identifier:", identifier);
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
