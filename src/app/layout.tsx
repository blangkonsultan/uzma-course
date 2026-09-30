import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Uzma Course — Bimbingan Belajar Anak",
    template: "%s | Uzma Course",
  },
  description:
    "Bimbingan belajar calistung, bahasa Inggris, dan mata pelajaran SD–SMP untuk anak usia dini hingga remaja. Cabang Balongbendo & Krian, Sidoarjo.",
  keywords: [
    "bimbel",
    "calistung",
    "les anak",
    "bimbingan belajar",
    "AHE",
    "Anak Hebat",
    "les bahasa Inggris anak",
    "bimbel Sidoarjo",
    "les Krian",
    "les Balongbendo",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Uzma Course",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="antialiased">
        <a
          href="#programs"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-primary-700 focus:font-semibold focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Langsung ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
