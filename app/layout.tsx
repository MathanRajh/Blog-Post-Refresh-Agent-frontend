import './globals.css';
import { BlogProvider } from '../context/BlogContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RAG Blog Refresher',
  description: 'AI-powered content auditor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BlogProvider>
          {children}
        </BlogProvider>
      </body>
    </html>
  );
}