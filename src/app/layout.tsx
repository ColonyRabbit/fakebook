import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "../components/Theme-provider";
import Navbar from "../components/Navbar/Navbar";
import SessionWrapper from "../components/SessionWrapper";

import { Metadata } from "next";
import FloatingChatWrapper from "../components/FloatingChatWrapper";
import NotificationListener from "../components/NotificationListener";
import ServiceWorkerRegistrar from "../components/ServiceWorkerRegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Fakebook",
  description:
    "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
  keywords: ["Fakebook", "Social Media", "Connect", "Share", "Memories"],
  authors: [
    {
      name: "Fakebook khanakorn alone",
      url: "https://fakebook-psi-six.vercel.app/",
    },
  ],
  creator: "Fakebook khanakorn alone",
  publisher: "Fakebook khanakorn alone",
  icons: {
    icon: "/images/Logo.png",
    shortcut: "/images/Logo.png",
  },
  verification: {
    // ทำให้ google หาเจอ เมื่อ search
    google: "TcywSLjr0baKqRMX6CwZ0gMBsHeIUfnXTQmEFrkqN8g",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionWrapper>
            <Navbar />
            <Toaster position="top-center" />
            <ServiceWorkerRegistrar />
            <NotificationListener />
            {children}
            <FloatingChatWrapper />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
