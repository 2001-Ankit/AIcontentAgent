import { useState, useEffect, useRef } from 'react';
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiX } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';

// ── Constants ─────────────────────────────────────────────────────────────────

const GRAD = 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)';

const PLATFORMS = [
  { name: 'Instagram', color: '#E1306C',  Icon: SiInstagram },
  { name: 'TikTok',    color: '#69C9D0',  Icon: SiTiktok    },
  { name: 'YouTube',   color: '#FF0000',  Icon: SiYoutube   },
  { name: 'LinkedIn',  color: '#0A66C2',  Icon: FaLinkedin  },
  { name: 'Facebook',  color: '#1877F2',  Icon: SiFacebook  },
  { name: 'X',         color: '#ffffff',  Icon: SiX         },
];

const FEATURES = [
  {
    icon: '✨',
    title: 'AI Content Generation',
    desc: 'Describe any idea in one sentence. Our AI writes 3 caption styles, platform adaptations, and hashtag sets in seconds.',
    tag: '3 caption styles',
  },
  {
    icon: '🖼️',
    title: 'Free Image Generation',
    desc: 'Every post gets a unique AI-generated image. No API key. No cost. Regenerate with one click.',
    tag: 'Unlimited & free',
  },
  {
    icon: '🎬',
    title: 'Canvas Video Export',
    desc: 'Turn any image into an 8-second Ken Burns video — right in your browser. Download as WebM ready to upload.',
    tag: 'No video editor needed',
  },
  {
    icon: '#️⃣',
    title: 'Hashtag Strategy Lab',
    desc: 'Platform-optimised hashtag tiers: mega, large, medium, and niche — ordered for maximum algorithm reach.',
    tag: '30 tags for Instagram',
  },
  {
    icon: '🔗',
    title: 'UTM Link Tracking',
    desc: 'Every caption gets a unique UTM-tagged URL so you know exactly which post and platform drives traffic.',
    tag: 'Per-caption tracking',
  },
  {
    icon: '📅',
    title: 'Smart Scheduling',
    desc: 'Queue posts across all 6 platforms at AI-recommended peak times. Your calendar, automated.',
    tag: 'AI-optimal timing',
  },
];

