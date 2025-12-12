import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ClientInitializer from "./components/ClientInitializer";
import Providers from "./components/Providers";
import Footer from "./components/Footer";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <ClientInitializer />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
