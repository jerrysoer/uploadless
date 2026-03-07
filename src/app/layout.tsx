import type { Metadata } from "next";
import AIProvider from "@/components/AIProvider";
import ConsentBanner from "@/components/ConsentBanner";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrowserShip — Local-first productivity suite",
  description:
    "Developer & privacy tools that run entirely in your browser. Hash, encrypt, convert, sign — no uploads, no tracking.",
  openGraph: {
    title: "BrowserShip — Local-first productivity suite",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Source+Sans+3:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
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
