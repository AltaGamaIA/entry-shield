import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Staff Portal",
      credentials: {
        staffId: { label: "ID de Personal", type: "text", placeholder: "ES-000-000" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.staffId || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { staffId: credentials.staffId }
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          staffId: user.staffId,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string;
        token.staffId = user.staffId as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.staffId = token.staffId as string;
        session.user.id = token.sub as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/",
  }
};
