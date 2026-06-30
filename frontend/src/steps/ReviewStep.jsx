import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import StepTracker from '../components/StepTracker.jsx';
import PlatformPreview from '../components/PlatformPreview.jsx';
import VideoPreview from '../components/VideoCanvas.jsx';
import { regenerateImage } from '../lib/api.js';

const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

function CaptionCard({ caption, index, selected, onClick }) {
  const toneColors = {
    'Bold hook': 'text-pink-600 bg-pink-50 border-pink-100',
    'Storytime': 'text-blue-600 bg-blue-50 border-blue-100',
    'Punchy CTA': 'text-green-700 bg-green-50 border-green-100',
  };
  const toneStyle = toneColors[caption.tone] || 'text-muted bg-light border-border';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-[1.5px] transition-all duration-150 ${
        selected
          ? 'border-purple-400 bg-purple-50/60 shadow-[0_0_0_4px_rgba(168,85,247,0.10)]'
          : 'border-border bg-white hover:border-purple-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${toneStyle}`}>
          {caption.tone}
        </span>
        {selected && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: GRADIENT }}
          >
            ✓
          </span>
        )}
      </div>
      <p className="text-[13px] text-dark leading-snug">{caption.text}</p>
    </button>
  );
}

function ImagePanel({ imageUrl, imagePrompt, onRegenerate, regenerating }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-light border border-border">
        {!imgLoaded && <div className="absolute inset-0 shimmer-bg" />}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated"
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        )}
        {regenerating && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          </div>
        )}
      </div>
      <button
        onClick={onRegenerate}
        disabled={regenerating}
        className="w-full btn-ghost text-[12.5px] py-2 flex items-center justify-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
        {regenerating ? 'Regenerating…' : 'New image'}
      </button>
    </div>
  );
}

export default function ReviewStep() {
  const { state, dispatch } = useApp();
  const { captions, selectedCaption, imageUrl, imagePrompt, videoPrompt, previewPlatform } = state;
  const [tab, setTab] = useState('captions'); // captions | image | video | preview
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedText = captions[selectedCaption]?.text || '';

  async function handleRegenImage() {
    if (!imagePrompt || regenerating) return;
    setRegenerating(true);
    try {
      const { imageUrl: newUrl } = await regenerateImage(imagePrompt);
      dispatch({ type: 'SET_IMAGE_URL', imageUrl: newUrl });
    } catch {}
    finally { setRegenerating(false); }
  }

  function copyCaption() {
    navigator.clipboard.writeText(selectedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const tabs = [
    { id: 'captions', label: '✍️ Captions' },
    { id: 'image', label: '🖼️ Image' },
    { id: 'video', label: '🎬 Video' },
    { id: 'preview', label: '📱 Preview' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <StepTracker currentStep="review" />
        <h1 className="text-[24px] font-bold text-dark mt-4">Review your content</h1>
        <p className="text-muted text-[13.5px] mt-1">Pick a caption, check the image and video, then schedule.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-light rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
              tab === t.id ? 'bg-white text-dark shadow-sm' : 'text-muted hover:text-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Captions tab */}
      {tab === 'captions' && (
        <div className="space-y-3 animate-fade-in">
          {captions.length === 0 ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl shimmer-bg" />)}
            </div>
          ) : (
            captions.map((cap, i) => (
              <CaptionCard
                key={cap.tone}
                caption={cap}
                index={i}
                selected={selectedCaption === i}
                onClick={() => dispatch({ type: 'SELECT_CAPTION', index: i })}
              />
            ))
          )}

          {selectedText && (
            <div className="flex gap-2 pt-1">
              <button onClick={copyCaption} className="btn-ghost text-[12.5px] flex-1 flex items-center justify-center gap-1.5">
                {copied ? '✓ Copied!' : '📋 Copy caption'}
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_STEP', step: 'schedule' })}
                className="btn-primary flex-1 text-[12.5px]"
              >
                Next: Schedule →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image tab */}
      {tab === 'image' && (
        <div className="animate-fade-in">
          <ImagePanel
            imageUrl={imageUrl}
            imagePrompt={imagePrompt}
            onRegenerate={handleRegenImage}
            regenerating={regenerating}
          />
          {imageUrl && (
            <div className="mt-3 flex gap-2">
              <a
                href={imageUrl}
                download="ripple-image.jpg"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost flex-1 text-center text-[12.5px]"
              >
                ↓ Download
              </a>
              <button
                onClick={() => dispatch({ type: 'SET_STEP', step: 'schedule' })}
                className="btn-primary flex-1 text-[12.5px]"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Video tab */}
      {tab === 'video' && (
        <div className="animate-fade-in space-y-3">
          <VideoPreview
            imageUrl={imageUrl}
            caption={selectedText}
            platform={previewPlatform}
          />
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'schedule' })}
            className="btn-primary w-full text-[12.5px]"
          >
            Next: Schedule →
          </button>
        </div>
      )}

      {/* Platform preview tab */}
      {tab === 'preview' && (
        <div className="animate-fade-in space-y-3">
          <PlatformPreview imageUrl={imageUrl} />
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'schedule' })}
            className="btn-primary w-full text-[12.5px] mt-2"
          >
            Next: Schedule →
          </button>
        </div>
      )}
    </div>
  );
}
