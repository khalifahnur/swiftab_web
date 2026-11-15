'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ReactNode, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            // A 4xx is the server's answer, not a blip: asking again will not change it.
            retry: (failureCount, error) => {
              const status = isAxiosError(error) ? error.response?.status : undefined;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#0f1115',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
            maxWidth: '420px',
          },
          success: { iconTheme: { primary: '#2dd4bf', secondary: '#0f1115' } },
          error: { duration: 6000, iconTheme: { primary: '#fb7185', secondary: '#0f1115' } },
        }}
      />
    </QueryClientProvider>
  );
}
