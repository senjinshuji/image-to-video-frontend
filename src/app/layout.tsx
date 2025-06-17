import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image to Video Generator",
  description: "Generate videos from images using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center">
              <h1 className="text-lg md:text-xl font-bold">Image to Video</h1>
              <nav className="ml-auto flex gap-2 md:gap-6">
                <a href="/" className="text-sm md:text-base hover:text-primary">Dashboard</a>
                <a href="/image" className="text-sm md:text-base hover:text-primary hidden sm:inline">Image</a>
                <a href="/video" className="text-sm md:text-base hover:text-primary hidden sm:inline">Video</a>
                <a href="/finalize" className="text-sm md:text-base hover:text-primary hidden sm:inline">Finalize</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t">
            <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
              © 2025 Image to Video Generator
            </div>
          </footer>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
