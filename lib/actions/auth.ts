'use server';

import { authenticateAdmin, createAdminSession, deleteAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const admin = await authenticateAdmin(username, password);

  if (!admin) {
    return { error: 'Invalid username or password' };
  }

  await createAdminSession(admin.id);
  redirect('/admin');
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect('/admin/login');
}

