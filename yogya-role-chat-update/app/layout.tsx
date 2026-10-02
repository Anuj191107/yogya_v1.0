import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yogya | Skills for the future",
  description: "Connect learning, real-world experience, and industry demand.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}