'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaItem } from '@/lib/types/database';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import CommentSection from './CommentSection';

interface MediaCardProps {
  media: MediaItem;
}

export default function MediaCard({ media }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const publicUrl = supabase.storage
    .from('media-uploads')
    .getPublicUrl(media.storage_path).data.publicUrl;

  const handleImageClick = () => {
    if (media.file_type === 'image') {
      setShowFullImage(true);
    }
  };

  return (
    <>
      <article className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* Media content */}
        <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
          {media.file_type === 'image' ? (
            <>
              {!imageError ? (
                <Image
                  src={publicUrl}
                  alt={media.caption || media.file_name}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={handleImageClick}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">Failed to load image</p>
                </div>
              )}
            </>
          ) : (
            <video
              src={publicUrl}
              controls
              className="w-full h-full object-cover"
              playsInline
            />
          )}
        </div>

        {/* Metadata */}
        <div className="p-4 space-y-3">
          {/* Caption and uploader info */}
          {(media.caption || media.uploader_name) && (
            <div className="space-y-1">
              {media.uploader_name && (
                <p className="font-semibold text-gray-900">{media.uploader_name}</p>
              )}
              {media.caption && (
                <p className="text-gray-700 whitespace-pre-wrap break-words">
                  {media.caption}
                </p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-500">{formatDate(media.created_at)}</p>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showComments ? 'Hide' : 'Show'} Comments
          </button>

          {/* Comments section */}
          {showComments && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <CommentSection mediaId={media.id} />
            </div>
          )}
        </div>
      </article>

      {/* Full image modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={publicUrl}
              alt={media.caption || media.file_name}
              width={1920}
              height={1080}
              className="object-contain max-w-full max-h-[90vh]"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}

