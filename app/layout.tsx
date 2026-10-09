import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Values Atlas",
  description:
    "An interactive map of how human values emerge, couple, and shift across geography and deep time.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Values Atlas",
    description:
      "An interactive map of how human values emerge, couple, and shift across geography and deep time.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <head>
        {/* Fonts: Satoshi + Boska (Fontshare) and Space Mono (Google) via CDN,
            matching the original Values Atlas typography. These are the only
            third-party stylesheet hosts (named in the CSP in next.config.ts);
            no-referrer keeps the visitor's page URL out of those requests.
            The no-page-custom-font rule targets the Pages Router; in the App
            Router this root layout wraps every page, which is what we want. */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&f[]=boska@400,500,700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
