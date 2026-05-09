import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://forevergram.co";

export const metadata: Metadata = {
  title: "Forevergram — Give her a tribute worth saving forever",
  description:
    "Turn your favourite photos into a cinematic memory reel for Mum. Add memories, choose a style, share a link. Free. Takes 5 minutes.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Forevergram — Give her a tribute worth saving forever",
    description:
      "Turn your favourite photos into a cinematic memory reel for Mum. Add memories, choose a style, share a link. Free. Takes 5 minutes.",
    url: siteUrl,
    siteName: "Forevergram",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Forevergram — Cinematic memory reels for the people you love",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forevergram — Give her a tribute worth saving forever",
    description:
      "Turn your favourite photos into a cinematic memory reel for Mum. Free. Takes 5 minutes.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/forevergram-logo.png",
    apple: "/forevergram-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
