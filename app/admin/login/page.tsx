import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the moderation dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

