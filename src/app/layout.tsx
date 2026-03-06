import type { Metadata } from "next";
import AIProvider from "@/components/AIProvider";
import ConsentBanner from "@/components/ConsentBanner";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipLocal — Local-first productivity suite",
  description:
    "Developer & privacy tools that run entirely in your browser. Hash, encrypt, convert, sign — no uploads, no tracking.",
  openGraph: {
    title: "ShipLocal — Local-first productivity suite",
    description:
      "Developer & privacy tools that run entirely in your browser. Hash, encrypt, convert, sign — no uploads, no tracking.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary min-h-dvh flex flex-col">
        <AIProvider>
          {children}
          <PageViewTracker />
          <ConsentBanner />
        </AIProvider>
      </body>
    </html>
  );
}
