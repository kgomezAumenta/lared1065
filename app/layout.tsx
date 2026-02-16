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
          strategy="lazyOnload"
        />
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://www.lared1061.com/wp-includes/js/wp-embed.min.js"
          strategy="lazyOnload"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6134329722127197"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
