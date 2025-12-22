import Feed from '@/components/Feed';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Captured Moments
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>
      <Feed />
    </div>
  );
}

