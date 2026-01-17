import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RadioPlayer from "@/components/Player/RadioPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloWrapper>
          <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <RadioPlayer />
          </div>
        </ApolloWrapper>
      </body>
    </html>
  );
}
