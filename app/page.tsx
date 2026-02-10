'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBlog } from '../context/BlogContext';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const { setUrl, setAuditData } = useBlog();
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ copy state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const router = useRouter();

  const handleAnalyze = async () => {
    if (!inputUrl) return;
    setLoading(true);
    setUrl(inputUrl);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ detail: 'Unknown Backend Error' }));
        throw new Error(errData.detail || 'Backend error');
      }

      const data = await res.json();
      setAuditData(data.audit);
      router.push('/confirm');
    } catch (error: any) {
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ copy handler
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1200);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20">
          <Sparkles size={16} />
          <span className="text-sm font-medium">
            Powered by Gemini 2.0 Flash
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-bold tracking-tight">
          Refine Your Content. <br />
          <span className="text-blue-500">Instantly.</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Enter a blog URL. We&apos;ll audit the structure, validate links using
          Python, and propose a smarter, 6-section layout.
        </p>

        <div className="group flex items-center justify-center gap-2">
          <span className="whitespace-nowrap">more than 6 sections:</span>

          <a
            href="https://gregorygundersen.com/blog/2020/01/12/why-research-blog/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300 transition"
          >
            Open example blog
          </a>

          <button
            onClick={() =>
              handleCopy(
                'https://gregorygundersen.com/blog/2020/01/12/why-research-blog/'
              )
            }
            className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-slate-200"
            aria-label="Copy link"
          >
            {copiedUrl ===
              'https://gregorygundersen.com/blog/2020/01/12/why-research-blog/'
              ? '✓'
              : '📋'}
          </button>
        </div>

        <div className="group flex items-center justify-center gap-2">

          <span className="whitespace-nowrap">less than 6 sections:</span>

          <a
            href="https://www.edsurge.com/news/2026-02-05-new-aap-screen-time-recommendations-focus-less-on-screens-more-on-family-time"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300 transition"
          >
            Open example blog
          </a>

          <button
            onClick={() =>
              handleCopy(
                'https://www.edsurge.com/news/2026-02-05-new-aap-screen-time-recommendations-focus-less-on-screens-more-on-family-time'
              )
            }
            className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-slate-200"
            aria-label="Copy link"
          >
            {copiedUrl ===
              'https://www.edsurge.com/news/2026-02-05-new-aap-screen-time-recommendations-focus-less-on-screens-more-on-family-time'
              ? '✓'
              : '📋'}
          </button>
        </div>


        {/* Input */}
        <div className="flex gap-3 max-w-xl mx-auto mt-10 relative">
          <input
            type="url"
            placeholder="https://your-blog.com/post-1"
            className="w-full p-5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-sm transition-all"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          </button>
        </div>
      </div>
    </main>
  );
}
