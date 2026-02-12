import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Letter Through Time",
  description: "Cinematic memory timelines",
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
