import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brainweb — Diagnostic Console",
  description: "3D Synaptic Constellation Brain & Procedural Judgment Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-[#060913] text-white">
        {children}
      </body>
    </html>
  );
}
