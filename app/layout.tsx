import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgroSeva Portal | Empowering Farmers",
  description: "Apply for schemes, track subsidies, and file grievances — all in one place.",
};

import Providers from "../components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col selection:bg-gold selection:text-forest-dark">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
