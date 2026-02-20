import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { helveticaNeue } from "./fonts";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RadioPlayer from "@/components/Player/RadioPlayer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lared1061.com"),
  title: "La Red 106.1",
  description: "La Red 106.1 - Conectando con tu vida",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "manifest",
        url: "/favicon_io/site.webmanifest"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${helveticaNeue.variable} antialiased font-helvetica`}
      >
        <ApolloWrapper>
          <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <RadioPlayer />
          </div>
        </ApolloWrapper>
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.lared1061.com/wp-includes/js/wp-embed.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
