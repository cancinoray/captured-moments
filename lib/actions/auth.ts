'use server';

import { authenticateAdmin, createAdminSession, deleteAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  try {
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
    return { success: true };
  } catch (error) {
    console.error('Login action error:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred during login' };
  }
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect('/admin/login');
}

