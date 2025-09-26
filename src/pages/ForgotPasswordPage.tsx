import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/AuthCard';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
export function ForgotPasswordPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Password reset link sent!', {
      description: 'Please check your email to reset your password.',
    });
  };
  return (
    <>
      <AuthCard
        title="Forgot your password?"
        description="No worries, we'll send you reset instructions."
        footerContent={
          <>
            Remember your password?{' '}
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
          <div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </div>
        </form>
      </AuthCard>
      <Toaster richColors />
    </>
  );
}