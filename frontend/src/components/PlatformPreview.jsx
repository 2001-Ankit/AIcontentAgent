import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { PLATFORMS } from '../lib/platforms.js';

function InstagramPreview({ caption, imageUrl, hashtags }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm max-w-sm mx-auto">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="w-8 h-8 rounded-full gradient-bg" />
        <div>
          <p className="text-[12px] font-bold text-dark">your.brand</p>
          <p className="text-[10px] text-muted">Sponsored</p>
        </div>
        <span className="ml-auto text-muted text-lg">···</span>
      </div>
      <div className="aspect-square bg-light overflow-hidden">
        {imageUrl
          ? <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full shimmer-bg" />
        }
      </div>
      <div className="px-3 py-2.5">
        <div className="flex gap-3 mb-2">
          {['♡', '💬', '↗'].map(icon => (
            <span key={icon} className="text-lg text-dark">{icon}</span>
          ))}
          <span className="ml-auto text-lg text-dark">🔖</span>
        </div>
        <p className="text-[12px] text-dark leading-snug line-clamp-3">{caption}</p>
        {hashtags?.length > 0 && (
          <p className="text-[11px] text-blue-500 mt-1 line-clamp-1">
            {hashtags.slice(0, 8).map(t => `#${t.replace('#', '')}`).join(' ')}
          </p>
        )}
      </div>
    </div>
  );
}

function TikTokPreview({ caption, imageUrl }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden max-w-[200px] mx-auto shadow-lg"
      style={{ aspectRatio: '9/16' }}
    >
      <div className="absolute inset-0 bg-black">
        {imageUrl
          ? <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-90" />
          : <div className="w-full h-full shimmer-bg" />
        }
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-3 right-10">
        <p className="text-white text-[11px] font-semibold leading-snug line-clamp-3">{caption}</p>
      </div>
      <div className="absolute right-2 bottom-8 flex flex-col items-center gap-3">
        {['♡', '💬', '↗', '♪'].map((icon, i) => (
          <div key={i} className="text-white text-base text-center">{icon}</div>
        ))}
      </div>
    </div>
  );
}

function TwitterPreview({ tweet }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 max-w-sm mx-auto shadow-sm">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full gradient-bg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-dark">Your Brand</span>
            <span className="text-muted text-[12px]">@yourbrand · now</span>
          </div>
          <p className="text-[13px] text-dark mt-1 leading-snug">{tweet}</p>
          <div className="flex gap-5 mt-3 text-muted text-[12px]">
            {['💬', '↻', '♡', '↗'].map((icon, i) => (
              <span key={i}>{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ post, imageUrl }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden max-w-sm mx-auto shadow-sm">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-9 h-9 rounded-full gradient-bg" />
        <div>
          <p className="text-[12px] font-bold text-dark">Your Name</p>
          <p className="text-[10px] text-muted">Founder · 1st · just now</p>
        </div>
      </div>
      <p className="px-4 pb-3 text-[12px] text-dark leading-snug line-clamp-4">{post}</p>
      {imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-4 py-2.5 border-t border-border flex gap-4 text-[11px] text-muted">
        {['👍 Like', '💬 Comment', '↗ Share'].map(a => (
          <span key={a}>{a}</span>
        ))}
      </div>
    </div>
  );
}

function GenericPreview({ platform, caption, imageUrl }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 max-w-sm mx-auto shadow-sm">
      <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-light">
        {imageUrl
          ? <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full shimmer-bg" />
        }
      </div>
      <p className="text-[13px] text-dark leading-snug">{caption}</p>
    </div>
  );
}

export default function PlatformPreview({ imageUrl }) {
  const { state, dispatch } = useApp();
  const { previewPlatform, platformContent, captions, selectedCaption } = state;

  const pc = platformContent[previewPlatform] || {};
  const baseCaption = captions[selectedCaption]?.text || '';

  const caption =
    pc.caption || pc.tweet || pc.post || pc.description || baseCaption;

  function renderPreview() {
    switch (previewPlatform) {
      case 'instagram': return <InstagramPreview caption={caption} imageUrl={imageUrl} hashtags={pc.hashtags} />;
      case 'tiktok':    return <TikTokPreview caption={caption} imageUrl={imageUrl} />;
      case 'x':         return <TwitterPreview tweet={pc.tweet || caption} />;
      case 'linkedin':  return <LinkedInPreview post={pc.post || caption} imageUrl={imageUrl} />;
      case 'youtube':
        return (
          <div className="bg-white rounded-2xl border border-border overflow-hidden max-w-sm mx-auto shadow-sm">
            <div className="aspect-video bg-black overflow-hidden">
              {imageUrl
                ? <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-900 shimmer-bg" />
              }
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-dark line-clamp-2">{pc.title || caption}</p>
              <p className="text-[11px] text-muted mt-0.5">Your Channel · 0 views · just now</p>
            </div>
          </div>
        );
      default: return <GenericPreview platform={previewPlatform} caption={caption} imageUrl={imageUrl} />;
    }
  }

  return (
    <div className="space-y-4">
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(p => {
          const active = previewPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => dispatch({ type: 'SET_PREVIEW_PLATFORM', platform: p.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                active
                  ? 'bg-dark text-white border border-dark'
                  : 'border border-border text-muted hover:text-dark hover:border-dark'
              }`}
            >
              <p.Icon size={13} style={{ color: active ? '#fff' : p.color }} />
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="animate-fade-in">{renderPreview()}</div>
    </div>
  );
}
