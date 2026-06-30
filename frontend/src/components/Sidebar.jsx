import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import CreditsDisplay from './CreditsDisplay.jsx';

const GRADIENT = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

const NAV_ITEMS = [
  {
    to: '/app/create',
    label: 'Autopilot',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    to: '/app/captionlab',
    label: 'Caption Lab',
    badge: 'NEW',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    to: '/app/calendar',
    label: 'Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/app/analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const isCreateFlow = [
    'generating', 'review', 'schedule', 'done',
  ].includes(state.step);

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col bg-[#FAF6EE] border-r border-border h-full">
      {/* Logo — click goes to landing */}
      <button
        onClick={() => navigate('/app/create')}
        className="px-4 pt-5 pb-4 flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: GRADIENT }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="3.5" />
          </svg>
        </div>
        <span className="font-bold text-dark text-[14.5px] tracking-tight">
          {state.brandName}
          <span
            className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle text-white"
            style={{ background: GRADIENT }}
          >
            Auto
          </span>
        </span>
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-light text-dark'
                  : 'text-muted hover:bg-light/60 hover:text-dark'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-dark' : 'text-muted/70'}>
                  {item.icon}
                </span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* New post shortcut when deep in the create flow */}
      {isCreateFlow && (
        <div className="px-2.5 py-2">
          <button
            onClick={() => {
              dispatch({ type: 'RESET' });
              navigate('/app/create');
            }}
            className="w-full btn-primary text-center text-[12.5px] py-2"
          >
            + New Post
          </button>
        </div>
      )}

      <CreditsDisplay />
    </aside>
  );
}
