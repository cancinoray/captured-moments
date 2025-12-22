'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MediaItem } from '@/lib/types/database';
import MediaCard from './MediaCard';

export default function Feed() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const mediaItemsRef = useRef<MediaItem[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  const fetchMedia = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const startIndex = reset ? 0 : mediaItemsRef.current.length;
      const endIndex = reset ? 11 : mediaItemsRef.current.length + 11;

      const { data, error: fetchError } = await supabase
        .from('media_items')
        .select('*')
        .eq('is_approved', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (fetchError) throw fetchError;

      if (reset) {
        setMediaItems(data || []);
      } else {
        setMediaItems((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === 12);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMedia();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, fetchMedia]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('media_items_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media_items',
          filter: 'is_approved=eq.true',
        },
        (payload) => {
          setMediaItems((prev) => [payload.new as MediaItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (error && mediaItems.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shared Moments</h1>
        <p className="text-gray-600 mt-1">Photos and videos from our community</p>
      </div>

      {mediaItems.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No media shared yet.</p>
          <a
            href="/upload"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Be the first to share!
          </a>
        </div>
      ) : (
        <>
          {/* Grid layout: 1 column mobile, 2-3 columns desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>

          {/* Loading indicator / infinite scroll trigger */}
          <div ref={observerTarget} className="py-8">
            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
            {!hasMore && mediaItems.length > 0 && (
              <p className="text-center text-gray-500">No more media to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

