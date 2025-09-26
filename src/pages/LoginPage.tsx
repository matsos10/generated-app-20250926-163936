import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthStore } from '@/hooks/use-auth-store';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    if (email) {
      login(email);
      navigate('/dashboard');
    }
  };
  return (
    <AuthCard
      title="Sign in to your account"
      description="Welcome back! Please enter your details."
      footerContent={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary/90">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/90">
                Forgot your password?
              </Link>
            </div>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}