import { useState } from 'react';
import { hasCredits, deductCredits } from '../lib/credits.js';
import { refreshCredits } from '../components/CreditsDisplay.jsx';
import { PLATFORMS as PLATFORM_LIST } from '../lib/platforms.js';

const BASE = import.meta.env.VITE_API_URL ?? '';
const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

const TONES = [
  { id: 'casual',        label: '😊 Casual' },
  { id: 'professional',  label: '👔 Professional' },
  { id: 'humorous',      label: '😂 Humorous' },
  { id: 'inspirational', label: '🔥 Inspirational' },
  { id: 'educational',   label: '📚 Educational' },
  { id: 'storytelling',  label: '📖 Storytelling' },
];

const COUNT_OPTIONS = [3, 5, 7];

async function* parseSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      if (!part.trim()) continue;
      let event = 'message', data = '';
      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        if (line.startsWith('data: ')) data = line.slice(6).trim();
      }
      if (data) { try { yield { event, data: JSON.parse(data) }; } catch {} }
    }
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────

function HashtagGroup({ title, tags, color }) {
  const [copied, setCopied] = useState(false);

  function copyAll() {
    const text = tags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${color}`}>{title}</span>
        <button onClick={copyAll} className="text-[11px] text-muted hover:text-dark font-semibold transition-colors">
          {copied ? '✓ Copied' : 'Copy all'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span
            key={tag}
            onClick={() => { navigator.clipboard.writeText(tag.startsWith('#') ? tag : `#${tag}`); }}
            className="text-[11.5px] bg-light border border-border px-2.5 py-1 rounded-lg font-medium text-dark cursor-pointer hover:bg-border transition-colors"
          >
            {tag.startsWith('#') ? tag : `#${tag}`}
          </span>
        ))}
      </div>
    </div>
  );
}

