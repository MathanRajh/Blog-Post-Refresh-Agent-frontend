'use client';
import { useRouter } from 'next/navigation';
import { useBlog } from '../../context/BlogContext';
import { useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function ViewPage() {
  const { finalHtml } = useBlog();
  const router = useRouter();

  useEffect(() => {
    if (!finalHtml) {
      console.log("DEBUG: finalHtml is empty, redirecting...");
      router.push('/');
    }
  }, [finalHtml, router]);

  if (!finalHtml) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Legend Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Refreshed Content
          </h1>

          {/* Visual Legend */}
          <div className="flex gap-6 text-sm font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-green-600 font-bold">Link ✓</span> Valid
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-red-500 line-through decoration-red-500">Link</span> Invalid
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={14} />
            Start Over
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-6">
        {/* Verification Check: Ensures content is long enough to be an article */}
        {finalHtml.length > 100 ? (
          <article
            className="blog-content prose prose-lg prose-slate max-w-none min-h-[500px]"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 rounded-3xl">
            <AlertCircle size={48} className="text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Content Rendering Error</h2>
            <p className="text-slate-500 text-center mt-2">
              The generated content was too short to display safely.
              This usually happens if the AI summarized the article instead of assembling it verbatim.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
