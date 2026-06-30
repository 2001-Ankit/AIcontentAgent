import { useApp } from '../context/AppContext.jsx';
import StepTracker from '../components/StepTracker.jsx';

const STAGE_LABELS = [
  'Understanding your idea...',
  'Writing 3 caption styles...',
  'Generating your visual...',
  'Adapting for all 6 platforms...',
];

const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

export default function GenerateStep() {
  const { state } = useApp();
  const { genStage, genLabel } = state;

  return (
    <div className="space-y-6">
      <div>
        <StepTracker currentStep="generating" />
        <h1 className="text-[26px] font-bold text-dark mt-4">Creating your content...</h1>
        <p className="text-muted text-[14px] mt-1 line-clamp-2 italic">"{state.prompt}"</p>
      </div>

      {/* Animated logo */}
      <div className="flex justify-center py-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: GRADIENT }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
              <circle
                cx="12" cy="12" r="8"
                stroke="#fff" strokeWidth="3"
                strokeDasharray="50"
                strokeDashoffset={50 - (genStage / 4) * 50}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
              />
            </svg>
          </div>
          {/* Pulse rings */}
          <div
            className="absolute inset-0 rounded-full opacity-30 animate-ping"
            style={{ background: GRADIENT, animationDuration: '1.5s' }}
          />
        </div>
      </div>

      {/* Stage steps */}
      <div className="card p-5 space-y-4">
        {STAGE_LABELS.map((label, i) => {
          const state_s = i < genStage ? 'done' : i === genStage ? 'active' : 'pending';
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-all duration-500"
                style={
                  state_s === 'done'
                    ? { background: GRADIENT, color: '#fff' }
                    : state_s === 'active'
                    ? { background: '#FBF3FF', border: '2px solid #A855F7', color: '#A855F7' }
                    : { background: '#F1ECE1', color: '#C7BFB2' }
                }
              >
                {state_s === 'done' ? '✓' : state_s === 'active' ? (
                  <span className="animate-pulse-dot">•</span>
                ) : ''}
              </div>
              <span
                className={`text-[13.5px] font-semibold transition-colors duration-300 ${
                  state_s === 'pending' ? 'text-[#BCB4A8]' : 'text-dark'
                }`}
              >
                {label}
              </span>
              {state_s === 'active' && (
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map(d => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fun fact while waiting */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-[12.5px] text-purple-700 font-medium">
        💡 Posts with AI-generated images get <strong>3x more engagement</strong> on average.
      </div>
    </div>
  );
}
