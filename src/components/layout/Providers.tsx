"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "@/lib/solana/provider";
import { Toaster } from "sonner";
import { useState } from "react";

interface ProvidersProps { children: React.ReactNode }

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        {children}
        <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem" } }} />
      </SolanaProvider>
    </QueryClientProvider>
  );
}
