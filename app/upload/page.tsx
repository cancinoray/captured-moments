import UploadForm from '@/components/UploadForm';
import Link from 'next/link';

export default function UploadPage() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Captured Moments
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
            >
              Back to Feed
            </Link>
          </div>
        </div>
      </nav>
      <div className="py-8">
        <UploadForm />
      </div>
    </div>
  );
}

