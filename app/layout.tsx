import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Captured Moments - Share Your Photos and Videos',
  description: 'A public platform to share photos and videos with the community',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}

