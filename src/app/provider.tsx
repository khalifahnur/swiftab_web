'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { ReactNode, useState } from 'react';
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <Toaster position="top-center" reverseOrder={false} /> 
    </QueryClientProvider>
  );
}
