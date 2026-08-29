import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrustScore | Discover Creators You Can Trust",
  description:
    "TrustScore is the trusted creator discovery marketplace connecting ambitious businesses with authentic micro- and nano-influencers using data-driven trust signals.",
  keywords: [
    "Creator Discovery Marketplace",
    "Influencer Authenticity",
    "TrustScore Ranking",
    "Verified Creators",
    "Micro-influencer Marketplace",
    "Creator Business Collaborations",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased text-slate-100 bg-[#090d16]`}>
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
