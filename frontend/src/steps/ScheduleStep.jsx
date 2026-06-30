import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import StepTracker from '../components/StepTracker.jsx';
import { schedulePost } from '../lib/api.js';
import { PLATFORMS as PLATFORMS_META } from '../lib/platforms.js';

const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

const WHEN_OPTIONS = [
  { id: 'optimal',  label: 'Smart time',          sub: 'AI picks peak slot per platform', badge: 'Recommended' },
  { id: 'morning',  label: 'Tomorrow morning',     sub: '8:00 AM your timezone', badge: '' },
  { id: 'custom',   label: 'Custom time',          sub: 'Pick date and time', badge: '' },
];

function getScheduledAt(when, customTime) {
  const now = new Date();
  if (when === 'morning') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString();
  }
  if (when === 'custom' && customTime) return new Date(customTime).toISOString();
  // optimal — schedule 2 hours from now as placeholder
  const optimal = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return optimal.toISOString();
}

export default function ScheduleStep({ done }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { platforms, captions, selectedCaption, imageUrl, platformContent, when, prompt } = state;
  const [posting, setPosting] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [success, setSuccess] = useState(done || false);

  const selectedPlatforms = PLATFORMS_META.filter(p => platforms[p.id]);
  const caption = captions[selectedCaption]?.text || '';

  async function handleSchedule() {
    if (!selectedPlatforms.length || posting) return;
    setPosting(true);
    try {
      const scheduledAt = getScheduledAt(when, customTime);
      const post = await schedulePost({
        prompt,
        caption,
        imageUrl,
        platforms: selectedPlatforms.map(p => p.id),
        scheduledAt,
        platformContent,
      });
      dispatch({ type: 'ADD_SCHEDULED_POST', post: { ...post, caption, image_url: imageUrl, status: 'pending' } });
      setSuccess(true);
      dispatch({ type: 'SET_STEP', step: 'done' });
    } catch (err) {
      alert('Failed to schedule: ' + err.message);
    } finally {
      setPosting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-8 animate-slide-up">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
          style={{ background: GRADIENT }}
        >
          🚀
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-dark">Post scheduled!</h2>
          <p className="text-muted text-[13.5px] mt-1.5">
            Your content is queued for {selectedPlatforms.map(p => p.name).join(', ')}.
          </p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/app/calendar')}
            className="btn-ghost flex-1 text-[13px]"
          >
            View Calendar
          </button>
          <button
            onClick={() => { dispatch({ type: 'RESET' }); navigate('/app/create'); }}
            className="btn-primary flex-1 text-[13px]"
          >
            + New Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <StepTracker currentStep="schedule" />
        <h1 className="text-[24px] font-bold text-dark mt-4">Schedule your post</h1>
        <p className="text-muted text-[13.5px] mt-1">Choose platforms and posting time.</p>
      </div>

      {/* Caption preview */}
      <div className="card p-4">
        <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mb-2">Selected caption</p>
        <p className="text-[13px] text-dark leading-snug">{caption}</p>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'review' })}
          className="text-[11.5px] text-purple-600 font-semibold mt-2 hover:underline"
        >
          ← Edit
        </button>
      </div>

      {/* Platform toggles */}
      <div className="card p-4 space-y-2">
        <p className="text-[13px] font-semibold text-dark mb-3">Post to</p>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS_META.map(p => {
            const on = platforms[p.id];
            return (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'TOGGLE_PLATFORM', platform: p.id })}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] text-[12.5px] font-semibold transition-all duration-150 ${
                  on ? 'border-dark bg-white text-dark' : 'border-border bg-light/50 text-muted'
                }`}
              >
                <p.Icon size={16} style={{ color: on ? '#fff' : p.color }} />
                <span>{p.name}</span>
                {on && (
                  <span
                    className="ml-auto w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ background: GRADIENT }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted mt-1">{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected</p>
      </div>

      {/* When */}
      <div className="card p-4 space-y-2">
        <p className="text-[13px] font-semibold text-dark mb-1">When to post</p>
        {WHEN_OPTIONS.map(opt => {
          const active = when === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => dispatch({ type: 'SET_WHEN', when: opt.id })}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-[1.5px] text-left transition-all duration-150 ${
                active ? 'border-dark bg-white' : 'border-border bg-cream hover:border-muted/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  active ? 'border-dark' : 'border-border'
                }`}
              >
                {active && <div className="w-2.5 h-2.5 rounded-full bg-dark" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-dark">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full gradient-bg text-white">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-muted">{opt.sub}</p>
              </div>
            </button>
          );
        })}

        {when === 'custom' && (
          <input
            type="datetime-local"
            className="input-base mt-1"
            value={customTime}
            min={new Date().toISOString().slice(0, 16)}
            onChange={e => setCustomTime(e.target.value)}
          />
        )}
      </div>

      {/* Smart time hints */}
      {when === 'optimal' && (
        <div className="grid grid-cols-2 gap-2">
          {selectedPlatforms.slice(0, 4).map(p => (
            <div key={p.id} className="bg-light/60 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: p.bg }} />
              <div>
                <p className="text-[11px] font-semibold text-dark">{p.name}</p>
                <p className="text-[10.5px] text-muted">{p.optimalTime}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleSchedule}
        disabled={!selectedPlatforms.length || posting || (when === 'custom' && !customTime)}
        className="w-full btn-primary py-3.5 text-[15px] flex items-center justify-center gap-2"
      >
        {posting ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Scheduling…
          </>
        ) : (
          <>
            🚀 Schedule {selectedPlatforms.length} post{selectedPlatforms.length !== 1 ? 's' : ''}
          </>
        )}
      </button>
    </div>
  );
}
