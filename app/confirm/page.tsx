'use client';
import { useRouter } from 'next/navigation';
import { useBlog } from '../../context/BlogContext';
import { useState, useEffect } from 'react';
import { Check, ArrowRight, Loader2, GitMerge, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function ConfirmPage() {
  const { auditData, setFinalHtml } = useBlog();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State for Granular Approvals
  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());
  const [keptLinkUrls, setKeptLinkUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!auditData) {
      router.push('/');
      return;
    }

    // 1. Default: Select ALL structure suggestions
    if (auditData.structure_suggestions) {
      const allActionIds = auditData.structure_suggestions.map((s: any) => s.id);
      setSelectedActionIds(new Set(allActionIds));
    }

    // 2. SAFETY FIX: Default to keeping ALL links. 
    // This prevents valid links from being removed just because the AI marked them invalid.
    // The user must manually click to remove a link.
    if (auditData.link_reviews) {
      const allLinks = auditData.link_reviews.map((l: any) => l.url);
      setKeptLinkUrls(new Set(allLinks));
    }
  }, [auditData, router]);

  // Toggle Structure Action (Merge/Delete)
  const toggleAction = (id: string) => {
    const next = new Set(selectedActionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedActionIds(next);
  };

  // Toggle Link (Keep vs Remove)
  const toggleLink = (url: string) => {
    const next = new Set(keptLinkUrls);
    if (next.has(url)) next.delete(url); // Remove
    else next.add(url); // Keep
    setKeptLinkUrls(next);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Construct the Payload strictly matching Backend Pydantic Model
      const payload = {
        accepted_suggestion_ids: Array.from(selectedActionIds),
        all_suggestions: auditData.structure_suggestions || [],
        kept_link_urls: Array.from(keptLinkUrls)
      };

      console.log("Sending Payload:", payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend Error:", err);
        throw new Error(err.detail || "Generation failed");
      }

      const data = await res.json();
      setFinalHtml(data.html);
      router.push('/view');
    } catch (e) {
      alert("Error generating blog. Check console for details.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!auditData) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-10">

        <header>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Review & Approve</h1>
          <p className="text-slate-500">You have full control. Uncheck any change you don't like.</p>
        </header>

        {/* === SECTION 1: STRUCTURE ACTIONS === */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GitMerge className="text-blue-600" size={24} />
              Structure Suggestions
            </h2>
            <div className="text-sm space-x-4">
              <button onClick={() => setSelectedActionIds(new Set(auditData.structure_suggestions?.map((s: any) => s.id) || []))} className="text-blue-600 font-medium hover:underline">Select All</button>
              <button onClick={() => setSelectedActionIds(new Set())} className="text-slate-500 hover:underline">Reject All</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditData.structure_suggestions?.map((item: any) => (
              <div
                key={item.id}
                onClick={() => toggleAction(item.id)}
                className={`
                  group cursor-pointer p-5 rounded-xl border-2 transition-all relative
                  ${selectedActionIds.has(item.id)
                    ? 'border-blue-500 bg-white shadow-md ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.type === 'merge' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {item.type}
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedActionIds.has(item.id) ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {selectedActionIds.has(item.id) && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-1">
                  {item.new_heading || "Remove Section"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.reason}</p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {item.target_section_ids?.map((id: number) => (
                    <span key={id} className="text-[10px] font-mono bg-slate-100 border px-1.5 py-0.5 rounded text-slate-500">
                      Sec #{id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {(!auditData.structure_suggestions || auditData.structure_suggestions.length === 0) && (
              <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 italic">
                No structural changes needed.
              </div>
            )}
          </div>
        </section>

        {/* === SECTION 2: LINK ACTIONS === */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <LinkIcon className="text-purple-600" size={24} />
              Link Audit
            </h2>
            <div className="text-sm text-slate-500">
              Click to Toggle: <span className="text-green-600 font-bold">Keep</span> vs <span className="text-red-500 font-bold">Remove</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              {auditData.link_reviews?.map((link: any, i: number) => {
                const isKept = keptLinkUrls.has(link.url);
                return (
                  <div
                    key={i}
                    onClick={() => toggleLink(link.url)}
                    className={`
                        flex items-center gap-4 p-4 transition-colors cursor-pointer border-b last:border-0
                        ${isKept ? 'bg-white hover:bg-slate-50' : 'bg-red-50/40 hover:bg-red-50/60'}
                      `}
                  >
                    {/* Toggle Switch Visual */}
                    <div className={`
                          w-12 h-6 rounded-full flex items-center transition-colors px-1 flex-shrink-0 cursor-pointer
                          ${isKept ? 'bg-green-500' : 'bg-slate-300'}
                       `}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isKept ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`text-sm font-medium truncate ${isKept ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                          {link.url}
                        </div>
                        <a href={link.url} target="_blank" onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-blue-500">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-bold uppercase ${link.status === 'valid' ? 'text-green-600' : 'text-red-500'}`}>
                          {link.status || 'UNKNOWN'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 italic">{link.reason}</span>
                      </div>
                    </div>

                    {isKept ? (
                      <span className="text-xs font-bold text-green-700 px-2 py-1 bg-green-100 rounded border border-green-200">KEPT</span>
                    ) : (
                      <span className="text-xs font-bold text-red-700 px-2 py-1 bg-red-100 rounded border border-red-200">REMOVED</span>
                    )}
                  </div>
                );
              })}
              {(!auditData.link_reviews || auditData.link_reviews.length === 0) && (
                <div className="p-8 text-center text-slate-400 italic">No links found in content.</div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* Floating Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl flex justify-center items-center gap-8 z-50">
        <div className="flex gap-6 text-sm text-slate-600 font-medium">
          <span>Structure: <b className="text-slate-900">{selectedActionIds.size}</b> changes</span>
          <span>Links: <b className="text-slate-900">{keptLinkUrls.size}</b> kept</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Apply & Rewrite"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>

    </div>
  );
}