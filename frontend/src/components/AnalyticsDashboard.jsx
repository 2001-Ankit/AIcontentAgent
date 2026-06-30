import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getCreditStore, getUsageStats, getUsageHistory } from '../lib/credits.js';

const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

const PLATFORM_COLORS = {
  instagram: '#E1306C', tiktok: '#69C9D0', facebook: '#1877F2',
  youtube: '#FF0000', x: '#1DA1F2', linkedin: '#0A66C2',
};

const REACH_ESTIMATES = {
  instagram: { base: 1200, perTag: 85 },
  tiktok:    { base: 3500, perTag: 220 },
  facebook:  { base: 800,  perTag: 40  },
  youtube:   { base: 500,  perTag: 60  },
  x:         { base: 600,  perTag: 30  },
  linkedin:  { base: 900,  perTag: 110 },
};

function StatCard({ label, value, sub, gradient }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{label}</p>
      <p
        className="text-[26px] font-bold leading-none mb-0.5"
        style={gradient ? { background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
      >
        {value}
      </p>
      {sub && <p className="text-[11.5px] text-muted">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-dark font-medium w-20 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-light rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color || GRADIENT }} />
      </div>
      <span className="text-[11.5px] font-bold text-dark w-6 text-right">{value}</span>
    </div>
  );
}

