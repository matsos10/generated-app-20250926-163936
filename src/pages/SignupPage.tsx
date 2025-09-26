import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthStore } from '@/hooks/use-auth-store';
export function SignupPage() {
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
      title="Create a new account"
      description="Start your 14-day free trial today."
      footerContent={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/90">
            Sign in
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
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        <div>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}