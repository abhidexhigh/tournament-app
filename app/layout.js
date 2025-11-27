import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ClientInitializer from "./components/ClientInitializer";
import Providers from "./components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Force of Rune - Tournament Platform",
  description:
    "Join competitive Force of Rune tournaments and win amazing prizes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <ClientInitializer />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="py-8">
            <div className="max-w-main mx-auto px-4 text-center sm:px-6 lg:px-8">
              <p className="text-gray-400">
                © 2025 Force of Rune Tournaments. All rights reserved.
              </p>
              <p className="text-gold-dark mt-2 text-sm">
                Master the Runes. Claim Victory. ⚔️
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
