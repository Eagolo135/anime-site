import type { Metadata } from "next";
import Link from "next/link";
import { Bungee, Rubik } from "next/font/google";
import "./globals.css";

const displayFont = Bungee({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Rubik({
  variable: "--font-body",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anime Poetry Archive",
  description: "Where anime meets poetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-amber-50/15 bg-zinc-950/55 backdrop-blur-md">
          <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-10">
            <Link href="/" className="font-display text-xl text-amber-100">
              Shir0 Archive
            </Link>
            <div className="flex items-center gap-4 text-sm text-amber-50/85">
              <Link href="/" className="transition hover:text-amber-200">
                Home
              </Link>
              <Link href="/about" className="transition hover:text-amber-200">
                About
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
