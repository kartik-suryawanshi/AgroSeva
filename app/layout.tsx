import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgroSeva | Smarter Farming Starts Here",
  description:
    "Empowering farmers with cutting-edge agri-technology solutions. Access government schemes, track subsidies, and transform your agricultural practices.",
};

import Providers from "../components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col selection:bg-lime/40 selection:text-forest-dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
