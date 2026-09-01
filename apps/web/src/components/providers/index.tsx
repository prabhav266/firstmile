'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { LenisProvider } from './LenisProvider';
import { CustomCursor } from '../ui/CustomCursor';
import { MeshBackground } from '../ui/MeshBackground';
import { BootLoader } from '../ui/BootLoader';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <LenisProvider>
          {/* Global Visual Identity elements */}
          <MeshBackground />
          <CustomCursor />
          <BootLoader />
          
          {children}
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#111827',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              },
            }}
          />
        </LenisProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
export default Providers;
