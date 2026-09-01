import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'PathForge AI — Placement & Career Development Platform',
  description: 'AI-Powered Resume Analyzer, Personalized Roadmaps, and Coding Trackers for Placement Aspirants.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#0f172a] text-[#f9fafb]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
