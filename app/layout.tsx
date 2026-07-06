import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kokorone",
  description: "こころに寄り添うAI相談アプリ",
  icons: {
    icon: "/Kokorone.png",
    shortcut: "/Kokorone.png",
    apple: "/Kokorone.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}