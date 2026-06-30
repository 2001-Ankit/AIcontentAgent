import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateContent } from '../lib/api.js';
import StepTracker from '../components/StepTracker.jsx';
import { hasCredits, deductCredits } from '../lib/credits.js';
import { refreshCredits } from '../components/CreditsDisplay.jsx';

const FILLS = [
  'I launched a new AI productivity app that auto-manages your calendar',
  'My handmade jewelry brand just hit 10K sales on Etsy',
  'Sharing my 30-day fitness transformation journey with tips',
  'Review of the best free tools for solopreneurs in 2025',
  'How I grew my newsletter from 0 to 50K subscribers in 6 months',
  'Behind-the-scenes of running a one-person software business',
];

export default function PromptStep() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!state.prompt.trim() || loading) return;
    if (!hasCredits('autopilot')) {
      dispatch({ type: 'GEN_ERROR', message: 'Not enough credits — click the credits panel in the sidebar to get more.' });
      return;
    }
    const ok = deductCredits('autopilot', state.prompt.slice(0, 40));
    if (!ok) return;
    refreshCredits();
    setLoading(true);
    dispatch({ type: 'SET_STEP', step: 'generating' });
    dispatch({ type: 'GEN_STAGE', stage: 0, label: 'Starting...' });

    try {
      await generateContent(state.prompt, (event, data) => {
        if (event === 'stage') dispatch({ type: 'GEN_STAGE', stage: data.stage, label: data.label });
        if (event === 'captions') dispatch({ type: 'GEN_CAPTIONS', captions: data.captions });
        if (event === 'image') dispatch({ type: 'GEN_IMAGE', imageUrl: data.imageUrl });
        if (event === 'platforms') dispatch({ type: 'GEN_PLATFORMS', platforms: data.platforms });
        if (event === 'complete') {
          dispatch({
            type: 'GEN_COMPLETE',
            captions: data.captions,
            platforms: data.platforms,
            imageUrl: data.imageUrl,
            imagePrompt: data.imagePrompt,
            videoPrompt: data.videoPrompt,
            suggestedHashtags: data.suggestedHashtags,
          });
        }
        if (event === 'error') dispatch({ type: 'GEN_ERROR', message: data.message });
      });
    } catch (err) {
      dispatch({ type: 'GEN_ERROR', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <StepTracker currentStep="prompt" />
        <h1 className="text-[26px] font-bold text-dark mt-4 leading-tight">
          What's your content idea?
        </h1>
        <p className="text-muted text-[14px] mt-1">
          Describe your idea in a sentence. Ripple turns it into posts for every platform.
        </p>
      </div>

      {/* Error */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600 font-medium">
          {state.error}
        </div>
      )}

      {/* Prompt input */}
      <div className="card p-4 space-y-3">
        <textarea
          className="input-base resize-none leading-relaxed"
          rows={4}
          placeholder="e.g. I just launched a new AI tool that helps freelancers track their income..."
          value={state.prompt}
          onChange={e => dispatch({ type: 'SET_PROMPT', prompt: e.target.value })}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
        />

        {/* Quick fills */}
        <div>
          <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mb-2">Try an example</p>
          <div className="flex flex-wrap gap-1.5">
            {FILLS.map(fill => (
              <button
                key={fill}
                onClick={() => dispatch({ type: 'SET_PROMPT', prompt: fill })}
                className="text-[11.5px] text-muted bg-light hover:bg-border px-2.5 py-1 rounded-lg font-medium transition-colors line-clamp-1 text-left"
                style={{ maxWidth: 220 }}
              >
                {fill.length > 40 ? fill.slice(0, 40) + '…' : fill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!state.prompt.trim() || loading}
        className="w-full btn-primary py-3.5 text-[15px] flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        Generate Content
        <span className="text-white/60 text-[12px] font-normal">⌘↵</span>
      </button>

      {/* What gets generated */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: '✍️', label: '3 caption styles', sub: 'Bold, Storytime, CTA' },
          { icon: '🖼️', label: 'AI-generated image', sub: 'Unique image per post' },
          { icon: '🎬', label: 'Canvas video', sub: 'Ken Burns effect, 8s' },
          { icon: '📱', label: '6 platform versions', sub: 'IG · TikTok · YT · more' },
        ].map(item => (
          <div key={item.label} className="bg-light/60 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <span className="text-lg">{item.icon}</span>
            <div>
              <p className="text-[12px] font-semibold text-dark">{item.label}</p>
              <p className="text-[11px] text-muted">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
