import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "Return Zero — Premium IPTV Streaming",
    template: "%s | Return Zero",
  },
  description:
    "Watch live TV channels with Return Zero — a modern, fast IPTV streaming platform with premium quality and seamless playback.",
  keywords: ["IPTV", "live TV", "streaming", "Return Zero", "HLS"],
  authors: [{ name: "Return Zero" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Return Zero",
  },
  openGraph: {
    title: "Return Zero — Premium IPTV Streaming",
    description: "Modern IPTV streaming platform with live channels",
    type: "website",
    siteName: "Return Zero",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} gradient-bg antialiased`}>
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
