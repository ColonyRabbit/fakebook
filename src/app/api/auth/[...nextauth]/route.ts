import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ประกาศ module augmentation เพื่อเพิ่มฟิลด์ id, accessToken, photo ให้กับ User และ Session
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

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // เรียก API /api/login เพื่อทำการตรวจสอบและล็อกอิน
        const res = await fetch(`http://localhost:3000/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      // เฉพาะตอนล็อกอินครั้งแรกจะมี user && account
      if (user && account) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.photoUrl = user.photoUrl; // << เอา photoUrl ใส่ใน token
        token.accessToken = user.accessToken || account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // ตอนดึง session ขึ้นมา
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.photoUrl = token.photoUrl as string; // << ใส่ photoUrl ลงใน session.user
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },
});

export { handler as GET, handler as POST };
