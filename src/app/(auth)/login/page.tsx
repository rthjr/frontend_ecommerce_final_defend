import LoginForm from '@/components/auth/LoginForm';
import OAuth2Buttons from '@/components/auth/OAuth2Buttons';

export default function LoginPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <LoginForm />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <OAuth2Buttons />
    </div>
  );
}
