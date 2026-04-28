import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ontology Graph",
  description: "PDF / HTMLからオントロジーグラフを生成して可視化するMVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
