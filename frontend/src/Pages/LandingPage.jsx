import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#110211] text-white min-h-screen overflow-x-hidden font-sans">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-16 py-5 transition-all duration-300 ${
        scrolled ? 'bg-[#080C14]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <h1 className="text-3xl text-purple-700 font-semibold mb-4">Schedule Sync</h1> 
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
          <a href="#how" className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
          <a href="#roles" className="text-sm text-white/50 hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">

        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,92,252,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,92,252,0.05)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]" />

        {/* Purple glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-2 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-sm text-white/70 tracking-wide">AI-Powered Teachers Scheduling</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold leading-[1.05] tracking-tighter mb-6">
            Never leave a
            <br />
            <span className="text-purple-400 italic font-light"> class uncovered</span>
            <br />
            again.
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-12 leading-relaxed font-light">
            ScheduleSync automates teacher substitutions with AI. When someone goes on leave, the right replacement is suggested instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-base font-medium transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              Start for free →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white px-8 py-4 rounded-xl text-base transition-all"
            >
              See how it works
            </button>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-white/25 tracking-wide">
            Trusted by schools across India · No credit card required
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-xs tracking-widest text-white/50 uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { num: '< 2s',  label: 'AI suggestion time' },
            { num: '100%',  label: 'Class coverage rate' },
            { num: '0',     label: 'Manual phone calls' },
            { num: '24/7',  label: 'Dashboard access' },
          ].map((stat, i) => (
            <div key={i} className={`text-center py-10 px-6 ${i < 3 ? 'border-r border-white/5' : ''}`}>
              <span className="block text-4xl font-bold text-white tracking-tight">{stat.num}</span>
              <span className="text-xs text-white/35 mt-2 block tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-purple-400 mb-4 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Everything a school/Universities needs
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto font-light">
            Built for admins and teachers — simple, fast, intelligent.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Suggestions',
              desc: 'Gemini AI ranks free teachers by subject match, workload, and availability. Best pick selected automatically.',
              accent: 'border-purple-500/20 hover:border-purple-500/40',
              glow: 'group-hover:bg-purple-500/5',
            },
            {
              icon: '⚡',
              title: 'Instant Leave Approvals',
              desc: 'Teachers apply for leave, admin approves in one click. Adjustment flow kicks off automatically.',
              accent: 'border-blue-500/20 hover:border-blue-500/40',
              glow: 'group-hover:bg-blue-500/5',
            },
            {
              icon: '📋',
              title: 'Real-time Dashboard',
              desc: 'Admins see who\'s on leave, pending adjustments, and confirmed substitutions — all in one view.',
              accent: 'border-emerald-500/20 hover:border-emerald-500/40',
              glow: 'group-hover:bg-emerald-500/5',
            },
            {
              icon: '🔔',
              title: 'Teacher Notifications',
              desc: 'Substitute teachers receive instant requests and can accept or reject directly from their dashboard.',
              accent: 'border-amber-500/20 hover:border-amber-500/40',
              glow: 'group-hover:bg-amber-500/5',
            },
            {
              icon: '📅',
              title: 'Timetable Aware',
              desc: 'System knows every teacher\'s schedule. Only truly free teachers are suggested — zero conflicts.',
              accent: 'border-rose-500/20 hover:border-rose-500/40',
              glow: 'group-hover:bg-rose-500/5',
            },
            {
              icon: '📊',
              title: 'Workload Tracking',
              desc: 'Tracks how many adjustments each teacher has done this week. AI prioritises less burdened staff.',
              accent: 'border-cyan-500/20 hover:border-cyan-500/40',
              glow: 'group-hover:bg-cyan-500/5',
            },
          ].map((f, i) => (
            <div key={i} className={`group relative bg-white/[0.03] border ${f.accent} rounded-2xl p-7 transition-all duration-300 cursor-default overflow-hidden`}>
              <div className={`absolute inset-0 ${f.glow} transition-all duration-300`} />
              <div className="relative z-10">
                <span className="text-3xl mb-5 block">{f.icon}</span>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-y border-white/5 bg-white/[0.015] py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[3px] uppercase text-purple-400 mb-4 block">How it works</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Three steps to full coverage
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Teacher applies for leave', desc: 'Teacher submits a leave request with reason, dates, and subject details from their dashboard.' },
              { step: '02', title: 'Admin approves & AI suggests', desc: 'Admin approves the leave. AI instantly ranks available free teachers by best fit for each period.' },
              { step: '03', title: 'Substitute confirms', desc: 'Admin sends the request. Substitute teacher sees it on their dashboard and accepts or rejects.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                )}
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 h-full">
                  <span className="text-5xl font-bold text-white/8 block mb-4 tracking-tighter">{step.step}</span>
                  <h3 className="text-base font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles section ── */}
      <section id="roles" className="max-w-6xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-purple-400 mb-4 block">For Schools</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Built for two roles</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Admin card */}
          <div className="bg-gradient-to-br from-purple-600/10 to-purple-900/5 border border-purple-500/20 rounded-3xl p-10">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6">👨‍💼</div>
            <h3 className="text-2xl font-bold mb-3">For Admins</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-8 font-light">
              Full visibility over your school's schedule. Approve leaves, trigger AI suggestions, confirm adjustments — all in under a minute.
            </p>
            <ul className="space-y-3">
              {[
                'Approve or reject leave requests',
                'AI suggests best substitute teachers',
                'Track pending & confirmed adjustments',
                'See today\'s full schedule at a glance',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Teacher card */}
          <div className="bg-gradient-to-br from-blue-600/10 to-blue-900/5 border border-blue-500/20 rounded-3xl p-10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6">👩‍🏫</div>
            <h3 className="text-2xl font-bold mb-3">For Teachers</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-8 font-light">
              Apply for leave, manage your schedule, and respond to adjustment requests — all from a clean personal dashboard.
            </p>
            <ul className="space-y-3">
              {[
                'Apply for leave with one form',
                'See today\'s lectures and schedule',
                'Accept or reject adjustment requests',
                'Track upcoming covered classes',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 pb-28">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-600/20 via-purple-900/10 to-transparent border border-purple-500/20 rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,92,252,0.15),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Ready to automate your
              <span className="text-purple-400 italic font-light"> scheduling?</span>
            </h2>
            <p className="text-white/40 text-lg mb-10 font-light">
              Join schools already using ScheduleSync to eliminate manual adjustment calls.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl text-base font-medium transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                Get started free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-16 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
           <h1 className="text-3xl text-purple-700 font-semibold mb-4">Schedule Sync</h1> 
          <p className="text-sm text-white/25">
            © 2026 ScheduleSync · Built for modern schools
          </p>
          <div className="flex gap-6">
            <a href="#features" className="text-sm text-white/30 hover:text-white/60 transition-colors">Features</a>
            <a href="#how" className="text-sm text-white/30 hover:text-white/60 transition-colors">How it works</a>
            <button onClick={() => navigate('/login')} className="text-sm text-white/30 hover:text-white/60 transition-colors">Login</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;