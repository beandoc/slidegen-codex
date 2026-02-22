import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Slidemaker — Enterprise",
  description: "World class, deterministic AI presentation generator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#090b11] text-gray-100 min-h-screen flex flex-col font-sans">
        <header className="border-b border-gray-800 bg-[#0c0f18] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M6 10h12M6 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            AI <span className="text-cyan-400 font-extrabold">Slidemaker</span> <span className="text-gray-500 font-normal text-sm ml-2 px-2 py-0.5 rounded-full border border-gray-700 bg-gray-800">Pro Edition</span>
          </div>
          <nav className="flex gap-4">
            <button className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Export Integrations</button>
            <button className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Settings</button>
          </nav>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
