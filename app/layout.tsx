import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kokorone.space"),

  title: "Kokorone | あなたの声に、心で応えるAIカウンセリング",
  description:
    "Kokoroneは、気持ちを整理したいときにいつでも話せるAIカウンセリングサービスです。",

  openGraph: {
    title: "Kokorone",
    description:
      "あなたの声に、心で応えるAIカウンセリング",
    url: "https://kokorone.space",
    siteName: "Kokorone",
    type: "website",
    images: [
      {
        url: "/images/kokorone-og.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kokorone",
    description:
      "あなたの声に、心で応えるAIカウンセリング",
    images: ["/images/kokorone-og.png"],
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