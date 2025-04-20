import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "../components/Theme-provider";
import Navbar from "../components/Navbar/Navbar";
import SessionWrapper from "../components/SessionWrapper";

import { Metadata } from "next";
import FloatingChatWrapper from "../components/FloatingChatWrapper";
import NotificationListener from "../components/NotificationListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
            <NotificationListener />
            {children}
            <FloatingChatWrapper />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
