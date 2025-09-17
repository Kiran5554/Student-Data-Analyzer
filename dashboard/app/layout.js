import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Student Analyst Dashboard",
  description: "Cognitive Skills & Performance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-amber-500 to-sky-600" />
        <header className="w-full border-b border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-10 shadow-sm">
          <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-amber-500" />
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold tracking-tight">StudentAnalyst</span>
                <span className="text-xs text-black/60 dark:text-white/60">Cognitive Skills Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm" />
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
