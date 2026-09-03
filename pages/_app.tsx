// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
      <Toaster richColors theme="light" position="top-right" />
    </AuthProvider>
  );
}
