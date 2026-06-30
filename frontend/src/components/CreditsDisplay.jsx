import { useState, useEffect } from 'react';
import { getCredits, claimDailyBonus, claimSignupBonus, addCredits, COSTS } from '../lib/credits.js';

const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

function SignupModal({ onClose, onClaim }) {
  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);

  function handleClaim() {
    if (!email.includes('@')) return;
    const bonus = claimSignupBonus(email);
    setClaimed(true);
    onClaim(bonus);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        {claimed ? (
          <div className="text-center py-2">
            <div className="text-3xl mb-3">🎉</div>
            <h3 className="text-[17px] font-bold text-dark">+50 credits added!</h3>
            <p className="text-muted text-[13px] mt-1">Welcome to Ripple Autopilot</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: GRADIENT }}>
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-[16px] font-bold text-dark mb-1">Get 50 bonus credits</h3>
            <p className="text-[13px] text-muted mb-4">Enter your email to claim your free bonus and save your progress.</p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-base mb-3"
              onKeyDown={e => e.key === 'Enter' && handleClaim()}
              autoFocus
            />
            <button onClick={handleClaim} className="btn-primary w-full">
              Claim 50 Credits →
            </button>
            <button onClick={onClose} className="w-full text-[12px] text-muted mt-2 hover:text-dark">
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CreditsDisplay() {
  const [credits, setCredits] = useState(getCredits());
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Claim daily bonus silently
    const bonus = claimDailyBonus();
    if (bonus > 0) {
      setCredits(getCredits());
      setToast(`+${bonus} daily credits`);
      setTimeout(() => setToast(null), 3000);
    }

    // Listen for credit changes from other components
    const onStorage = () => setCredits(getCredits());
    window.addEventListener('ripple-credits-changed', onStorage);
    return () => window.removeEventListener('ripple-credits-changed', onStorage);
  }, []);

  function handleClaim(bonus) {
    setCredits(getCredits());
    setToast(`+${bonus} credits claimed!`);
    setTimeout(() => setToast(null), 3000);
  }

  const pct = Math.min(100, (credits / 150) * 100);
  const low = credits < 15;

  return (
    <>
      {showModal && <SignupModal onClose={() => setShowModal(false)} onClaim={handleClaim} />}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-dark text-white text-[12.5px] font-semibold px-4 py-2.5 rounded-xl shadow-lg z-50 animate-slide-up">
          {toast}
        </div>
      )}

      <div
        className={`mx-3 mb-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
          low ? 'border-red-200 bg-red-50' : 'border-border bg-light/60'
        }`}
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[11px] font-bold uppercase tracking-wide ${low ? 'text-red-500' : 'text-muted'}`}>
            Credits
          </span>
          <span className={`text-[13px] font-bold ${low ? 'text-red-500' : 'text-dark'}`}>
            {credits}
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: low ? '#EF4444' : GRADIENT,
            }}
          />
        </div>
        {low && (
          <p className="text-[10.5px] text-red-500 mt-1.5 font-medium">
            Low credits · tap to get more
          </p>
        )}
        <div className="mt-2 grid grid-cols-2 gap-1">
          {Object.entries(COSTS).map(([action, cost]) => (
            <div key={action} className="flex items-center justify-between text-[10px]">
              <span className="text-muted capitalize">{action}</span>
              <span className="text-dark font-semibold">{cost}cr</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Helper to notify all CreditsDisplay components after deduction
export function refreshCredits() {
  window.dispatchEvent(new Event('ripple-credits-changed'));
}
