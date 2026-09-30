import type { Metadata, Viewport } from "next";
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
    default:
      "Uzma Course — Les Baca AHE Sumokembangsri & AHE Junwangi Sidoarjo",
    template: "%s | Uzma Course",
  },
  description:
    "Pusat les baca AHE Sumokembangsri (Balongbendo) & les baca AHE Junwangi (Krian) Sidoarjo — Uzma Course. Bimbingan belajar calistung Anak Hebat (AHE), bahasa Inggris BEE, dan bimbel SD-SMP dengan metode ramah anak tanpa trauma.",
  keywords: [
    "ahe sumokembangsri",
    "ahe junwangi",
    "les baca ahe junwangi",
    "les baca ahe sumokembangsri",
    "les baca sumokembangsri",
    "les baca junwangi",
    "les ahe sumokembangsri",
    "les ahe junwangi",
    "ahe sumowangi",
    "ahe balongbendo",
    "ahe krian",
    "les baca sidoarjo",
    "calistung sidoarjo",
    "bimbel sidoarjo",
    "les anak balongbendo",
    "les anak krian",
    "AHE sidoarjo",
    "Anak Hebat",
    "les bahasa inggris anak sidoarjo",
    "les privat krian",
    "les privat balongbendo",
  ],
  authors: [{ name: "Uzma Course", url: "https://uzmacourse.com" }],
  creator: "Uzma Course",
  publisher: "Uzma Course",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-uzma-course.jpg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo-uzma-course.jpg",
  },
  verification: {
    google: "g62tT0JAY8jPvf81GGVLQaMs2tNmkE92HVBpAgr9jcc",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://uzmacourse.com",
    siteName: "Uzma Course",
    title:
      "Uzma Course — Les Baca AHE Sumokembangsri & AHE Junwangi Sidoarjo",
    description:
      "Pusat les baca AHE Sumokembangsri & les baca AHE Junwangi Sidoarjo. Bimbingan belajar calistung AHE, bahasa Inggris BEE, dan bimbel SD–SMP dengan metode ramah anak dan guru berlisensi.",
    images: [
      {
        url: "/images/logo-uzma-course.jpg",
        width: 1280,
        height: 1280,
        alt: "Logo Resmi Uzma Course",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Uzma Course — Les Baca AHE Sumokembangsri & AHE Junwangi Sidoarjo",
    description:
      "Pusat les baca AHE Sumokembangsri & les baca AHE Junwangi Sidoarjo. Bimbingan belajar calistung AHE, BEE, dan bimbel SD-SMP ramah anak.",
    images: ["/images/logo-uzma-course.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
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
