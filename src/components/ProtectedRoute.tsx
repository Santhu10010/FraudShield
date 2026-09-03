// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isLoginPage = router.pathname === '/login';

  useEffect(() => {
    if (loading) return;

    const localAuth = typeof window !== 'undefined' && localStorage.getItem('authenticated') === 'true';
    const isAuthenticated = !!user || localAuth;

    if (!isAuthenticated && !isLoginPage) {
      router.replace('/login');
    } else if (isAuthenticated && isLoginPage) {
      router.replace('/dashboard');
    }
  }, [user, loading, router, isLoginPage]);

  // If we are on login page, render children directly without waiting
  if (isLoginPage) {
    return <>{children}</>;
  }

  // while loading on protected routes, show a clean loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
