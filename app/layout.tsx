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
            matching the original Values Atlas typography. */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&f[]=boska@400,500,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