const STEPS = [
  { num: '01', title: 'Describe your idea',        desc: 'Type one sentence about what you want to post. A launch, a tip, a story — anything.',      icon: '💡' },
  { num: '02', title: 'AI generates everything',    desc: 'Captions, hashtags, image, UTM links and 6 platform-specific versions — all in under 10s.', icon: '⚡' },
  { num: '03', title: 'Review & customise',         desc: 'Pick your caption, regenerate the image, export a video, and preview on every platform.',   icon: '🎨' },
  { num: '04', title: 'Schedule to all platforms',  desc: 'Select your platforms, choose a time, and let Ripple handle the rest.',                      icon: '🚀' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',  role: 'Founder, StyleLoop',    text: 'I used to spend 3 hours writing captions and finding hashtags. Ripple cuts it to 5 minutes. The UTM tracking alone changed how I measure ROI.',  avatar: '👩‍💻' },
  { name: 'Marcus L.', role: 'Content Creator',        text: 'The free image generation is insane. I get studio-quality visuals for every post with zero design skills.',                                         avatar: '🎙️' },
  { name: 'Asel K.',   role: 'Social Media Manager',   text: 'Managing 4 client accounts is now actually possible solo. The calendar view and multi-platform scheduling saved my business.',                     avatar: '📊' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function GradientText({ children, className = '' }) {
  return (
    <span
      className={className}
      style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
    >
      {children}
    </span>
  );
}

function Orb({ style }) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
      style={style}
    />
  );
}

// Animated typing demo
const DEMO_PROMPTS = [
  'I just hit 10K followers on TikTok 🎉',
  'My morning routine that doubled my productivity',
  'Behind-the-scenes of my product launch',
  'Top 5 tools every solopreneur needs in 2025',
];

function TypingDemo() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | pause | deleting
  const charRef = useRef(0);

  useEffect(() => {
    const current = DEMO_PROMPTS[promptIdx];
    let timer;

    if (phase === 'typing') {
      if (charRef.current < current.length) {
        timer = setTimeout(() => {
          setDisplayed(current.slice(0, charRef.current + 1));
          charRef.current += 1;
        }, 45);
      } else {
        timer = setTimeout(() => setPhase('pause'), 1800);
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => setPhase('deleting'), 400);
    } else {
      if (charRef.current > 0) {
        timer = setTimeout(() => {
          charRef.current -= 1;
          setDisplayed(current.slice(0, charRef.current));
        }, 22);
      } else {
        const next = (promptIdx + 1) % DEMO_PROMPTS.length;
        setPromptIdx(next);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [phase, displayed, promptIdx]);

  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
      <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">Your content idea</p>
      <p className="text-white text-[15px] font-medium min-h-[28px]">
        {displayed}
        <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
      </p>
      <div className="mt-4 flex gap-2 flex-wrap">
        {['Instagram', 'TikTok', 'YouTube', '+ 3 more'].map(p => (
          <span
            key={p}
            className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70"
          >
            {p}
          </span>
        ))}
      </div>
      <button
        className="mt-4 w-full py-2.5 rounded-xl text-[13px] font-bold text-white"
        style={{ background: GRAD }}
      >
        ✨ Generate Content
      </button>
    </div>
  );
}

// Mock output card
function MockOutput() {
  return (
    <div className="space-y-2.5">
      {[
        { tone: 'Bold hook',  text: 'POV: you just discovered the content shortcut everyone was gatekeeping 🤯', reach: 'High' },
        { tone: 'Storytime',  text: 'We let AI run our content for 30 days. Reach jumped 312%.',               reach: 'Medium' },
        { tone: 'Punchy CTA', text: 'Stop scrolling. The only posting workflow you\'ll ever need. 🔥',           reach: 'High' },
      ].map((item, i) => (
        <div
          key={i}
          className={`p-3.5 rounded-xl border transition-all ${i === 0 ? 'border-purple-400/60 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">{item.tone}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.reach === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {item.reach} reach
            </span>
          </div>
          <p className="text-white/80 text-[12px] leading-snug">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

// Floating platform badge
function PlatformBadge({ platform, style }) {
  const { Icon, color } = platform;
  return (
    <div
      className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[12px] font-semibold shadow-lg"
      style={style}
    >
      <Icon size={14} style={{ color }} />
      <span>{platform.name}</span>
    </div>
  );
}

// Animated counter
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = to / 40;
        const timer = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(timer); }
          else setVal(Math.round(start));
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Main landing page ─────────────────────────────────────────────────────────

export default function LandingPage({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0812] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0812]/90 backdrop-blur-xl py-3' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GRAD }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="3.5" />
              </svg>
            </div>
            <span className="font-bold text-[16px] tracking-tight">
              Ripple
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle" style={{ background: GRAD }}>AUTO</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-white/60">
            {['Features', 'How it works', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onEnter} className="text-[13px] font-semibold text-white/70 hover:text-white transition-colors hidden sm:block">
              Sign in
            </button>
            <button
              onClick={onEnter}
              className="text-[13px] font-bold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: GRAD }}
            >
              Start free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background orbs */}
        <Orb style={{ width: 600, height: 600, top: -200, left: -200, background: '#A855F7' }} />
        <Orb style={{ width: 500, height: 500, bottom: -100, right: -100, background: '#FF3D81' }} />
        <Orb style={{ width: 300, height: 300, top: '30%', left: '40%', background: '#6366F1' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-semibold mb-6"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Free to start · 100 credits included
              </div>

              <h1 className="text-[48px] sm:text-[58px] font-black leading-[1.06] tracking-tight mb-6">
                Create viral content.{' '}
                <br />
                <GradientText>Schedule everything.</GradientText>
                <br />
                Grow on autopilot.
              </h1>

              <p className="text-white/60 text-[17px] leading-relaxed mb-8 max-w-lg">
                One sentence becomes AI-written captions, platform-optimised hashtags, a stunning image, and a 6-platform posting schedule — in under 10 seconds.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={onEnter}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
                  style={{ background: GRAD }}
                >
                  Start for free
                  <span className="text-white/60 text-[12px] font-normal">— 100 credits</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  See how it works
                </a>
              </div>

              {/* Social trust */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['👩‍💻', '🧑‍🎤', '👨‍💼', '👩‍🎨', '🧑‍💻'].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0812] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 text-sm">{'★★★★★'}</div>
                  <p className="text-white/40 text-[12px] mt-0.5">Loved by 10K+ creators</p>
                </div>
              </div>
            </div>

            {/* Right — live demo */}
            <div className="relative">
              {/* Floating platform badges */}
              <PlatformBadge platform={PLATFORMS[0]} style={{ top: -20, right: 40, animation: 'float 3s ease-in-out infinite' }} />
              <PlatformBadge platform={PLATFORMS[1]} style={{ top: 60, left: -30, animation: 'float 3.5s ease-in-out infinite 0.5s' }} />
              <PlatformBadge platform={PLATFORMS[2]} style={{ bottom: 80, right: -20, animation: 'float 4s ease-in-out infinite 1s' }} />
              <PlatformBadge platform={PLATFORMS[3]} style={{ bottom: 10, left: 20, animation: 'float 3.2s ease-in-out infinite 1.5s' }} />

              <div
                className="rounded-3xl border border-white/10 p-5 space-y-4"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
              >
                <TypingDemo />
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">Generated captions</p>
                  <MockOutput />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 6,    suffix: '',    label: 'Platforms supported' },
            { value: 10,   suffix: 's',   label: 'Avg. generation time' },
            { value: 100,  suffix: '%',   label: 'Free to start' },
            { value: 10000, suffix: '+',  label: 'Creators using Ripple' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-[32px] font-black" style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Counter to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-white/40 text-[12.5px] mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 relative">
        <Orb style={{ width: 500, height: 500, top: '20%', right: -200, background: '#6366F1' }} />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everything included, free</p>
            <h2 className="text-[38px] sm:text-[46px] font-black leading-tight">
              One tool. Every platform.
              <br />
              <GradientText>Zero friction.</GradientText>
            </h2>
            <p className="text-white/50 text-[16px] mt-4 max-w-xl mx-auto">
              Everything you need to turn an idea into scheduled posts across all 6 major platforms — no subscriptions required to start.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative p-[1.5px] rounded-2xl cursor-default overflow-hidden"
              >
                {/* Static border (non-hover) */}
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Spinning gradient border — activates on hover */}
                <div
                  className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    width: '200%', height: '200%',
                    top: '-50%', left: '-50%',
                    background: 'conic-gradient(from 0deg, transparent 50%, #FF3D81 60%, #A855F7 75%, #6366F1 90%, transparent)',
                    animation: 'borderSpin 2.5s linear infinite',
                  }}
                />

                {/* Card inner */}
                <div
                  className="relative p-6 rounded-[14px] h-full transition-all duration-300"
                  style={{ background: 'rgba(10,8,18,0.97)', backdropFilter: 'blur(10px)' }}
                >
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-[16px] font-bold mb-2">{f.title}</h3>
                  <p className="text-white/50 text-[13px] leading-relaxed mb-4">{f.desc}</p>
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC' }}
                  >
                    {f.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 relative">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(168,85,247,0.15), transparent)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-widest text-purple-400 mb-3">Simple 4-step flow</p>
            <h2 className="text-[38px] sm:text-[46px] font-black">
              From idea to posted
              <br />
              <GradientText>in under a minute.</GradientText>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative group">
                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px z-10" style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.4), transparent)' }} />
                )}

                {/* Animated border wrapper */}
                <div className="relative p-[1.5px] rounded-2xl overflow-hidden h-full">
                  {/* Static border */}
                  <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }} />

                  {/* Spinning gradient border */}
                  <div
                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      width: '200%', height: '200%',
                      top: '-50%', left: '-50%',
                      background: 'conic-gradient(from 0deg, transparent 50%, #A855F7 65%, #6366F1 80%, #FF3D81 95%, transparent)',
                      animation: 'borderSpin 3s linear infinite',
                    }}
                  />

                  {/* Card inner */}
                  <div
                    className="relative p-6 rounded-[14px] h-full"
                    style={{ background: 'rgba(10,8,18,0.97)' }}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <span className="text-3xl">{step.icon}</span>
                      <span className="text-[13px] font-black text-white/15">{step.num}</span>
                    </div>
                    <h3 className="text-[15px] font-bold mb-2 leading-snug">{step.title}</h3>
                    <p className="text-white/45 text-[12.5px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold text-white transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
              style={{ background: GRAD }}
            >
              Try it now — it's free →
            </button>
          </div>
        </div>
      </section>

      {/* ── Platform showcase ── */}
      <section className="py-12">
        <div className="text-center mb-8">
          <p className="text-white/40 text-[13px] font-semibold uppercase tracking-widest">Works with every major platform</p>
        </div>
        <div className="max-w-md mx-auto overflow-hidden">
          <div className="flex w-max animate-[marquee_8s_linear_infinite] hover:[animation-play-state:paused]" style={{ willChange: 'transform' }}>
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-center mx-4 w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex-shrink-0"
              >
                <p.Icon size={24} style={{ color: p.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 relative">
        <Orb style={{ width: 400, height: 400, bottom: 0, left: -100, background: '#FF3D81' }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-[38px] font-black">
              Creators <GradientText>love it.</GradientText>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="group relative p-[1.5px] rounded-2xl overflow-hidden">
                {/* Static border */}
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Spinning gradient border */}
                <div
                  className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    width: '200%', height: '200%',
                    top: '-50%', left: '-50%',
                    background: 'conic-gradient(from 0deg, transparent 50%, #FF3D81 63%, #A855F7 78%, #6366F1 93%, transparent)',
                    animation: 'borderSpin 2s linear infinite',
                  }}
                />

                {/* Card inner */}
                <div
                  className="relative p-6 rounded-[14px] h-full"
                  style={{ background: 'rgba(10,8,18,0.97)' }}
                >
                  <div className="flex text-yellow-400 text-sm mb-4">{'★★★★★'}</div>
                  <p className="text-white/70 text-[13.5px] leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">{t.avatar}</div>
                    <div>
                      <p className="text-[13px] font-bold">{t.name}</p>
                      <p className="text-[11px] text-white/40">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #A855F7, transparent)' }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold uppercase tracking-widest text-purple-400 mb-3">Pricing</p>
            <h2 className="text-[38px] sm:text-[46px] font-black">
              Start free.
              <GradientText> Scale when ready.</GradientText>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Free',
                price: '$0',
                sub: 'forever',
                highlight: false,
                features: ['100 credits on signup', '+50 with email', '+5 daily bonus', 'AI caption generation', 'Free image generation', 'Canvas video export', 'Platform previews', 'Hashtag strategy', 'UTM link tracking'],
                cta: 'Start for free',
              },
              {
                name: 'Pro',
                price: '$9',
                sub: '/month',
                highlight: true,
                features: ['500 credits/month', 'Auto-post to all platforms', 'Remove watermark', '30-day bulk scheduling', 'Custom brand voice', 'Priority AI (2× faster)', '2 team seats', 'Advanced analytics'],
                cta: 'Coming soon',
              },
              {
                name: 'Business',
                price: '$29',
                sub: '/month',
                highlight: false,
                features: ['Unlimited credits', '10 team seats', 'API access', 'White-label reports', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
                cta: 'Coming soon',
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border transition-all ${plan.highlight ? 'border-purple-500/60 scale-[1.02]' : 'border-white/10'}`}
                style={{ background: plan.highlight ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)' }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full text-white" style={{ background: GRAD }}>
                    Most popular
                  </div>
                )}
                <p className="text-[14px] font-bold text-white/60 mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-black">{plan.price}</span>
                  <span className="text-white/40 text-[13px] mb-2">{plan.sub}</span>
                </div>
                <div className={`h-px mb-5 ${plan.highlight ? 'opacity-30' : 'opacity-10'} bg-white`} />
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px] text-white/70">
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={plan.cta === 'Start for free' ? onEnter : undefined}
                  className={`w-full py-3 rounded-xl text-[13px] font-bold transition-all ${
                    plan.highlight
                      ? 'text-white hover:opacity-90'
                      : plan.cta === 'Start for free'
                      ? 'border border-white/20 hover:bg-white/10'
                      : 'border border-white/10 opacity-50 cursor-default'
                  }`}
                  style={plan.highlight ? { background: GRAD } : {}}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: GRAD }}
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
            <div className="relative">
              <h2 className="text-[36px] sm:text-[44px] font-black mb-4 leading-tight">
                Your next viral post<br />starts right now.
              </h2>
              <p className="text-white/70 text-[15px] mb-8">100 free credits waiting. No credit card. No catch.</p>
              <button
                onClick={onEnter}
                className="bg-white text-[#A855F7] px-8 py-4 rounded-2xl text-[16px] font-black hover:scale-105 transition-all shadow-2xl active:scale-95"
              >
                Launch Ripple Autopilot →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full" style={{ background: GRAD }} />
            <span className="font-bold text-[14px]">Ripple Autopilot</span>
          </div>
          <p className="text-white/25 text-[12px]">© 2025 Ripple. Built by Mark · Free forever to start.</p>
          <div className="flex gap-5 text-[12.5px] text-white/40">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes borderSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
