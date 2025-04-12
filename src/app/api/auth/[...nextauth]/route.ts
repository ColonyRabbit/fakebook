import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    photoUrl?: string;
    id?: string;
  }
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      photoUrl?: string;
      name?: string;
      email?: string;
    };
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`http://localhost:3000/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        const user = await res.json();
        console.log("User from login API:", user);
        if (!res.ok || !user) {
          console.log("Login failed", user);
          throw new Error(user?.error || "Login failed");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.photoUrl = user.photoUrl;
        token.accessToken = user.accessToken || account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.photoUrl = token.photoUrl as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
