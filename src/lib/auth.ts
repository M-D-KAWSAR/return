import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const WEAK_SECRETS = [
  "build-time-secret-minimum-32-characters-long",
  "build-stream-secret-minimum-32-chars",
  "secret",
  "changeme",
  "password",
];

function assertStrongSecret(value: string | undefined, name: string) {
  if (!value || value.length < 32) {
    throw new Error(`${name} must be at least 32 characters`);
  }
  if (WEAK_SECRETS.includes(value.toLowerCase())) {
    throw new Error(`${name} is using a default placeholder — replace it with a random secret`);
  }
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build"
) {
  assertStrongSecret(process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET");
  assertStrongSecret(process.env.STREAM_TOKEN_SECRET, "STREAM_TOKEN_SECRET");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireAdmin() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}
