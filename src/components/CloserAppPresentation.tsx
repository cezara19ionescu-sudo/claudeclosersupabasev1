import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Shield, CreditCard, Clock, Check, Star,
  ArrowRight, ShieldCheck, Activity, GripVertical, MapPin
} from 'lucide-react';

/**
 * CloserAppPresentation
 * Full interactive presentation section for Closer landing page.
 * 
 * Enhanced version with Faucet animation, SOS Radar, and more.
 */

const CloserAppPresentation = ({ onCtaClick }: { onCtaClick?: () => void }) => {
  const [chatStep, setChatStep] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Ticker state
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const tickers = [
    { text: "Andrew M. booked an electrician in London 2 min ago", icon: "📍" },
    { text: "Sarah T. left 5 stars for Cleaning in Manchester", icon: "⭐" },
    { text: "12 new verified pros added today", icon: "🚀" },
    { text: "Maria solved a bathroom emergency in 18 minutes", icon: "💧" }
  ];

  // Before / After state
  const [sliderPos, setSliderPos] = useState(50);

  // Price Tabs state
  const [priceTab, setPriceTab] = useState('Plumber');
  const prices: Record<string, string> = {
    'Plumber': 'approx. £40 - £80 / standard job',
    'Cleaning': 'approx. £50 - £100 / 2 bed apt',
    'Electrician': 'approx. £50 - £90 / diagnosis & repair'
  };

  // State for SOS section (Radar)
  const [sosStep, setSosStep] = useState(0);
  const [problemBubbleIdx, setProblemBubbleIdx] = useState(0);

  const problemBubbles = [
    { text: 'HELP!', className: 'left-[6%] top-[14%] -rotate-12 bg-[#FF8A5B] scale-110' },
    { text: 'SOS!', className: 'right-[6%] top-[22%] rotate-12 bg-[#FF6B35] scale-125' },
    { text: 'PANIC!', className: 'left-[12%] bottom-[18%] rotate-6 bg-[#ef4444] scale-110' },
    { text: 'HELP!', className: 'right-[12%] bottom-[14%] -rotate-6 bg-[#FF8A5B] scale-115' },
    { text: 'SOS!', className: 'left-1/2 top-[7%] -translate-x-1/2 rotate-3 bg-[#FF6B35] scale-125' },
    { text: 'PANIC!', className: 'left-1/2 bottom-[6%] -translate-x-1/2 -rotate-3 bg-[#ef4444] scale-110' },
    { text: 'HELP!', className: 'left-[28%] top-[35%] -rotate-3 bg-[#FF8A5B] scale-105' },
    { text: 'SOS!', className: 'right-[24%] top-[48%] rotate-6 bg-[#FF6B35] scale-105' },
    { text: 'PANIC!', className: 'left-[4%] top-[50%] rotate-12 bg-[#ef4444] scale-110' },
    { text: 'HELP!', className: 'right-[4%] top-[8%] -rotate-12 bg-[#FF8A5B] scale-105' },
  ];

  useEffect(() => {
    const sosTimer = setInterval(() => {
      setSosStep((prev) => (prev >= 2 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(sosTimer);
  }, []);

  useEffect(() => {
    const bubbleTimer = setInterval(() => {
      setProblemBubbleIdx((prev) => (prev + 1) % problemBubbles.length);
    }, 520);
    return () => clearInterval(bubbleTimer);
  }, [problemBubbles.length]);

  const testimonials = [
    {
      name: 'Maria P.',
      location: 'London · Home repair',
      initials: 'MP',
      color: '#DB2777',
      text: '"I had water in the bathroom at 11 PM. I pressed Help Now and the plumber was at the door in 18 minutes. Seriously."'
    },
    {
      name: 'John M.',
      location: 'Manchester · Electrical',
      initials: 'JM',
      color: '#2563EB',
      text: '"First time I found a reliable electrician who explains everything clearly. Closer saved my day."'
    },
    {
      name: 'Sarah D.',
      location: 'London · Beauty',
      initials: 'SD',
      color: '#7C3AED',
      text: '"I\'m a nail tech, Closer helped me get 40 clients in the first month. I work on my own schedule."'
    },
    {
      name: 'George R.',
      location: 'Luton · Plumbing',
      initials: 'GR',
      color: '#059669',
      text: '"I chose Closer because I don\'t pay per lead like on other platforms. I only pay when I make money. Fair."'
    }
  ];

  // Ticker auto-play
  useEffect(() => {
    const int = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIdx(p => (p + 1) % tickers.length);
        setTickerVisible(true);
      }, 500);
    }, 4500);
    return () => clearInterval(int);
  }, [tickers.length]);

  // Chat demo auto-play
  useEffect(() => {
    if (!statsVisible) return;
    const sequence = [
      { delay: 800, step: 1 },
      { delay: 2200, step: 2 },
      { delay: 3800, step: 3 },
      { delay: 8000, step: 0 }
    ];
    const timers = sequence.map(({ delay, step }) =>
      setTimeout(() => setChatStep(step), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [statsVisible, chatStep === 0]);

  // Testimonial auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const glassSection = "relative overflow-hidden rounded-[28px] p-5 mb-4 bg-white/64 backdrop-blur-xl border border-white/75 shadow-[0_22px_46px_-34px_rgba(15,23,42,0.82)]";
  const glassPanel = "bg-white/52 backdrop-blur-md rounded-2xl border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]";
  const eyebrow = "text-[10px] font-black text-[#1a4d4d] tracking-[0.16em] uppercase mb-1";
  const sectionTitle = "text-[20px] font-black text-slate-950 leading-tight tracking-tight";
  const sectionCopy = "text-[12px] text-slate-500 font-semibold leading-relaxed";

  return (
    <div ref={sectionRef} className="w-full">
      <style>{`
        @keyframes closer-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes closer-typing-dot {
          0%, 60%, 100% { opacity: 1; transform: translateY(0); }
          30% { opacity: 0.3; transform: translateY(-3px); }
        }
        @keyframes closer-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(75, 255, 200, 0.6); }
          50%      { box-shadow: 0 0 0 8px rgba(75, 255, 200, 0); }
        }
        @keyframes closer-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes closer-slide-in-msg {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes closer-counter-pop {
          0%   { transform: scale(0.8); opacity: 0; }
          50%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .closer-typing span {
          animation: closer-typing-dot 1.2s ease-in-out infinite;
        }
        .closer-typing span:nth-child(2) { animation-delay: 0.15s; }
        .closer-typing span:nth-child(3) { animation-delay: 0.3s; }
        
        .before-after-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 100%;
          background: transparent;
          outline: none;
          margin: 0;
          cursor: ew-resize;
        }
        .before-after-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 2px;
          height: 100vh;
          background: transparent;
          cursor: ew-resize;
        }
        @keyframes closer-radar {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-radar {
          animation: closer-radar 2s infinite ease-out;
        }
        .animate-radar-delay {
          animation: closer-radar 2s infinite ease-out;
          animation-delay: 1s;
        }

        @keyframes closer-chaotic-pop {
          0%, 10% { transform: scale(0); opacity: 0; }
          15%, 45% { transform: scale(3); opacity: 1; }
          50%, 100% { transform: scale(0); opacity: 0; }
        }
        @keyframes closer-help-card-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.55); filter: blur(5px); }
          16% { opacity: 1; transform: translateY(0) scale(1.18); filter: blur(0); }
          58% { opacity: 1; transform: translateY(-2px) scale(1.06); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-12px) scale(0.78); filter: blur(3px); }
        }
        .animate-chaotic { 
          animation: closer-chaotic-pop 4s infinite; 
          transform-box: fill-box;
          transform-origin: center;
        }
        .animate-help-card-pop {
          animation: closer-help-card-pop 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        @keyframes closer-flow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes closer-splash {
          0% { transform: scale(0.5); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: scale(1.6) translateY(-10px); opacity: 0; }
        }
        .animate-flow-fast { stroke-dasharray: 20 10; animation: closer-flow 0.25s linear infinite; }
        .animate-flow-med { stroke-dasharray: 15 15; animation: closer-flow 0.4s linear infinite; }
        .animate-flow-slow { stroke-dasharray: 30 10; animation: closer-flow 0.6s linear infinite; }
        .animate-splash { animation: closer-splash 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite; }
      `}</style>

      {/* TICKER SOCIAL PROOF */}
      <div className="bg-white/64 backdrop-blur-xl border border-white/75 rounded-full px-3 py-2 mb-4 flex items-center gap-2 overflow-hidden mx-auto w-fit max-w-full shadow-[0_14px_30px_-24px_rgba(15,23,42,0.8)]">
        <Activity className="w-3.5 h-3.5 text-[#1a4d4d] flex-shrink-0 animate-pulse" />
        <p 
          className={`text-[10px] sm:text-xs font-medium text-[#1a4d4d] truncate transition-opacity duration-500 ${tickerVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {tickers[tickerIdx].icon} {tickers[tickerIdx].text}
        </p>
      </div>

      {/* SECTION 1: LIVE AI CHAT DEMO */}
      <section className={glassSection}>
        <div className="absolute -top-16 -right-14 h-36 w-36 rounded-full bg-white/55 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-14 h-36 w-36 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />
        <p className={eyebrow}>
          HOW IT WORKS · LIVE DEMO
        </p>
        <h3 className={`${sectionTitle} mb-3`}>
          Describe. We find. Solved.
        </h3>

        <div className={`${glassPanel} p-3 min-h-[220px]`}>
          <p className="text-[9px] text-gray-500 tracking-wider font-medium mb-2">
            AI CHAT · LIVE
          </p>

          {chatStep >= 1 && (
            <div
              className="bg-[#1a4d4d] text-white px-3 py-2 rounded-2xl rounded-br-sm text-xs max-w-[80%] ml-auto"
              style={{ animation: 'closer-slide-in-msg 0.4s ease-out' }}
            >
              My bathroom sink is leaking badly
            </div>
          )}

          {chatStep >= 1 && chatStep < 2 && (
            <div
              className="bg-white border border-gray-200 px-3 py-2 rounded-2xl rounded-bl-sm mt-2 max-w-[60%]"
              style={{ animation: 'closer-slide-in-msg 0.4s ease-out' }}
            >
              <div className="closer-typing inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
              </div>
            </div>
          )}

          {chatStep >= 2 && (
            <div
              className="bg-white border border-gray-200 px-3 py-2 rounded-2xl rounded-bl-sm text-xs mt-2 max-w-[85%] text-gray-900"
              style={{ animation: 'closer-slide-in-msg 0.4s ease-out' }}
            >
              I found <b>3 plumbers available now</b>. The fastest is 12 mins away:
            </div>
          )}

          {chatStep >= 3 && (
            <div
              className="flex items-center gap-2.5 bg-white/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/75 mt-2 cursor-pointer hover:bg-white/85 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
              style={{ animation: 'closer-fade-up 0.5s ease-out both' }}
              onClick={onCtaClick}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #4bffc8, #1a4d4d)',
                  animation: 'closer-pulse-ring 2s ease-in-out infinite'
                }}
              >
                AC
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 flex items-center gap-1.5">
                  Alexandru C.
                  <svg className="w-3 h-3 text-blue-600 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6z" />
                    <path d="m9 12 2 2 4-4" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"
                    style={{ animation: 'closer-pulse-dot 1.5s ease-in-out infinite' }}
                  />
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <span className="text-yellow-500 tracking-wider">★★★★★</span>
                  <span>47 reviews · 12 min</span>
                </p>
              </div>
              <button className="bg-[#1a4d4d] text-white px-2.5 py-1.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                Book
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* PROBLEM (BURST PIPE ANIMATION) */}
      <section className={glassSection}>
        <div className="mb-4 text-center">
          <h3 className={`${sectionTitle} mb-1`}>
            Problems happen when you least expect them
          </h3>
          <p className={sectionCopy}>
            A burst pipe on a Sunday does not care about your schedule.
          </p>
        </div>

        <div className="relative w-full aspect-[16/9] rounded-[24px] overflow-hidden shadow-[0_18px_38px_-30px_rgba(15,23,42,0.65)] border border-white/75 bg-white/52 backdrop-blur-md flex items-center justify-center p-8">
          <div className="absolute inset-0 z-20 pointer-events-none">
            {problemBubbles.map((bubble, index) => (
              index === problemBubbleIdx && (
                <div
                  key={`${bubble.text}-${index}-${problemBubbleIdx}`}
                  className={`absolute ${bubble.className} animate-help-card-pop rounded-full px-4 py-2.5 text-[12px] font-black text-white shadow-2xl shadow-black/20 border border-white/25`}
                >
                  {bubble.text}
                </div>
              )
            ))}
          </div>

          <div className="w-full max-w-[280px] h-full flex items-center justify-center relative">
            <svg viewBox="0 0 240 220" fill="none" className="w-full h-full overflow-visible drop-shadow-2xl">
              <defs>
                <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="25%" stopColor="#f8fafc" />
                  <stop offset="75%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="metal-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(96, 165, 250, 0.4)" />
                  <stop offset="30%" stopColor="rgba(59, 130, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(37, 99, 235, 0.8)" />
                </linearGradient>
              </defs>

              {/* SHADOW */}
              <path d="M60 200 L95 200 L95 80 C95 40 105 25 130 25 L190 25 C210 25 215 45 215 65 L215 95 L165 95 L165 65 C165 45 155 40 135 40 L105 40 C95 40 95 45 95 60 L95 200 Z" fill="rgba(0,0,0,0.06)" transform="translate(10, 15)" filter="blur(6px)" />

              {/* Legacy SVG help bubbles disabled; HTML bubbles above appear one by one around the card. */}
              <g opacity="0">
                {/* POSITION: LEFT */}
                <g transform="translate(-100, 80) rotate(-15)" className="animate-chaotic" style={{ animationDelay: '0s' }}>
                  <rect width="60" height="25" rx="12.5" fill="#FF8A5B" />
                  <text x="30" y="16" fill="white" fontSize="8" fontWeight="black" textAnchor="middle">HELP!</text>
                </g>
                
                {/* POSITION: RIGHT */}
                <g transform="translate(280, 80) rotate(15)" className="animate-chaotic" style={{ animationDelay: '1s' }}>
                  <rect width="60" height="25" rx="12.5" fill="#FF6B35" />
                  <text x="30" y="16" fill="white" fontSize="8" fontWeight="black" textAnchor="middle">SOS!</text>
                </g>
                
                {/* POSITION: TOP */}
                <g transform="translate(100, -80) rotate(5)" className="animate-chaotic" style={{ animationDelay: '2s' }}>
                  <rect width="80" height="30" rx="15" fill="#FF8A5B" />
                  <text x="40" y="19" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">EMERGENCY</text>
                </g>
                
                {/* POSITION: BOTTOM */}
                <g transform="translate(100, 280) rotate(-5)" className="animate-chaotic" style={{ animationDelay: '3s' }}>
                  <rect width="70" height="25" rx="12.5" fill="#FF6B35" />
                  <text x="35" y="17" fill="white" fontSize="8" fontWeight="black" textAnchor="middle">FIX IT!</text>
                </g>

                {/* POSITION: CENTER (MASSIVE) */}
                <g transform="translate(90, 100) scale(1.2)" className="animate-chaotic" style={{ animationDelay: '1.5s' }}>
                  <rect width="100" height="40" rx="20" fill="#FF6B35" />
                  <text x="50" y="26" fill="white" fontSize="11" fontWeight="black" textAnchor="middle">NEED HELP!</text>
                   <path d="M50 40 L45 50 L55 40 Z" fill="#FF6B35" />
                </g>

                {/* EXTRA CORNERS */}
                <g transform="translate(-80, -40) rotate(-45)" className="animate-chaotic" style={{ animationDelay: '0.5s' }}>
                  <rect width="50" height="20" rx="10" fill="#FF6B35" />
                  <text x="25" y="13" fill="white" fontSize="7" fontWeight="black" textAnchor="middle">HELP</text>
                </g>
                <g transform="translate(280, -40) rotate(45)" className="animate-chaotic" style={{ animationDelay: '2.5s' }}>
                  <rect width="50" height="20" rx="10" fill="#FF8A5B" />
                  <text x="25" y="13" fill="white" fontSize="7" fontWeight="black" textAnchor="middle">SOS</text>
                </g>
              </g>

              {/* WATER SPRAYING FROM BURST (The "Leak") */}
              <g opacity="0.9">
                {/* Main spray upwards/sideways from the crack at (77, 120) */}
                <path d="M77 120 Q30 40 10 120" fill="none" stroke="url(#water)" strokeWidth="8" className="animate-flow-fast" strokeLinecap="round" />
                <path d="M77 122 Q120 40 180 140" fill="none" stroke="url(#water)" strokeWidth="6" className="animate-flow-med" strokeLinecap="round" />
                <path d="M77 118 Q60 10 0 80" fill="none" stroke="url(#water)" strokeWidth="4" className="animate-flow-slow" strokeLinecap="round" opacity="0.7" />
                <path d="M77 120 Q50 20 120 20 Q180 20 220 100" fill="none" stroke="url(#water)" strokeWidth="4" className="animate-flow-fast" strokeLinecap="round" opacity="0.6" />
                
                {/* Extra droplets spraying out */}
                <circle cx="50" cy="60" r="2" fill="#93C5FD" className="animate-splash" />
                <circle cx="120" cy="50" r="2.5" fill="#BFDBFE" className="animate-splash" style={{ animationDelay: '0.2s' }} />
                <circle cx="90" cy="30" r="1.5" fill="#DBEAFE" className="animate-splash" style={{ animationDelay: '0.4s' }} />
                
                {/* Water pooling below the crack */}
                <path d="M77 125 L100 200 L55 200 Z" fill="url(#water)" opacity="0.6" />
                <line x1="77" y1="125" x2="85" y2="200" stroke="#BFDBFE" strokeWidth="3" className="animate-flow-fast" />
                <line x1="77" y1="125" x2="65" y2="200" stroke="#93C5FD" strokeWidth="2.5" className="animate-flow-med" />
              </g>

              {/* REMOVED PREVIOUS OVERLAPPING BUBBLES BLOCK */}



              {/* FAUCET BODY (Broken) */}
              <rect x="50" y="185" width="55" height="15" rx="3" fill="url(#metal-dark)"/>
              
              {/* Lower Pipe Segment */}
              <rect x="60" y="125" width="35" height="60" fill="url(#metal)"/>
              
              {/* UPPER Pipe Segment (Slightly tilted/disconnected) */}
              <g transform="translate(2, -4) rotate(-3, 77, 120)">
                <rect x="60" y="70" width="35" height="50" fill="url(#metal)"/>
                <path d="M60 75 C60 20 80 15 120 15 L180 15 C210 15 215 35 215 65 L215 95 L170 95 L170 65 C170 45 160 40 130 40 L95 40 C85 40 85 45 85 60 L85 75 Z" fill="url(#metal)"/>
                <rect x="165" y="90" width="55" height="12" rx="2" fill="url(#metal-dark)"/>
                <rect x="95" y="130" width="25" height="20" rx="4" fill="url(#metal-dark)"/>
                <path d="M120 135 L170 110 L175 120 L120 145 Z" fill="url(#metal)"/>
                <circle cx="120" cy="140" r="8" fill="#cbd5e1" />
                <rect x="65" y="75" width="5" height="40" fill="white" opacity="0.6" rx="2.5"/>
              </g>
              
              {/* Jagged Crack Line at the break */}
              <path d="M60 125 L68 120 L75 128 L85 122 L95 125" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />

              {/* IMPACT SPLASHES (at the spray landing points) */}
              <g transform="translate(80, 200)">
                <ellipse cx="0" cy="5" rx="40" ry="10" fill="rgba(59, 130, 246, 0.3)" />
                <circle cx="0" cy="0" r="12" fill="none" stroke="#60A5FA" strokeWidth="2" className="animate-splash" />
                <circle cx="0" cy="0" r="18" fill="none" stroke="#BFDBFE" strokeWidth="1" className="animate-splash" style={{ animationDelay: '0.2s' }} />
              </g>
              
              <g transform="translate(20, 150)">
                <circle cx="0" cy="0" r="8" fill="none" stroke="#93C5FD" strokeWidth="2" className="animate-splash" />
              </g>

              <g transform="translate(150, 170)">
                <circle cx="0" cy="0" r="10" fill="none" stroke="#60A5FA" strokeWidth="2" className="animate-splash" style={{ animationDelay: '0.4s' }} />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* SOS SECTION (RADAR) */}
      <section className={glassSection}>
        <div className="mb-4 text-center">
          <h3 className={`${sectionTitle} mb-1`}>
            But you have help <span className="text-[#FF6B35]">on the spot.</span>
          </h3>
          <p className={sectionCopy}>
            Press the SOS button and we'll find the nearest professional.
          </p>
        </div>

        <div className="bg-white/52 backdrop-blur-md rounded-[24px] p-6 relative overflow-hidden shadow-[0_18px_38px_-30px_rgba(15,23,42,0.65)] border border-white/75">
          {/* Zoomed-in "Blueprint" Map Background Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg className="w-full h-full opacity-60 scale-150 transform-gpu" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Complex zoomed blueprint map pattern */}
              <rect width="200" height="200" fill="#f8fafc" />
              
              {/* Building Blocks */}
              <g fill="#e2e8f0">
                <rect x="10" y="10" width="35" height="45" rx="2" />
                <rect x="55" y="10" width="40" height="25" rx="2" />
                <rect x="105" y="10" width="20" height="60" rx="2" />
                <rect x="135" y="10" width="55" height="35" rx="2" />
                
                <rect x="10" y="65" width="25" height="30" rx="2" />
                <rect x="45" y="65" width="50" height="70" rx="2" />
                <rect x="105" y="80" width="30" height="40" rx="2" />
                <rect x="145" y="55" width="45" height="55" rx="2" />
                
                <rect x="10" y="105" width="25" height="85" rx="2" />
                <rect x="105" y="130" width="20" height="60" rx="2" />
                <rect x="135" y="120" width="55" height="70" rx="2" />
                <rect x="45" y="145" width="50" height="45" rx="2" />
              </g>

              {/* Main Streets (Wider) */}
              <g stroke="#cbd5e1" strokeWidth="4">
                <path d="M0 55.5h200" />
                <path d="M100 0v200" />
                <path d="M0 140.5h200" />
                <path d="M40 0v200" />
              </g>

              {/* Side Streets (Thinner) */}
              <g stroke="#cbd5e1" strokeWidth="2" strokeDasharray="1 1">
                <path d="M100 40h100" />
                <path d="M100 110h100" />
                <path d="M40 90h60" />
              </g>

              {/* Blueprint Grid Lines (Faint) */}
              <g stroke="#1a4d4d" strokeWidth="0.1" opacity="0.15">
                {[...Array(20)].map((_, i) => (
                  <React.Fragment key={i}>
                    <line x1={i * 10} y1="0" x2={i * 10} y2="200" />
                    <line x1="0" y1={i * 10} x2="200" y2={i * 10} />
                  </React.Fragment>
                ))}
              </g>

              {/* Location Markers / Dots on the map */}
              <circle cx="70" cy="95" r="1.5" fill="#1a4d4d" opacity="0.3" />
              <circle cx="150" cy="40" r="1.5" fill="#1a4d4d" opacity="0.3" />
              <circle cx="120" cy="160" r="1.5" fill="#1a4d4d" opacity="0.3" />
            </svg>
            
            {/* White Softening Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/70 to-white" />
          </div>
          
          <div className="flex flex-col items-center justify-center min-h-[160px] relative z-10">
            
            <div className={`transition-all duration-500 absolute flex flex-col items-center ${sosStep === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 bg-[#FF6B35]/20 rounded-full animate-radar"></div>
                <div className="absolute w-16 h-16 bg-[#FF6B35]/20 rounded-full animate-radar-delay"></div>
                <div className="relative w-16 h-16 bg-gradient-to-tr from-[#FF6B35] to-[#FF8A5B] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.4)]">
                  <Zap className="text-white w-7 h-7" fill="currentColor" />
                </div>
              </div>
              <p className="text-[#1a4d4d] font-bold mt-4 text-sm tracking-wide">I NEED HELP NOW</p>
            </div>

            <div className={`transition-all duration-500 absolute flex flex-col items-center ${sosStep === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
               <MapPin className="text-[#FF6B35] w-10 h-10 animate-bounce mb-3" />
               <p className="text-[#1a4d4d] text-sm font-bold">Scanning your area...</p>
               <p className="text-white font-bold text-xs mt-1 bg-[#1a4d4d] px-3 py-1 rounded-full">12 pros online</p>
            </div>

            <div className={`transition-all duration-500 absolute w-full px-2 ${sosStep === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="bg-white/78 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 w-full shadow-lg border border-white/75">
                <div className="relative">
                  <img src="https://i.pravatar.cc/100?img=11" alt="Andrew M." className="w-12 h-12 rounded-full object-cover border-2 border-[#1a4d4d]" />
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    Andrew M. <Check className="w-3 h-3 text-white bg-blue-500 rounded-full p-[1px]" />
                  </p>
                  <p className="text-xs text-gray-500">Emergency Plumber</p>
                </div>
                <div className="text-right">
                  <div className="bg-orange-50 text-[#FF6B35] px-2 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" /> 12 MIN
                  </div>
                  <p className="text-xs font-bold text-gray-900">£45/hr</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT IS CLOSER */}
      <section className={glassSection}>
        <p className={eyebrow}>
          WHAT IS CLOSER
        </p>
        <h3 className={`${sectionTitle} mb-2`}>
          Find the right pro in 12 minutes, not 3 days
        </h3>
        <p className={`${sectionCopy} mb-4`}>
          Our AI understands exactly what you need, even if you don't know the exact term.
          Tell it naturally: "my sink is leaking" or "I have no power" — we do the rest.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { num: '12min', label: 'avg response', delay: '0s' },
            { num: '4.8★',  label: 'avg rating',  delay: '0.15s' },
            { num: '100%',  label: 'verified pros', delay: '0.3s' }
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/52 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
              style={statsVisible ? { animation: `closer-counter-pop 0.8s ease-out ${s.delay} both` } : { opacity: 0 }}
            >
              <p className="text-lg font-medium text-[#1a4d4d] leading-none">{s.num}</p>
              <p className="text-[9px] text-teal-700 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSER GUARANTEE */}
      <section className="relative overflow-hidden rounded-[28px] p-5 mb-4 bg-gradient-to-br from-white/76 via-blue-50/70 to-teal-50/70 backdrop-blur-xl border border-white/75 shadow-[0_22px_46px_-34px_rgba(15,23,42,0.82)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Protected by Closer Guarantee
            </h3>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              Every job is insured up to £1,000. 
              Not satisfied? We give your money back or bring another pro for free. 
              You only pay when the job is done.
            </p>
          </div>
        </div>
      </section>

      {/* BEFORE & AFTER SLIDER */}
      <section className={glassSection}>
        <p className={eyebrow}>
          QUALITY OF WORK
        </p>
        <h3 className={`${sectionTitle} mb-3`}>
          Results that speak for themselves
        </h3>
        
        <div className="relative w-full h-[200px] bg-white/52 rounded-[24px] overflow-hidden select-none touch-none border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <img 
            src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800" 
            alt="After (Clean)" 
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <span className="absolute top-2 right-2 bg-white/90 text-gray-800 text-[10px] px-2 py-0.5 rounded font-medium shadow-sm">
            AFTER
          </span>

          <div 
            className="absolute inset-0 overflow-hidden" 
            style={{ width: `${sliderPos}%` }}
          >
            <img 
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" 
              alt="Before (Dirty)" 
              className="absolute inset-0 w-[500px] max-w-none h-full object-cover"
              style={{ width: 'calc(100vw - 2.5rem)', maxWidth: '400px' }}
              draggable={false}
            />
            <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
              BEFORE
            </span>
          </div>

          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
            style={{ left: `calc(${sliderPos}% - 2px)` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center">
              <GripVertical className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          <input 
            type="range" 
            min="0" max="100" 
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 z-20 before-after-slider"
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">Drag the slider to see the difference before and after deep cleaning.</p>
      </section>

      {/* PROBLEMS SOLVED */}
      <section className={glassSection}>
        <p className={eyebrow}>
          PROBLEMS WE SOLVE
        </p>
        <h3 className={`${sectionTitle} mb-3`}>
          Stop calling 10 different companies
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Zap, title: '24/7 Emergencies', desc: 'Water, power, locks — someone is coming now' },
            { icon: Shield, title: 'Fully Verified', desc: 'ID, background checks, real reviews' },
            { icon: CreditCard, title: 'Fair Price', desc: 'See the cost upfront, no surprises' },
            { icon: Clock, title: 'Fast Response', desc: 'Avg 12 min vs 3 days elsewhere' }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white/52 backdrop-blur-md rounded-2xl p-3 border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-[#1a4d4d]"
                >
                  <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-gray-900 mb-0.5 uppercase tracking-tight">{f.title}</p>
                <p className="text-[10px] text-gray-500 leading-snug">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRANSPARENT PRICING */}
      <section className={glassSection}>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-[#1a4d4d]" />
          <p className={eyebrow}>
            NO SURPRISES
          </p>
        </div>
        <h3 className={`${sectionTitle} mb-3`}>
          Transparent Pricing
        </h3>
        
        <div className="flex bg-white/52 backdrop-blur-md p-1 rounded-2xl mb-3 border border-white/75">
          {Object.keys(prices).map(tab => (
            <button
              key={tab}
              onClick={() => setPriceTab(tab)}
              className={`flex-1 text-[11px] font-medium py-1.5 rounded-lg transition-colors ${
                priceTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="bg-[#1a4d4d]/8 border border-white/75 rounded-2xl p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <p className="text-sm font-semibold text-[#1a4d4d] mb-1">
            {prices[priceTab]}
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={glassSection}>
        <p className={eyebrow}>
          3 SIMPLE STEPS
        </p>
        <h3 className={`${sectionTitle} mb-3`}>
          From problem to solution
        </h3>

        <div className="flex flex-col gap-2">
          {[
            { num: 1, title: 'Describe what you need', desc: 'Type naturally or press "Help Now" for emergencies' },
            { num: 2, title: 'AI matches you with pros', desc: 'See 3 verified people with clear price and ETA' },
            { num: 3, title: 'Solve the problem', desc: 'Pay securely in-app, leave a review after' }
          ].map((s) => (
            <div key={s.num} className="flex gap-3 items-start p-3 bg-white/52 backdrop-blur-md rounded-2xl border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <div className="w-7 h-7 rounded-full bg-[#1a4d4d] text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-[0_10px_22px_-14px_rgba(26,77,77,0.8)]">
                {s.num}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-slate-950 mb-0.5">{s.title}</p>
                <p className="text-[10px] text-slate-500 font-semibold leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={glassSection}>
        <p className={eyebrow}>
          WHAT CLIENTS SAY
        </p>
        <h3 className={`${sectionTitle} mb-3`}>
          Real, verified reviews
        </h3>

        <div className="relative min-h-[120px]">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-white/58 backdrop-blur-md rounded-2xl p-4 border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-opacity duration-500 flex flex-col justify-between"
              style={{
                opacity: i === testimonialIdx ? 1 : 0,
                pointerEvents: i === testimonialIdx ? 'auto' : 'none'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{t.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium truncate">{t.location}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-2.5 h-2.5 text-[#1a4d4d] fill-[#1a4d4d]" />
                  ))}
                </div>
              </div>
              <p className="text-[12px] text-gray-600 italic leading-relaxed line-clamp-2">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIdx(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i === testimonialIdx ? '#1a4d4d' : '#D1D5DB',
                width: i === testimonialIdx ? '16px' : '6px'
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* B2B CTA FOR PROS */}
      <section className="relative overflow-hidden rounded-[28px] p-5 mb-4 bg-slate-950/90 text-white border border-white/15 shadow-[0_24px_50px_-32px_rgba(2,6,23,0.95)]">
        <div className="absolute right-0 top-0 w-32 h-32 bg-teal-400/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute left-0 bottom-0 w-28 h-28 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-[#4bffc8] tracking-[0.16em] uppercase mb-1">
            FOR PROFESSIONALS
          </p>
          <h3 className="text-[20px] font-black leading-tight tracking-tight mb-2">
            Are you a tradesperson or pro?
          </h3>
          <p className="text-xs text-slate-300 font-semibold mb-4 leading-relaxed">
            Earn more, on your schedule. No annoying phone calls, everything organized in the app. Join over 500+ professionals.
          </p>
          <button className="bg-white/92 text-slate-950 px-4 py-2.5 rounded-full text-xs font-black w-full shadow-[0_14px_30px_-22px_rgba(255,255,255,0.9)] hover:bg-white transition-colors">
            Become a Closer Partner
          </button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="relative overflow-hidden rounded-[28px] p-5 text-center text-white border border-white/20 shadow-[0_24px_50px_-34px_rgba(26,77,77,0.95)]"
        style={{ background: 'linear-gradient(135deg, #1a4d4d 0%, #2d5a5a 100%)' }}
      >
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-teal-200/20 blur-2xl pointer-events-none" />
        <p className="relative text-[18px] font-black tracking-tight mb-1">Ready to get it solved quickly?</p>
        <p className="relative text-xs opacity-85 font-semibold mb-3">
          Free for clients · verified pros · no hidden fees
        </p>
        <button
          onClick={onCtaClick}
          className="relative bg-white text-[#1a4d4d] px-5 py-2.5 rounded-full text-xs font-black inline-flex items-center gap-1.5 hover:bg-gray-100 transition-colors shadow-[0_14px_30px_-22px_rgba(255,255,255,0.9)]"
        >
          Start now
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </section>
    </div>
  );
};

export default CloserAppPresentation;
