import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { dataService } from "../services/dataService";
import bcrypt from "bcryptjs";

const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "admin@compintel.com" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing email or password");
      }

      const user = await dataService.getUserByEmail(credentials.email);
      if (!user) {
        throw new Error("No user found with this email");
      }

      // Resilient check: check bcrypt hash, or check plain text (for initial seed admin login convenience)
      let isValid = false;
      try {
        isValid = await bcrypt.compare(credentials.password, user.password);
      } catch (e) {
        isValid = credentials.password === user.password;
      }

      if (!isValid && credentials.password !== user.password) {
        throw new Error("Incorrect password");
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email
      };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await dataService.getUserByEmail(user.email);
          if (!existingUser) {
            await dataService.createUser({
              name: user.name || "Google User",
              email: user.email,
              password: null
            });
          }
        } catch (e) {
          console.error("Error signing in with Google provider: ", e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await dataService.getUserByEmail(user.email!);
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
        } else {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/salaries", // Redirect here if auth is needed, we will trigger custom modal
    error: "/salaries"
  },
  secret: process.env.NEXTAUTH_SECRET || "compintel-super-secret-jwt-key-for-local-development"
};