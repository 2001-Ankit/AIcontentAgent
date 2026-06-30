import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import PromptStep from './steps/PromptStep.jsx';
import GenerateStep from './steps/GenerateStep.jsx';
import ReviewStep from './steps/ReviewStep.jsx';
import ScheduleStep from './steps/ScheduleStep.jsx';
import CalendarView from './components/CalendarView.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import CaptionLabStep from './steps/CaptionLabStep.jsx';
import { getScheduledPosts } from './lib/api.js';

const ENTERED_KEY = 'ripple_entered';

// ── Guards ────────────────────────────────────────────────────────────────────

function RequireEntered() {
  const entered = !!localStorage.getItem(ENTERED_KEY);
  return entered ? <Outlet /> : <Navigate to="/" replace />;
}

// ── Create flow (sub-steps handled by AppContext.state.step) ──────────────────

function CreateFlow() {
  const { state } = useApp();
  const views = {
    prompt:     <PromptStep />,
    generating: <GenerateStep />,
    review:     <ReviewStep />,
    schedule:   <ScheduleStep />,
    done:       <ScheduleStep done />,
  };
  return (
    <div key={state.step} className="animate-slide-up h-full">
      {views[state.step] || <PromptStep />}
    </div>
  );
}

// ── Dashboard shell (sidebar + scrollable content area) ───────────────────────

function DashboardShell() {
  const { dispatch } = useApp();

  useEffect(() => {
    getScheduledPosts()
      .then(posts => dispatch({ type: 'SET_SCHEDULED_POSTS', posts }))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-[#F5EFE4] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// ── Centred page wrapper ──────────────────────────────────────────────────────

function Centred({ children }) {
  return (
    <div className="flex items-start justify-center p-6 pt-8 min-h-full">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}

// ── Landing page — always visible at / ───────────────────────────────────────

function Landing() {
  const navigate = useNavigate();

  function handleEnter() {
    localStorage.setItem(ENTERED_KEY, '1');
    navigate('/app/create');
  }

  return <LandingPage onEnter={handleEnter} />;
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      {/* Protected dashboard */}
      <Route element={<RequireEntered />}>
        <Route path="/app" element={<DashboardShell />}>
          <Route index element={<Navigate to="/app/create" replace />} />
          <Route path="create" element={<Centred><CreateFlow /></Centred>} />
          <Route path="captionlab" element={<Centred><CaptionLabStep /></Centred>} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
