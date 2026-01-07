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
      // For Google OAuth, always fetch from database to get complete user data
      if (account?.provider === "google" && (user?.email || token.email)) {
        const email = user?.email || token.email;
        try {
          const result = await sql`
            SELECT * FROM users WHERE email = ${email}
          `;
          if (result.rows.length > 0) {
            const dbUser = result.rows[0];
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.username;
            token.type = dbUser.type || "player";
            token.diamonds = dbUser.diamonds;
            token.avatar = dbUser.avatar;
            token.rank = dbUser.rank;
            token.provider = account.provider;
          } else if (user) {
            // User not in DB yet (shouldn't happen if signIn callback worked, but handle it)
            token.email = user.email;
            token.name = user.name;
            token.type = "player";
            token.diamonds = 1000;
            token.avatar = "🎮";
            token.provider = account.provider;
          }
        } catch (error) {
          console.error("Error fetching user in jwt callback:", error);
        }
      } else if (user) {
        // For credentials provider, use user data directly
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
      // For Google OAuth, create user in database if they don't exist
      if (account?.provider === "google" && user?.email) {
        try {
          const existingUser = await sql`
            SELECT * FROM users WHERE email = ${user.email}
          `;

          if (existingUser.rows.length === 0) {
            // Create new user as player by default
            const { usersDb } = await import("./database");
            const username = user.name || user.email.split("@")[0];
            await usersDb.create({
              username,
              email: user.email,
              type: "player",
              diamonds: 1000,
              avatar: "🎮",
            });
            console.log("Created new OAuth user:", user.email);
          }
        } catch (error) {
          console.error("Error creating OAuth user:", error);
          // Don't block sign in if user creation fails
        }
      }
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
