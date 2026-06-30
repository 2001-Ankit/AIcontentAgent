const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

const STEPS = ['Describe', 'Generate', 'Review', 'Schedule'];
const STEP_INDEX = { prompt: 0, generating: 1, review: 2, schedule: 3, done: 4 };

export default function StepTracker({ currentStep }) {
  const ci = STEP_INDEX[currentStep] ?? 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STEPS.map((label, i) => {
        const state = i < ci ? 'done' : i === ci ? 'active' : 'todo';

        return (
          <div
            key={label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-all duration-300 ${
              state === 'active'
                ? 'bg-dark text-white'
                : state === 'done'
                ? 'bg-light text-muted'
                : 'text-[#BCB4A8] border border-dashed border-[#DCD4C8]'
            }`}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={
                state === 'active'
                  ? { background: GRADIENT, color: '#fff' }
                  : state === 'done'
                  ? { background: '#191512', color: '#fff' }
                  : { background: '#EAE3D7', color: '#BCB4A8' }
              }
            >
              {state === 'done' ? '✓' : i + 1}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );
}
