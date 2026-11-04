import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@/styles/tokens.css";
import "./globals.css";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { TickerTape } from "@/components/navigation/TickerTape";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { ClientProviders } from "@/components/providers/ClientProviders";
import type { Locale } from "@/types";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Stock Today | Multilingual Indian Stock Market News (EN / GU / HI)",
  description:
    "Real-time coverage and unbiased news on NSE, BSE, Sensex, Nifty, and Indian equities in English, Gujarati, and Hindi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("st-lang")?.value;
  const initialLocale: Locale =
    rawLocale === "GU" || rawLocale === "HI" ? (rawLocale as Locale) : "EN";

  return (
    <html lang={initialLocale.toLowerCase()}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <ClientProviders initialLocale={initialLocale}>
          {/* Block-print decorative top accent stripe */}
          <div className="stripe-bar">
            <span style={{ background: "var(--stripe-indigo)" }} />
            <span style={{ background: "var(--stripe-saffron)" }} />
            <span style={{ background: "var(--stripe-teal)" }} />
            <span style={{ background: "var(--stripe-pink)" }} />
          </div>

          <TickerTape />
          <Header />
          <CommandPalette />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
