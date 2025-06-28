import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Masjid.Online",
  description: "Elevate your masjid's online presence now",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
