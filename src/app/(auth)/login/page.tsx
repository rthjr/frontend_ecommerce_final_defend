import LoginForm from '@/components/auth/LoginForm';
import OAuth2Buttons from '@/components/auth/OAuth2Buttons';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <LoginForm />
        <OAuth2Buttons />
      </div>
    </div>
  );
}
