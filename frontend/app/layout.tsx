import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "전자제품 하자 마켓플레이스",
  description: "고장나거나 하자가 있는 전자제품을 투명하게 거래하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 전자제품 하자 마켓플레이스. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">포트폴리오 프로젝트</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
