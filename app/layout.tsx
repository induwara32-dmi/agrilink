import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/providers/app-provider';

export const metadata: Metadata = {
  title: 'AgriLink',
  description: 'A production-ready agricultural marketplace foundation built with Next.js.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
