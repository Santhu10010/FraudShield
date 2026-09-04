// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('demo@fraudshield.ai');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Successfully authenticated');
        router.replace('/dashboard');
      }
    } catch {
      toast.error('Unable to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-primary text-primary-foreground mb-3 border border-primary shadow-[1px_1px_0px_rgba(0,0,0,0.05)]">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-editorial font-bold text-foreground tracking-tight">FraudShield</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase tracking-wider">Enterprise Transaction Intelligence</p>
        </div>

        {/* Card */}
        <div className="editorial-card p-8 shadow-[1px_1px_0px_rgba(0,0,0,0.05)] relative">
          <div className="mb-6 border-b border-border pb-3">
            <h2 className="text-lg font-editorial font-bold text-foreground">Analyst Sign-In Terminal</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Authenticate to access the live audit ledger</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-foreground mb-1 uppercase tracking-wider" htmlFor="email">
                Analyst Identity
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded bg-background border border-border text-foreground text-xs font-mono focus:outline-none focus:border-foreground transition-all placeholder:text-muted-foreground"
                  placeholder="analyst@fraudshield.ai"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-foreground mb-1 uppercase tracking-wider" htmlFor="password">
                Passcode
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded bg-background border border-border text-foreground text-xs font-mono focus:outline-none focus:border-foreground transition-all placeholder:text-muted-foreground"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs font-mono transition-all shadow-[1px_1px_0px_rgba(0,0,0,0.05)] border border-primary flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-[#EBF0EC] text-[#2D4A36] border border-[#C8D6CB]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D4A36]" />
              Evaluation Environment Initialized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
