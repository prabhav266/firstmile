'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { LenisProvider } from './LenisProvider';
import { CustomCursor } from '../ui/CustomCursor';

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
      enableSystem={true}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <LenisProvider>
          {/* Award-winning trailing dot custom cursor */}
          <CustomCursor />
          
          {children}
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0a0a0a',
                color: '#ffffff',
                border: '1px solid #242424',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
              },
            }}
          />
        </LenisProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
export default Providers;
