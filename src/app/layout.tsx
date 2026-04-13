import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Nav } from "@/components/layout/Nav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Visiowl",
  description: "Every Solana wallet has a story. Visiowl makes it visible to everyone.",
  openGraph: {
    title: "Visiowl",
    description: "Your on-chain reputation, made visible.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Nav />
          <main className="min-h-screen">{children}</main>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
