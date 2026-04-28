'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [layer, setLayer] = useState('direct');
  const [error, setError] = useState<string | null>(null);
  const [minMatches, setMinMatches] = useState<number>(2); // Default criteria
  const [manualKeywords, setManualKeywords] = useState<string>(''); // User-defined keywords

  // AI Drafting States
  const [draftingPostId, setDraftingPostId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftError, setDraftError] = useState<string | null>(null);

  // AI Inbound Post States
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generatedPostData, setGeneratedPostData] = useState<{title: string, body: string, suggestedSubreddit?: string} | null>(null);
  const [generatePostError, setGeneratePostError] = useState<string | null>(null);

  const KEYWORDS = [
    // Pain / Intent Signals
    'budget', 'cost', 'expensive', 'slow', 'looking for', 'need help', 'aws', 
    'burn rate', 'technical debt', 'runway', 'struggling', 'stuck', 'hiring', 
    'hire', 'freelancer', 'agency', 'founder', 'co-founder', 'cofounder',
    // Core Dazeco Solutions
    'mvp', 'automation', 'crm', 'ai', 'dashboard', 'custom', 'automated', 
    'engine', 'product', 'business', 'script',
    // Tech & Roles
    'developer', 'software', 'website', 'site', 'dev', 'security', 'backend', 
    'frontend', 'mern', 'fullstack', 'full-stack', 'ui ux', 'ui/ux', 'graphics', 
    'ci cd', 'ci/cd', 'deployment', 'cloud', 'infra', 'infrastructure', 'build', 
    'database', 'python', 'vercel', 'netlify', 'shopify', 'wordpress', 'wix', 
    'next.js', 'react', 'pytorch', 'api', 'scraping', 'machine learning', 'ml',
    'tech', 'technical'
  ];

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reddit?layer=${layer}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      if (data.data?.children) {
        const rawPosts = data.data.children.map((child: any) => {
          return { ...child.data };
        });

        setPosts(rawPosts);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [layer]);

  const highlightKeywords = (text: string) => {
    if (!text) return '';
    let highlightedText = text;
    const customKws = manualKeywords.split(',').map(k => k.trim()).filter(k => k !== '');
    const allKws = [...KEYWORDS, ...customKws];

    allKws.forEach(kw => {
      const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(\\b${escapedKw}\\b)`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-black px-1 rounded font-semibold">$1</mark>');
    });
    return highlightedText;
  };

  const generateDraft = async (post: any) => {
    setDraftingPostId(post.id);
    setDraftError(null);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postTitle: post.title,
          postText: post.selftext,
          subreddit: post.subreddit
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate draft');
      
      setDrafts(prev => ({ ...prev, [post.id]: data.draft }));
    } catch (err: any) {
      setDraftError(err.message);
    } finally {
      setDraftingPostId(null);
    }
  };

  const scoredPosts = posts.map(post => {
    const textToSearch = `${post.title || ''} ${post.selftext || ''}`.toLowerCase();
    let matchCount = 0;
    const customKws = manualKeywords.split(',').map(k => k.trim()).filter(k => k !== '');
    const allKws = [...KEYWORDS, ...customKws];

    allKws.forEach(kw => {
      const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textToSearch)) {
        matchCount++;
      }
    });
    return { ...post, matchCount };
  });

  const qualifiedPosts = scoredPosts.filter(post => post.matchCount >= minMatches);

  const generateViralPost = async () => {
    if (qualifiedPosts.length === 0) return;
    setGeneratingPost(true);
    setGeneratePostError(null);
    setGeneratedPostData(null);
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: qualifiedPosts.slice(0, 10).map(p => ({ title: p.title, selftext: p.selftext })),
          layer
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate post');
      setGeneratedPostData(data);
    } catch (err: any) {
      setGeneratePostError(err.message);
    } finally {
      setGeneratingPost(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 font-sans selection:bg-emerald-400 selection:text-black">
      <header className="mb-10 max-w-5xl mx-auto flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <img src="/dazelogo.png" alt="Daze Logo" className="w-14 h-14 object-contain rounded" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">Aaditri <span className="text-emerald-400 font-mono">Signal_Engine</span></h1>
            <p className="text-gray-400 mt-1 text-[10px] uppercase tracking-[0.2em] font-bold">Automated Client Acquisition — Aaditri GlobalTech Pvt Ltd</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 focus-within:border-emerald-500 transition-colors">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Filter:</span>
            <input 
              type="text" 
              placeholder="e.g. react, shopify, api"
              value={manualKeywords}
              onChange={(e) => setManualKeywords(e.target.value)}
              className="bg-transparent border-none text-xs text-emerald-400 placeholder:text-gray-600 focus:ring-0 w-48 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Min Key:</span>
            <input 
              type="number" 
              min="0" 
              max="10"
              value={minMatches} 
              onChange={(e) => setMinMatches(Number(e.target.value))}
              className="w-10 bg-gray-900 text-emerald-400 font-bold text-center border-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
            />
          </div>
          <button 
            onClick={fetchPosts} 
            disabled={loading}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-md text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Refresh'}
          </button>
          <button 
            onClick={generateViralPost} 
            disabled={generatingPost || qualifiedPosts.length === 0}
            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/50 px-4 py-2 rounded-md text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50"
          >
            {generatingPost ? 'Writing...' : 'Viral Post'}
          </button>
        </div>
      </header>

      {/* Generated Post Modal/Section */}
      {generatePostError && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-900/50 text-red-400 p-4 rounded-md text-sm border border-red-700">
          Failed to generate post: {generatePostError}
        </div>
      )}
      {generatedPostData && (
        <div className="max-w-5xl mx-auto mb-8 bg-[#0a0a0a] border border-purple-500/50 p-6 rounded-lg shadow-[0_0_30px_rgba(168,85,247,0.1)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-bold text-purple-400">Inbound Authority Post Generated</h2>
              {generatedPostData.suggestedSubreddit && (
                <div className="text-xs font-mono text-emerald-400 mt-1">Suggested Subreddit: {generatedPostData.suggestedSubreddit}</div>
              )}
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(`${generatedPostData.title}\n\n${generatedPostData.body}`)}
              className="text-xs uppercase tracking-wider font-bold bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-3 py-1.5 rounded transition-colors"
            >
              Copy Full Post
            </button>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{generatedPostData.title}</h3>
            <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed bg-black p-4 rounded border border-gray-800">
              {generatedPostData.body}
            </div>
          </div>
          <div className="text-xs text-gray-500 italic">
            Based on the pain points from the top signals in this layer.
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto flex gap-8">
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Lead Layers</h2>
          {[
            { id: 'direct', label: 'Layer 1: Direct Leads', desc: 'People actively hiring devs.' },
            { id: 'intent', label: 'Layer 2: Intent Leads', desc: 'Founders, Startups, SaaS.' },
            { id: 'tech', label: 'Layer 3: AI & Niches', desc: 'AI, Data, CRM, Niches.' },
            { id: 'india', label: 'Layer 4: India Pool', desc: 'StartUpIndia, devIndia.' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              className={`text-left p-4 rounded-md transition-all border ${layer === l.id ? 'bg-emerald-900/10 border-emerald-500/50 text-emerald-400' : 'bg-gray-900/30 border-gray-800 hover:border-gray-600 text-gray-400'}`}
            >
              <div className="font-semibold text-sm">{l.label}</div>
              <div className="text-xs text-gray-500 mt-1">{l.desc}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {error && <div className="bg-red-900/50 text-red-400 p-4 rounded-md text-sm">{error}</div>}
          {draftError && <div className="bg-yellow-900/50 text-yellow-400 p-4 rounded-md text-sm border border-yellow-700">AI Error: {draftError}</div>}
          
          {!loading && posts.length > 0 && (
            <div className="text-xs text-gray-500 font-mono">
              Found {qualifiedPosts.length} qualified leads (out of {posts.length} scanned) containing {minMatches}+ keywords.
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">Scanning for high-intent signals...</div>
          ) : qualifiedPosts.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">No signals met the criteria. Lower the Min Keywords or check a different layer.</div>
          ) : (
            qualifiedPosts.map(post => (
              <div key={post.id} className="bg-black border border-gray-800 p-6 rounded-lg hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.05)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 mb-2">r/{post.subreddit} • u/{post.author}</div>
                    <h3 className="text-lg font-bold text-gray-100" dangerouslySetInnerHTML={{ __html: highlightKeywords(post.title) }} />
                  </div>
                  <div className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {post.matchCount} Matches
                  </div>
                </div>
                
                {post.selftext && (
                  <div className="text-sm text-gray-300 bg-[#0a0a0a] border border-gray-800/50 p-4 rounded-md mb-4 line-clamp-4 leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: highlightKeywords(post.selftext) }} />
                )}

                {/* AI Draft Section */}
                {drafts[post.id] && (
                  <div className="mt-4 mb-4 p-4 bg-black rounded border border-gray-700">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold flex justify-between">
                      <span>Generated Reply (Aaditri Voice)</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(drafts[post.id])}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {drafts[post.id]}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                  <div className="text-xs text-gray-500">
                    {post.ups} upvotes • {post.num_comments} comments
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => generateDraft(post)}
                      disabled={draftingPostId === post.id}
                      className="text-xs uppercase tracking-wider font-bold bg-gray-100 hover:bg-white text-black px-4 py-2 rounded transition-colors disabled:opacity-50"
                    >
                      {draftingPostId === post.id ? 'Drafting...' : 'Generate Reply'}
                    </button>
                    <a 
                      href={`https://reddit.com${post.permalink}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      View on Reddit
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

