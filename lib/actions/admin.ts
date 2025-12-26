'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function approveMedia(id: string) {
  const { error } = await (supabaseAdmin
    .from('media_items') as any)
    .update({ is_approved: true, is_deleted: false })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteMedia(id: string) {
  const { error } = await (supabaseAdmin
    .from('media_items') as any)
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function permanentlyDeleteMedia(id: string, storagePath: string) {
  // Delete from storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('media-uploads')
    .remove([storagePath]);

  if (storageError) {
    return { error: `Storage deletion failed: ${storageError.message}` };
  }

  // Delete from database
  const { error: dbError } = await supabaseAdmin
    .from('media_items')
    .delete()
    .eq('id', id);

  if (dbError) {
    return { error: `Database deletion failed: ${dbError.message}` };
  }

  return { success: true };
}

export async function restoreMedia(id: string) {
  const { error } = await (supabaseAdmin
    .from('media_items') as any)
    .update({ is_deleted: false })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function approveComment(id: string) {
  const { error } = await (supabaseAdmin
    .from('comments') as any)
    .update({ is_approved: true, is_deleted: false })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteComment(id: string) {
  const { error } = await (supabaseAdmin
    .from('comments') as any)
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function restoreComment(id: string) {
  const { error } = await (supabaseAdmin
    .from('comments') as any)
    .update({ is_deleted: false })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

