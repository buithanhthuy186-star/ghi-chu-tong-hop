import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghi Chú Tổng Hợp",
  description: "Ghi chú tổng hợp — GEMADEPT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}