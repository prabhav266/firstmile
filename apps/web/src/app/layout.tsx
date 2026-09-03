import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'FIRST MILE — Where careers begin',
  description: 'The technical career platform bridging the gap from education to your first engineering opportunity.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#000000] text-[#ffffff]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
