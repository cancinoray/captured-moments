'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Comment, CommentInsert } from '@/lib/types/database';
import { formatDate, getClientIP } from '@/lib/utils';

interface CommentSectionProps {
  mediaId: string;
}

export default function CommentSection({ mediaId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commenterName, setCommenterName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('media_id', mediaId)
        .eq('is_approved', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [mediaId]);

  // Subscribe to real-time comment updates
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${mediaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `media_id=eq.${mediaId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment;
          if (newComment.is_approved && !newComment.is_deleted) {
            setComments((prev) => [...prev, newComment]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `media_id=eq.${mediaId}`,
        },
        (payload) => {
          const updatedComment = payload.new as Comment;
          setComments((prev) =>
            prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mediaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const clientIP = await getClientIP();

      const newComment: CommentInsert = {
        media_id: mediaId,
        content: commentContent.trim(),
        commenter_name: commenterName.trim() || null,
        commenter_ip: clientIP,
        is_approved: true,
      };

      const { error: insertError } = await supabase
        .from('comments')
        .insert(newComment);

      if (insertError) throw insertError;

      // Clear form
      setCommentContent('');
      // Keep commenter name for convenience
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submitting}
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submitting}
            required
          />
          <button
            type="submit"
            disabled={submitting || !commentContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  {comment.commenter_name && (
                    <p className="text-sm font-semibold text-gray-900">
                      {comment.commenter_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