function CaptionCard({ cap, index, platform, utmLinks }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(index === 0);
  const link = utmLinks?.find(l => l.captionId === (cap.id || index + 1));

  function copy() {
    const text = link
      ? `${cap.caption}\n\n🔗 ${link.url}`
      : cap.caption;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const reachColors = {
    high: 'bg-green-50 text-green-600 border-green-100',
    medium: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    low: 'bg-gray-50 text-gray-500 border-gray-100',
  };

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-light/40 transition-colors"
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
          style={{ background: GRADIENT }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold text-dark line-clamp-1">{cap.hook || cap.caption?.slice(0, 80)}</p>
          <div className="flex items-center gap-2 mt-1">
            {cap.estimatedReach && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${reachColors[cap.estimatedReach] || reachColors.medium}`}>
                {cap.estimatedReach} reach
              </span>
            )}
            {cap.characterCount > 0 && (
              <span className="text-[10.5px] text-muted">{cap.characterCount} chars</span>
            )}
          </div>
        </div>
        <span className="text-muted text-sm ml-2">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <p className="text-[13px] text-dark leading-relaxed whitespace-pre-wrap border-l-2 border-purple-200 pl-3">
            {cap.caption}
          </p>

          {cap.cta && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-[10.5px] font-bold text-blue-500 uppercase tracking-wide mb-0.5">CTA</p>
              <p className="text-[12.5px] text-blue-700">{cap.cta}</p>
            </div>
          )}

          {cap.whyItWorks && (
            <div className="bg-purple-50 rounded-lg px-3 py-2">
              <p className="text-[10.5px] font-bold text-purple-500 uppercase tracking-wide mb-0.5">Why it works</p>
              <p className="text-[12px] text-purple-700">{cap.whyItWorks}</p>
            </div>
          )}

          {link && (
            <div className="bg-light rounded-lg px-3 py-2">
              <p className="text-[10.5px] font-bold text-muted uppercase tracking-wide mb-1">
                UTM link for this caption
              </p>
              <p className="text-[11px] text-dark font-mono break-all leading-relaxed">{link.url}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(link.url); }}
                className="text-[11px] text-purple-600 font-semibold mt-1 hover:underline"
              >
                Copy link
              </button>
            </div>
          )}

          <button onClick={copy} className="btn-ghost w-full text-[12px]">
            {copied ? '✓ Copied with link!' : '📋 Copy caption' + (link ? ' + link' : '')}
          </button>
        </div>
      )}
    </div>
  );
}

function LinkStrategyTab({ linkStrategy, websiteUrl }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!websiteUrl) {
    return (
      <div className="text-center py-8 text-muted text-[13px]">
        Add your website URL in the form above to generate UTM tracking links.
      </div>
    );
  }

  if (!linkStrategy) return null;

  function copy(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  }

  return (
    <div className="space-y-4">
      {linkStrategy.bioLinkCopy && (
        <div className="card p-4">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Bio / Profile Link Copy</p>
          <p className="text-[13px] text-dark leading-snug mb-2">"{linkStrategy.bioLinkCopy}"</p>
          <button onClick={() => copy(linkStrategy.bioLinkCopy, 'bio')} className="btn-ghost text-[11.5px]">
            {copiedIdx === 'bio' ? '✓ Copied' : '📋 Copy bio text'}
          </button>
        </div>
      )}

      {linkStrategy.linkInBioText && (
        <div className="card p-4">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Link-in-Bio Label</p>
          <p className="text-[13px] text-dark mb-2">"{linkStrategy.linkInBioText}"</p>
        </div>
      )}

      {linkStrategy.anchorSuggestions?.length > 0 && (
        <div className="card p-4">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Anchor Text Suggestions</p>
          <div className="space-y-2">
            {linkStrategy.anchorSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full gradient-bg text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-dark">"{s.anchorText}"</p>
                  <p className="text-[11px] text-muted">{s.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {linkStrategy.utmLinks?.length > 0 && (
        <div className="card p-4">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">UTM Tracking Links</p>
          <div className="space-y-2">
            {linkStrategy.utmLinks.map((l, i) => (
              <div key={i} className="bg-light rounded-xl p-3">
                <p className="text-[10.5px] font-bold text-muted mb-1">{l.shortLabel}</p>
                <p className="text-[10.5px] font-mono text-dark break-all leading-relaxed">{l.url}</p>
                <button
                  onClick={() => copy(l.url, i)}
                  className="text-[11px] text-purple-600 font-semibold mt-1 hover:underline"
                >
                  {copiedIdx === i ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CaptionLabStep() {
  const [form, setForm] = useState({
    topic: '',
    platform: 'instagram',
    audience: '',
    websiteUrl: '',
    tone: 'casual',
    captionCount: 5,
  });

  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [stageLabel, setStageLabel] = useState('');
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('captions');
  const [error, setError] = useState('');

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleGenerate() {
    if (!form.topic.trim()) return;
    if (!hasCredits('caption')) {
      setError('Not enough credits. Click the credits panel in the sidebar to get more.');
      return;
    }
    const ok = deductCredits('caption', form.topic.slice(0, 40));
    if (!ok) return;
    refreshCredits();

    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${BASE}/api/captions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);

      for await (const { event, data } of parseSSE(response)) {
        if (event === 'stage') setStageLabel(data.label);
        if (event === 'complete') {
          setResult(data);
          setStatus('done');
          setTab('captions');
        }
        if (event === 'error') throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  const tabs = [
    { id: 'captions', label: `✍️ Captions (${result?.captions?.length || 0})` },
    { id: 'hashtags', label: '# Hashtags' },
    { id: 'links',    label: '🔗 Links & UTMs' },
    { id: 'insights', label: '💡 Insights' },
  ];

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-dark">Caption Lab</h1>
        <p className="text-muted text-[13.5px] mt-0.5">
          Generate captions, optimised hashtag sets, and UTM tracking links for any platform.
        </p>
      </div>

      {/* Form */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="block text-[11.5px] font-bold text-muted uppercase tracking-wider mb-1.5">
            Topic / Information *
          </label>
          <textarea
            rows={3}
            className="input-base resize-none"
            placeholder="Describe what you want to post about. The more detail, the better the output..."
            value={form.topic}
            onChange={e => setField('topic', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11.5px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_LIST.map(p => (
                <button
                  key={p.id}
                  onClick={() => setField('platform', p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all ${
                    form.platform === p.id
                      ? 'border-dark bg-dark text-white'
                      : 'border-border text-muted hover:text-dark hover:border-dark'
                  }`}
                >
                  <p.Icon size={12} style={{ color: form.platform === p.id ? '#fff' : p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Captions to generate
            </label>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setField('captionCount', n)}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-bold border transition-all ${
                    form.captionCount === n ? 'border-dark bg-dark text-white' : 'border-border text-muted'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11.5px] font-bold text-muted uppercase tracking-wider mb-1.5">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setField('tone', t.id)}
                className={`px-3 py-1.5 rounded-xl text-[11.5px] font-semibold border transition-all ${
                  form.tone === t.id
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-border text-muted hover:text-dark'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11.5px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Target Audience
            </label>
            <input
              type="text"
              className="input-base"
              placeholder="e.g. solopreneurs aged 25-40"
              value={form.audience}
              onChange={e => setField('audience', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Your Website URL (for UTMs)
            </label>
            <input
              type="url"
              className="input-base"
              placeholder="https://yourdomain.com"
              value={form.websiteUrl}
              onChange={e => setField('websiteUrl', e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[12.5px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!form.topic.trim() || status === 'loading'}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              {stageLabel || 'Generating…'}
            </>
          ) : (
            <>
              ✨ Generate Captions
              <span className="text-white/60 text-[11px]">3 credits</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3 animate-slide-up">
          {/* Tabs */}
          <div className="flex gap-1 bg-light rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all ${
                  tab === t.id ? 'bg-white text-dark shadow-sm' : 'text-muted hover:text-dark'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Captions tab */}
          {tab === 'captions' && (
            <div className="space-y-2 animate-fade-in">
              {result.captions?.map((cap, i) => (
                <CaptionCard
                  key={i}
                  cap={cap}
                  index={i}
                  platform={result.platform}
                  utmLinks={result.linkStrategy?.utmLinks}
                />
              ))}
            </div>
          )}

          {/* Hashtags tab */}
          {tab === 'hashtags' && result.hashtags && (
            <div className="card p-5 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-dark">
                  Hashtag Strategy for {PLATFORMS.find(p => p.id === result.platform)?.label}
                </h3>
                <button
                  onClick={() => {
                    const all = result.hashtags.all?.map(t => t.startsWith('#') ? t : `#${t}`).join(' ') || '';
                    navigator.clipboard.writeText(all);
                  }}
                  className="btn-ghost text-[11.5px] py-1.5"
                >
                  Copy all
                </button>
              </div>

              {result.hashtags.primary?.length > 0 && (
                <HashtagGroup title="🏆 Primary (must-use)" tags={result.hashtags.primary} color="text-purple-600" />
              )}
              {result.hashtags.secondary?.length > 0 && (
                <HashtagGroup title="📈 Secondary (reach boosters)" tags={result.hashtags.secondary} color="text-blue-600" />
              )}
              {result.hashtags.niche?.length > 0 && (
                <HashtagGroup title="🎯 Niche (targeted engagement)" tags={result.hashtags.niche} color="text-green-700" />
              )}

              {result.hashtags.all?.length > 0 && (
                <div className="bg-dark rounded-xl p-4">
                  <p className="text-[10.5px] font-bold text-white/50 uppercase tracking-wide mb-2">
                    Complete set — copy & paste ready
                  </p>
                  <p className="text-[11.5px] text-white/90 leading-relaxed font-mono">
                    {result.hashtags.all.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Links tab */}
          {tab === 'links' && (
            <div className="animate-fade-in">
              <LinkStrategyTab linkStrategy={result.linkStrategy} websiteUrl={form.websiteUrl} />
            </div>
          )}

          {/* Insights tab */}
          {tab === 'insights' && result.audienceInsights && (
            <div className="card p-5 space-y-4 animate-fade-in">
              <h3 className="text-[14px] font-bold text-dark">Audience Insights</h3>
              {[
                { label: '⏰ Best time to post', value: result.audienceInsights.bestTimeToPost },
                { label: '📌 Content pillar', value: result.audienceInsights.contentPillar },
                { label: '💬 Engagement tip', value: result.audienceInsights.engagementTip },
              ].map(item => item.value && (
                <div key={item.label} className="bg-light rounded-xl p-4">
                  <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-[13px] text-dark leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
