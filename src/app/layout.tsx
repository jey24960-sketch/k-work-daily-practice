import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND_ICON_PATH, BRAND_LOGO_PATH, BRAND_NAME, SITE_URL } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL(SITE_URL);
const siteTitle =
  "K-Work Daily Practice | Free EPS-TOPIK Practice for Nepali Learners";
const siteDescription =
  "Free EPS-TOPIK practice for Nepali learners. Start with a 20-question level test, check your weak areas, and practice a little every day.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: BRAND_ICON_PATH,
    apple: BRAND_ICON_PATH,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: BRAND_NAME,
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: 1254,
        height: 1254,
        alt: "K-Work Daily Practice logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
