import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ClientInitializer from "./components/ClientInitializer";
import Providers from "./components/Providers";
import Footer from "./components/Footer";
import { getNonce } from "./lib/nonce";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Force of Rune - Tournament Platform",
  description:
    "Join competitive Force of Rune tournaments and win amazing prizes",
  // Viewport optimization for mobile
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",
  },
};

export default async function RootLayout({ children }) {
  // Get the CSP nonce for this request
  // This nonce is used by Next.js to allow inline scripts
  const nonce = await getNonce();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pass nonce to Next.js for script injection */}
        <meta name="csp-nonce" content={nonce} />
        
        {/* Preload critical fonts for faster initial render */}
        <link
          rel="preload"
          href="/fonts/cerapro/CERAPRO-REGULAR.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cerapro/CERAPRO-BOLD.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <ClientInitializer />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
        {/* Example of using nonce with Next.js Script component for external scripts */}
        {/* <Script src="https://example.com/script.js" nonce={nonce} /> */}
      </body>
    </html>
  );
}
