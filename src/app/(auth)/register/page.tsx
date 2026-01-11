import RegisterForm from '@/components/auth/RegisterForm';
import OAuth2Buttons from '@/components/auth/OAuth2Buttons';

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <RegisterForm />
        <OAuth2Buttons />
      </div>
    </div>
  );
}
