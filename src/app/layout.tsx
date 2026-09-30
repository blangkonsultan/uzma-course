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
  metadataBase: new URL("https://uzmacourse.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Uzma Course — Bimbingan Belajar Anak di Sidoarjo",
    template: "%s | Uzma Course",
  },
  description:
    "Bimbingan belajar calistung (AHE), bahasa Inggris (BEE), dan bimbel SD–SMP di Sidoarjo. Metode ramah anak tanpa trauma, guru berlisensi resmi, cabang Balongbendo & Krian.",
  keywords: [
    "bimbel sidoarjo",
    "les baca sidoarjo",
    "calistung sidoarjo",
    "les anak balongbendo",
    "les anak krian",
    "AHE sidoarjo",
    "AHE sumowangi",
    "AHE junwangi",
    "AHE sumokembangsri",
    "Anak Hebat",
    "les bahasa inggris anak sidoarjo",
    "bimbingan belajar ramah anak",
    "les privat krian",
    "les privat balongbendo",
  ],
  authors: [{ name: "Uzma Course", url: "https://uzmacourse.com" }],
  creator: "Uzma Course",
  publisher: "Uzma Course",
  icons: {
    icon: "/images/logo-ahe-sumowangi.png",
    apple: "/images/logo-ahe-sumowangi.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://uzmacourse.com",
    siteName: "Uzma Course",
    title: "Uzma Course — Bimbingan Belajar Anak di Sidoarjo",
    description:
      "Bimbingan belajar calistung (AHE), bahasa Inggris (BEE), dan bimbel SD–SMP di Sidoarjo. Metode ramah anak, guru berlisensi, cabang Balongbendo & Krian.",
    images: [
      {
        url: "/images/logo-ahe-sumowangi.png",
        width: 800,
        height: 800,
        alt: "Logo Uzma Course Ahe Sumowangi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Uzma Course — Bimbingan Belajar Anak di Sidoarjo",
    description:
      "Bimbingan belajar calistung (AHE), bahasa Inggris (BEE), dan bimbel SD–SMP di Sidoarjo. Cabang Balongbendo & Krian.",
    images: ["/images/logo-ahe-sumowangi.png"],
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
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-primary-700 focus:font-semibold focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Langsung ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
