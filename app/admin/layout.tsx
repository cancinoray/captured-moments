import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { logoutAction } from '@/lib/actions/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Logged in as: {session.username}</span>
              <form action={logoutAction}>
                <LogoutButton />
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

