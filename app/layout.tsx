import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cortex — Synaptic Constellation & Brain Vault",
  description: "3D Synaptic Constellation Brain, 7-Agent Gate Suite & Procedural Judgment Vault",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Cortex — Synaptic Constellation & Brain Vault",
    description: "3D Synaptic Constellation Brain, 7-Agent Gate Suite & Procedural Judgment Vault",
    images: [{ url: "/social-preview.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cortex — Synaptic Constellation & Brain Vault",
    description: "3D Synaptic Constellation Brain, 7-Agent Gate Suite & Procedural Judgment Vault",
    images: ["/social-preview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-[#050505] text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
