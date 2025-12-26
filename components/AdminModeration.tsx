'use client';

import { useState, useEffect } from 'react';
import { MediaItem, Comment } from '@/lib/types/database';
import {
  approveMedia,
  deleteMedia,
  restoreMedia,
  permanentlyDeleteMedia,
  approveComment,
  deleteComment,
  restoreComment,
} from '@/lib/actions/admin';
import { formatDate, formatFileSize } from '@/lib/utils';
import Image from 'next/image';

type FilterType = 'all' | 'approved' | 'pending' | 'deleted';
type ViewType = 'media' | 'comments';

export default function AdminModeration() {
  const [view, setView] = useState<ViewType>('media');
  const [filter, setFilter] = useState<FilterType>('all');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSelectedItems(new Set());
      try {
        if (view === 'media') {
          const response = await fetch(`/api/admin/media?filter=${filter}`);
          if (!response.ok) {
            throw new Error('Failed to fetch media');
          }
          const { data } = await response.json();
          setMediaItems(data || []);
        } else {
          const response = await fetch(`/api/admin/comments?filter=${filter}`);
          if (!response.ok) {
            throw new Error('Failed to fetch comments');
          }
          const { data } = await response.json();
          setComments(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to load ${view}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view, filter, refreshTrigger]);

  const handleMediaAction = async (id: string, action: 'approve' | 'delete' | 'restore' | 'permanent-delete', storagePath?: string) => {
    try {
      let result;
      if (action === 'approve') {
        result = await approveMedia(id);
      } else if (action === 'delete') {
        result = await deleteMedia(id);
      } else if (action === 'restore') {
        result = await restoreMedia(id);
      } else {
        result = await permanentlyDeleteMedia(id, storagePath!);
      }

      if (result.error) {
        setError(result.error);
      } else {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleCommentAction = async (id: string, action: 'approve' | 'delete' | 'restore') => {
    try {
      let result;
      if (action === 'approve') {
        result = await approveComment(id);
      } else if (action === 'delete') {
        result = await deleteComment(id);
      } else {
        result = await restoreComment(id);
      }

      if (result.error) {
        setError(result.error);
      } else {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === (view === 'media' ? mediaItems.length : comments.length)) {
      setSelectedItems(new Set());
    } else {
      const ids = view === 'media' ? mediaItems.map((m) => m.id) : comments.map((c) => c.id);
      setSelectedItems(new Set(ids));
    }
  };

  const bulkApprove = async () => {
    const itemsArray = Array.from(selectedItems);
    for (const id of itemsArray) {
      if (view === 'media') {
        await approveMedia(id);
      } else {
        await approveComment(id);
      }
    }
    setSelectedItems(new Set());
    setRefreshTrigger((prev) => prev + 1);
  };

  const bulkDelete = async () => {
    const itemsArray = Array.from(selectedItems);
    for (const id of itemsArray) {
      if (view === 'media') {
        await deleteMedia(id);
      } else {
        await deleteComment(id);
      }
    }
    setSelectedItems(new Set());
    setRefreshTrigger((prev) => prev + 1);
  };

  const getPublicUrl = (storagePath: string) => {
    // Use the public Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // Encode the path to handle special characters
    const encodedPath = encodeURIComponent(storagePath).replace(/%2F/g, '/');
    return `${supabaseUrl}/storage/v1/object/public/media-uploads/${encodedPath}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* View toggle */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setView('media')}
            className={`px-4 py-2 font-medium ${
              view === 'media'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Media Items ({mediaItems.length})
          </button>
          <button
            onClick={() => setView('comments')}
            className={`px-4 py-2 font-medium ${
              view === 'comments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>

        {/* Filters and bulk actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'approved', 'pending', 'deleted'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {selectedItems.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={bulkApprove}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve ({selectedItems.size})
              </button>
              <button
                onClick={bulkDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete ({selectedItems.size})
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : view === 'media' ? (
          <div className="space-y-4">
            {mediaItems.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No media items found</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full bg-white border border-gray-200 text-sm sm:text-base">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === mediaItems.length && mediaItems.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploader
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mediaItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {item.file_type === 'image' ? (
                            <Image
                              src={getPublicUrl(item.storage_path)}
                              alt={item.file_name}
                              width={80}
                              height={80}
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 truncate max-w-xs">{item.file_name}</p>
                            <p className="text-gray-500">{formatFileSize(item.file_size)}</p>
                            {item.caption && (
                              <p className="text-gray-600 mt-1 truncate max-w-xs">{item.caption}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.uploader_name || 'Anonymous'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.is_deleted
                                ? 'bg-red-100 text-red-800'
                                : item.is_approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.is_deleted ? 'Deleted' : item.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {!item.is_approved && (
                              <button
                                onClick={() => handleMediaAction(item.id, 'approve')}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Approve
                              </button>
                            )}
                            {!item.is_deleted && (
                              <button
                                onClick={() => handleMediaAction(item.id, 'delete')}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                            {item.is_deleted && (
                              <>
                                <button
                                  onClick={() => handleMediaAction(item.id, 'restore')}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() => handleMediaAction(item.id, 'permanent-delete', item.storage_path)}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                  Permanent Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No comments found</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full bg-white border border-gray-200 text-sm sm:text-base">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === comments.length && comments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commenter
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(comment.id)}
                            onChange={() => toggleSelect(comment.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 max-w-md">{comment.content}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {comment.commenter_name || 'Anonymous'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              comment.is_deleted
                                ? 'bg-red-100 text-red-800'
                                : comment.is_approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {comment.is_deleted ? 'Deleted' : comment.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {!comment.is_approved && (
                              <button
                                onClick={() => handleCommentAction(comment.id, 'approve')}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Approve
                              </button>
                            )}
                            {!comment.is_deleted && (
                              <button
                                onClick={() => handleCommentAction(comment.id, 'delete')}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                            {comment.is_deleted && (
                              <button
                                onClick={() => handleCommentAction(comment.id, 'restore')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