function RecentActivity({ events }) {
  if (!events.length) return <p className="text-muted text-[12.5px]">No activity yet.</p>;

  const icons = {
    autopilot: '🚀', caption: '✍️', image: '🖼️', video: '🎬',
    hashtag: '#', earn: '⚡',
  };

  return (
    <div className="space-y-2">
      {events.slice(-8).reverse().map((e, i) => (
        <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-border last:border-0">
          <span className="text-base">{icons[e.action] || icons[e.type] || '•'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] text-dark font-medium truncate">
              {e.type === 'earn' ? e.reason : `${e.action} — ${e.label || ''}`}
            </p>
            <p className="text-[10.5px] text-muted">
              {new Date(e.ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`text-[12px] font-bold ${e.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
            {e.type === 'earn' ? `+${e.amount}` : `-${e.cost}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReachEstimator({ posts }) {
  const byPlatform = useMemo(() => {
    const counts = {};
    posts.forEach(p => {
      const platforms = Array.isArray(p.platforms) ? p.platforms : [];
      platforms.forEach(pl => { counts[pl] = (counts[pl] || 0) + 1; });
    });
    return Object.entries(counts).map(([platform, count]) => {
      const est = REACH_ESTIMATES[platform] || { base: 500, perTag: 50 };
      return {
        platform,
        posts: count,
        estimatedReach: Math.round(est.base * count * (1 + Math.random() * 0.3)),
      };
    });
  }, [posts]);

  if (!byPlatform.length) {
    return <p className="text-muted text-[12.5px]">Schedule your first post to see reach estimates.</p>;
  }

  const maxReach = Math.max(...byPlatform.map(p => p.estimatedReach), 1);

  return (
    <div className="space-y-3">
      {byPlatform.map(({ platform, posts: count, estimatedReach }) => (
        <div key={platform} className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-dark capitalize">{platform}</span>
            <span className="text-muted">{count} post{count !== 1 ? 's' : ''} · est. {estimatedReach.toLocaleString()} reach</span>
          </div>
          <div className="h-2 bg-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(estimatedReach / maxReach) * 100}%`, background: PLATFORM_COLORS[platform] || GRADIENT }}
            />
          </div>
        </div>
      ))}
      <p className="text-[10.5px] text-muted pt-1">* Reach estimates are projections based on typical engagement rates. Actual results vary.</p>
    </div>
  );
}

// Freemium feature roadmap
const FREEMIUM_ROADMAP = [
  {
    tier: 'Free',
    color: 'text-green-600 bg-green-50 border-green-100',
    features: [
      '100 credits on signup',
      '+50 credits with email',
      '+5 daily login bonus',
      'Caption Lab (3 credits each)',
      'AI image generation (5 credits)',
      'Canvas video export (2 credits)',
      'Full Autopilot (10 credits)',
      'Platform preview for all 6 platforms',
      'UTM link & hashtag generator',
      'Content calendar view',
      'Watermarked "Made with Ripple" videos',
    ],
  },
  {
    tier: 'Pro — $9/mo',
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    features: [
      '500 credits/month',
      'Auto-post to real platforms (OAuth)',
      'Remove Ripple watermark',
      'Bulk scheduling (30-day queue)',
      'Custom brand voice & tone presets',
      'Advanced hashtag analytics',
      'Priority AI (2× faster)',
      '2 team seats',
    ],
  },
  {
    tier: 'Business — $29/mo',
    color: 'text-orange-600 bg-orange-50 border-orange-100',
    features: [
      'Unlimited credits',
      '10 team seats',
      'API access',
      'White-label reports',
      'Advanced analytics & insights',
      'Custom integrations',
      'Dedicated support',
    ],
  },
];

export default function AnalyticsDashboard() {
  const { state, dispatch } = useApp();
  const creditStore = getCreditStore();
  const usageStats = getUsageStats();
  const history = getUsageHistory();

  const posts = state.scheduledPosts || [];
  const totalPosts = posts.length;
  const postedCount = posts.filter(p => p.status === 'posted').length;
  const pendingCount = posts.filter(p => p.status === 'pending').length;

  const actionCounts = usageStats.byAction;
  const maxAction = Math.max(...Object.values(actionCounts), 1);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h2 className="text-[20px] font-bold text-dark">Analytics</h2>
        <p className="text-muted text-[13px] mt-0.5">Your usage, reach estimates, and growth roadmap.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Credits left" value={creditStore.credits} sub={`of ${creditStore.totalEarned} earned`} gradient />
        <StatCard label="Total posts" value={totalPosts} sub={`${postedCount} published`} />
        <StatCard label="Pending" value={pendingCount} sub="scheduled" />
        <StatCard label="Credits spent" value={creditStore.totalSpent || 0} sub="all time" />
      </div>

      {/* Reach estimates */}
      <div className="card p-5">
        <h3 className="text-[14px] font-bold text-dark mb-4">Estimated Reach by Platform</h3>
        <ReachEstimator posts={posts} />
      </div>

      {/* Usage breakdown */}
      {Object.keys(actionCounts).length > 0 && (
        <div className="card p-5">
          <h3 className="text-[14px] font-bold text-dark mb-4">Usage Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(actionCounts).map(([action, count]) => (
              <MiniBar key={action} label={action} value={count} max={maxAction} color={GRADIENT} />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card p-5">
        <h3 className="text-[14px] font-bold text-dark mb-4">Recent Activity</h3>
        <RecentActivity events={history} />
      </div>

      {/* Freemium roadmap */}
      <div>
        <h3 className="text-[16px] font-bold text-dark mb-1">Plans & Pricing</h3>
        <p className="text-muted text-[13px] mb-4">Start free. Upgrade when you're ready.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {FREEMIUM_ROADMAP.map(plan => (
            <div key={plan.tier} className={`rounded-2xl border p-4 ${plan.color}`}>
              <p className="text-[12px] font-bold mb-3">{plan.tier}</p>
              <ul className="space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="text-[11.5px] flex items-start gap-1.5">
                    <span className="mt-0.5 flex-shrink-0">✓</span>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              {plan.tier !== 'Free' && (
                <button className="mt-4 w-full py-2 rounded-xl text-[12px] font-bold border border-current opacity-70 hover:opacity-100 transition-opacity">
                  Coming soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Growth hacks for free credits */}
      <div className="card p-5">
        <h3 className="text-[14px] font-bold text-dark mb-3">Earn More Free Credits</h3>
        <div className="space-y-2">
          {[
            { action: 'Sign up with email', reward: '+50', done: !!creditStore.signupBonusClaimed },
            { action: 'Daily login bonus', reward: '+5/day', done: false },
            { action: 'Share a post (coming soon)', reward: '+10', done: false },
            { action: 'Refer a friend (coming soon)', reward: '+25', done: false },
          ].map(item => (
            <div key={item.action} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'border-green-500 bg-green-50' : 'border-border'}`}>
                {item.done && <span className="text-green-500 text-[10px] font-bold">✓</span>}
              </div>
              <span className={`text-[12.5px] flex-1 ${item.done ? 'text-muted line-through' : 'text-dark'}`}>{item.action}</span>
              <span className="text-[12px] font-bold text-green-600">{item.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
