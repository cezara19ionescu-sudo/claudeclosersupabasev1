import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Star, CheckCircle2, Plus } from 'lucide-react';
import { CATS, SUB_IC, AVC, AVE } from '../constants';
import { Category, Professional } from '../types';
import { cn } from '../lib/utils';
import { Home, Sparkles, Truck, PartyPopper, Book, Monitor, Dog, Heart, Scale, Leaf, Smile, Briefcase, Loader2, Globe } from 'lucide-react';
import { translations, Language } from '../utils/translations';

const ICON_MAP: Record<string, any> = {
  home: Home,
  beauty: Sparkles,
  auto: Truck,
  events: PartyPopper,
  edu: Book,
  tech: Monitor,
  pets: Dog,
  health: Heart,
  legal: Scale,
  garden: Leaf,
  office: Briefcase,
  life: Smile
};

const SUGGESTIONS = [
  // Natural Language & Phrases
  "My sink is leaking",
  "Find me a pro",
  "Find me an electrician",
  "Find me a plumber",
  "Find me a cleaner",
  "My toilet is clogged",
  "Fix my garden",
  "Repair my phone",
  "Help with my taxes",
  "I need a massage",
  "My car won't start",
  "Broken window repair",

  // Short/direct intents for easy inline autocompletion
  "Gardening",
  "Garden my lawn",
  "Grass cutting",
  "Plumber",
  "Electrician",
  "Painter",
  "Carpenter",
  "Locksmith",
  "Handyman",
  "Hairdresser",
  "Nail Tech",
  "Massage",
  "Makeup",
  "Barber",
  "Mechanic",
  "Photographer",
  "DJ",
  "Maths Tutor",
  "PC Repair",
  "Phone Repair",
  "Dog Walking",
  "Personal Trainer",
  "Lawn Mowing",
  
  // Specific problems & searches
  "Verify circuit",
  "Circuit breaker",
  "Short circuit",
  "Fuse blown",
  "Leakage",
  "Water leak",
  "Pipe burst in my bathroom",
  "Urgent electrical problem",
  "Complete apartment renovation",
  "Washing machine repair",
  "Post-construction cleaning",
  "I want to landscape my garden",
  "I need a plumber urgently",
  "Car towing and roadside assistance",
  "Power outage in the whole house",
  "IKEA furniture assembly",
  "Fridge repair",
  "8th grade math tutor",
  "Wedding photographer",
  "Party DJ",
  "Legal consultation",
  "Therapeutic massage",
  "Dog training",
  "Office cleaning",
  "Laptop repair",

  // Romanian fallbacks for bilingual support
  "Chiuveta curge",
  "Am nevoie de un electrician",
  "Am nevoie de un instalator",
  "Instalator",
  "Zugrav",
  "Tractare auto",
  "Meditatii",
  "Curatenie",
  "Tuns iarba",
  "Reparatie frigider",
  "Teava sparta",
  "Scurtcircuit",
  "Siguranta arsa",
  "Inundatie"
];

const PLACEHOLDER_PHRASES = [
  "My sink is leaking...",
  "I need an electrician...",
  "Find me a pro...",
  "Chiuveta curge...",
  "Fix my garden...",
  "Professional painter needed...",
  "Describe your problem here...",
  "Am nevoie de un instalator..."
];

export function SearchBar({ value, onChange, onClear, onSearch, isLoading, lang = 'en' }: { value: string, onChange: (v: string) => void, onClear: () => void, onSearch?: (q?: string) => void, isLoading?: boolean, lang?: Language }) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = PLACEHOLDER_PHRASES[currentPhraseIndex];
      
      if (!isDeleting) {
        setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
        setTypingSpeed(100);
        
        if (displayedText.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayedText(currentPhrase.substring(0, displayedText.length - 1));
        setTypingSpeed(50);
        
        if (displayedText.length === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentPhraseIndex, typingSpeed]);

  return (
    <div className="w-full relative z-40">
      <motion.form 
        onSubmit={(e) => { e.preventDefault(); if (onSearch) onSearch(); }}
        animate={{ 
          boxShadow: [
            "0 0 10px rgba(75,255,200,0.1)", 
            "0 0 25px rgba(75,255,200,0.25)", 
            "0 0 10px rgba(75,255,200,0.1)"
          ],
          borderColor: [
            "rgba(75,255,200,0.2)",
            "rgba(75,255,200,0.5)",
            "rgba(75,255,200,0.2)"
          ]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative flex items-center gap-2 bg-white rounded-full px-5 py-3.5 border-2 w-full transition-shadow focus-within:shadow-[0_0_20px_rgba(75,255,200,0.2)]"
      >
        <Search className="w-[18px] h-[18px] text-slate-500 shrink-0" />
        
        <div className="relative flex-1 flex items-center h-full">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 relative z-10 font-sans leading-normal m-0 p-0"
            disabled={isLoading}
          />
          <AnimatePresence>
            {!value && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 pointer-events-none text-[15px] text-slate-400 font-sans whitespace-nowrap overflow-hidden"
              >
                {displayedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[2px] h-[15px] bg-teal-400 ml-0.5 align-middle"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {value ? (
          <button type="button" onClick={() => onClear()} className="shrink-0 p-1 mr-[-4px]">
            <X className="w-[18px] h-[18px] text-slate-400" />
          </button>
        ) : (
          <button 
            type="submit" 
            disabled={isLoading} 
            className="shrink-0 flex items-center justify-center gap-1.5 bg-[#f0f7f6] text-[#2D5A50] px-4 py-1.5 rounded-full font-bold text-[13px] ml-1 disabled:opacity-75 relative overflow-hidden group shadow-[0_0_12px_rgba(45,90,80,0.15)] hover:shadow-[0_0_20px_rgba(45,90,80,0.25)] border border-teal-100/50 premium-btn"
          >
            {/* Animated Glow on the Right */}
            <motion.div 
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-10 h-full bg-gradient-to-l from-teal-300/30 to-transparent blur-md -mr-2 pointer-events-none" 
            />

            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <motion.span
                animate={{
                  opacity: [0.62, 0.95, 0.62],
                  scale: [0.96, 1.04, 0.96],
                  boxShadow: [
                    "0 0 0 0 rgba(34,197,94,0.14)",
                    "0 0 0 3px rgba(34,197,94,0.07)",
                    "0 0 0 0 rgba(34,197,94,0)"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.1,
                  ease: "easeInOut"
                }}
                className="relative z-10 h-2.5 w-2.5 overflow-hidden rounded-full border border-emerald-200/80 bg-emerald-300/85"
              >
                <span className="absolute left-[2px] top-[2px] h-[3px] w-[3px] rounded-full bg-white/70" />
              </motion.span>
            )}
            <span className="relative z-10">{translations[lang].ai_assist}</span>
          </button>
        )}
        </motion.form>
    </div>
  );
}

const SUB_IMAGES: Record<string, string> = {
  'Plumber': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=300&q=80',
  'Electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
  'Painter': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=300&q=80',
  'Carpenter': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=300&q=80',
  'Locksmith': 'https://images.unsplash.com/photo-1517400414436-056345717646?auto=format&fit=crop&w=300&q=80',
  'Handyman': 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=300&q=80',
  'Roofing': 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?auto=format&fit=crop&w=300&q=80',
  'Cleaner': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=300&q=80',
  'Hairdresser': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
  'Nail Tech': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=300&q=80',
  'Massage': 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&w=300&q=80',
  'Makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80',
  'Barber': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80',
  'Mechanic': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80',
  'MOT': 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=300&q=80',
  'Valeting': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=300&q=80',
  'Recovery': 'https://images.unsplash.com/photo-1586191552066-d52dd1e3af86?auto=format&fit=crop&w=300&q=80',
  'Photographer': 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=300&q=80',
  'DJ': 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=300&q=80',
  'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=300&q=80',
  'Florist': 'https://images.unsplash.com/photo-1562618956-430934600c8c?auto=format&fit=crop&w=300&q=80',
  'Maths Tutor': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=300&q=80',
  'Lawn Mowing': 'https://images.unsplash.com/photo-1533467686119-4d8cc34000f6?auto=format&fit=crop&w=300&q=80',
  'Hedge Trimming': 'https://images.unsplash.com/photo-1599818815147-a7eb289139f7?auto=format&fit=crop&w=300&q=80',
  'Garden Design': 'https://images.unsplash.com/photo-1558904541-efa8c1915918?auto=format&fit=crop&w=300&q=80',
  'Dog Walking': 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=300&q=80',
  'PC Repair': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=300&q=80',
  'Phone Repair': 'https://images.unsplash.com/photo-1512054192342-d98e8d65f0ca?auto=format&fit=crop&w=300&q=80',
};

export function CategoryGrid({ onSelect, onSubSelect, lang = 'en' }: { 
  onSelect: (cat: Category) => void, 
  onSubSelect: (sub: string, cat: Category) => void,
  lang?: Language
}) {
  const t = (key: keyof typeof translations['en']) => (translations[lang] as any)[key] || key;
  const tSub = (sub: string) => (translations[lang] as any).subs?.[sub] || sub;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryTheme, setCategoryTheme] = useState<1 | 2>(1);

  const handleCatClick = (cat: Category) => {
    if (expandedId === cat.id) {
      setExpandedId(null);
    } else {
      setExpandedId(cat.id);
      onSelect(cat);
      // Scroll into view nicely
      setTimeout(() => {
        document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-3">
      <div className="rounded-[24px] border border-white/80 bg-white/75 p-2 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="px-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              {lang === 'ro' ? 'Stil categorii' : 'Category style'}
            </div>
            <div className="text-[12px] font-black text-[#123f3f]">
              {lang === 'ro' ? 'Alege tema' : 'Choose theme'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-[18px] bg-slate-100/90 p-1">
            {[1, 2].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setCategoryTheme(theme as 1 | 2)}
                className={cn(
                  "h-10 rounded-[14px] px-4 text-[11px] font-black transition-all",
                  categoryTheme === theme
                    ? "bg-[#1a4d4d] text-white shadow-[0_10px_20px_-14px_rgba(26,77,77,0.9)]"
                    : "text-slate-500"
                )}
              >
                {lang === 'ro' ? `Tema ${theme}` : `Theme ${theme}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CATS.map((c) => {
          const Icon = ICON_MAP[c.id];
          const isExpanded = expandedId === c.id;
          const isThemeTwo = categoryTheme === 2;
          const activeCategoryColor = isThemeTwo ? '#11966f' : c.color;
          const catTint = `${c.color}14`;
          const catTintStrong = `${c.color}24`;
          const catBorder = `${c.color}66`;
          
          return (
            <React.Fragment key={c.id}>
              <motion.button
                id={`cat-${c.id}`}
                onClick={() => handleCatClick(c)}
                layout
                animate={{ 
                  y: isExpanded ? (isThemeTwo ? -2 : -4) : 0,
                  scale: isExpanded ? (isThemeTwo ? 1.01 : 1.03) : 1,
                  backgroundColor: isExpanded ? (isThemeTwo ? activeCategoryColor : catTint) : "#ffffff",
                  borderColor: isExpanded ? (isThemeTwo ? 'rgba(17,150,111,0.95)' : catBorder) : "rgba(255,255,255,0.92)",
                  boxShadow: isExpanded
                    ? isThemeTwo
                      ? "0 18px 36px -20px rgba(17,150,111,0.7), inset 0 1px 0 rgba(255,255,255,0.25)"
                      : `0 18px 34px -18px ${c.color}cc, 0 8px 18px -14px rgba(15,23,42,0.35)`
                    : isThemeTwo
                      ? "0 14px 28px -24px rgba(15,23,42,0.65), inset 0 1px 0 rgba(255,255,255,0.9)"
                      : "0 7px 18px -14px rgba(15,23,42,0.35)"
                }}
                whileHover={{
                  y: -3,
                  scale: isExpanded ? (isThemeTwo ? 1.015 : 1.035) : 1.025,
                  backgroundColor: isExpanded ? (isThemeTwo ? activeCategoryColor : catTintStrong) : (isThemeTwo ? "#ffffff" : `${c.color}0d`),
                  borderColor: isThemeTwo ? "rgba(17,150,111,0.38)" : catBorder,
                  boxShadow: isExpanded
                    ? isThemeTwo
                      ? "0 20px 40px -20px rgba(17,150,111,0.72)"
                      : `0 20px 38px -16px ${c.color}dd, 0 8px 18px -12px rgba(15,23,42,0.28)`
                    : isThemeTwo
                      ? "0 18px 34px -24px rgba(15,23,42,0.45)"
                      : `0 15px 30px -18px ${c.color}bb, 0 8px 14px -12px rgba(15,23,42,0.30)`
                }}
                whileTap={{
                  y: 0,
                  scale: 0.96,
                  backgroundColor: isThemeTwo ? activeCategoryColor : catTintStrong,
                  boxShadow: isThemeTwo ? "0 0 0 5px rgba(17,150,111,0.12)" : `0 0 0 5px ${c.color}18, 0 4px 12px rgba(15,23,42,0.10)`,
                }}
                transition={{ type: "spring", stiffness: 460, damping: 30, mass: 0.72 }}
                className={cn(
                  "relative cursor-pointer aspect-square text-center flex flex-col items-center justify-center bg-white border group z-0 overflow-hidden category-highlight-card",
                  isThemeTwo ? "rounded-[32px] p-3" : "rounded-[26px] p-4",
                  isExpanded && "z-10"
                )}
                style={{
                  '--cat-color': c.color,
                  '--cat-bg': catTintStrong
                } as any}
              >
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  initial={false}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <div
                    className="absolute -inset-x-8 -top-10 h-24 rotate-[-18deg] blur-xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${c.color}30, transparent)` }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-[22px] border"
                    style={{ borderColor: `${c.color}38` }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  />
                </motion.div>

                <motion.div 
                  className={cn(
                    "relative flex items-center justify-center transition-colors duration-300",
                    isThemeTwo ? "w-16 h-16 mb-3 rounded-[20px]" : "w-16 h-16 mb-2 rounded-[22px]",
                    isExpanded ? (isThemeTwo ? "" : "shadow-inner") : (isThemeTwo ? "" : "bg-slate-50 group-hover:bg-[var(--cat-bg)]")
                  )}
                  animate={{
                    rotate: 0,
                    scale: isExpanded ? 1.06 : 1
                  }}
                  transition={{
                    rotate: { duration: 0.5, ease: "easeOut" },
                    scale: { type: "spring", stiffness: 420, damping: 24 }
                  }}
                  style={{
                    backgroundColor: isExpanded ? (isThemeTwo ? 'rgba(255,255,255,0.08)' : `${c.color}20`) : undefined
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-[22px]"
                    animate={{ opacity: isExpanded ? 0.45 : 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{ boxShadow: `inset 0 0 0 1px ${c.color}2f, 0 0 22px ${c.color}26` }}
                  />
                  {Icon && (
                    <motion.div
                      animate={{ y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="relative z-10 flex items-center justify-center"
                    >
                    <Icon 
                      className={cn(
                        "w-8 h-8 transition-colors duration-300",
                        isThemeTwo && "w-12 h-12",
                        !isExpanded && "text-[#2d5a5a]"
                      )}
                      style={{ 
                        color: isExpanded ? (isThemeTwo ? '#ffffff' : c.color) : '#2d5a5a'
                      }}
                      strokeWidth={isThemeTwo ? 2.15 : 2.5}
                    />
                    </motion.div>
                  )}
                </motion.div>
                <motion.div 
                  className={cn(
                    "relative z-10 leading-tight tracking-tight transition-colors duration-300 whitespace-pre-line",
                    isThemeTwo ? "text-[18px]" : "text-[12px]",
                    isExpanded ? "font-black" : "font-extrabold",
                    !isExpanded && "text-[#2d5a5a]"
                  )}
                  animate={{ y: isExpanded ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  style={{ 
                    color: isExpanded ? (isThemeTwo ? '#ffffff' : c.color) : (isThemeTwo ? '#0f172a' : undefined)
                  }}
                >
                  {t(`cat_${c.id}` as any)}
                </motion.div>
                
                {/* Visual Feedback Ring on Active/Touch */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      className="absolute bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full pointer-events-none"
                      style={{ backgroundColor: c.color }}
                      initial={{ opacity: 0, width: 8 }}
                      animate={{ opacity: 1, width: 32 }}
                      exit={{ opacity: 0, width: 8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Inline Expansion Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, height: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, y: -8, scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 360, damping: 32, opacity: { duration: 0.18 } }}
                    className="col-span-3 overflow-hidden rounded-[26px] mt-2 mb-4 p-4 border bg-white/80 backdrop-blur-sm"
                    style={{
                      borderColor: `${c.color}1f`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.75), 0 18px 36px -30px ${c.color}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h4 className="text-[14px] font-black text-[#1a4d4d]">{t('popular_in')} {t(`cat_${c.id}` as any).replace('\n', ' ')}</h4>
                      <button className="text-[11px] font-bold text-emerald-600">{t('view_all')}</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {c.subs.slice(0, 4).map((sub, index) => (
                        <motion.button
                          key={sub}
                          onClick={() => onSubSelect(sub, c)}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 * index, type: "spring", stiffness: 380, damping: 28 }}
                          whileHover={{ y: -2, scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative h-24 rounded-2xl overflow-hidden group shadow-sm border border-white premium-touch"
                        >
                          <img 
                            src={SUB_IMAGES[sub] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=300&q=80'} 
                            alt={sub}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-2 left-3 right-3 text-left">
                            <div className="text-[10px] text-white/70 font-bold uppercase tracking-wider mb-0.5">{SUB_IC[sub] || '🛠️'}</div>
                            <div className="text-[13px] font-black text-white leading-tight">{tSub(sub)}</div>
                          </div>
                        </motion.button>
                      ))}
                      
                      {c.subs.length > 4 && (
                        <button
                          onClick={() => onSubSelect(c.subs[4], c)} // Just a placeholder for "More"
                          className="relative h-24 rounded-2xl overflow-hidden group bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 premium-touch"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">+{c.subs.length - 4} {lang === 'ro' ? 'Mai multe' : 'More'}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function ProCard({ pro, onClick, index, lang = 'en' }: { pro: Professional; onClick: () => void; index: number; key?: string | number, lang?: Language }) {
  const tSub = (sub: string) => (translations[lang] as any).subs?.[sub] || sub;
  return (
    <div 
      onClick={onClick}
      className="rounded-[28px] p-4 mb-4 bg-white border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.03)] cursor-pointer flex gap-4 group relative overflow-hidden premium-card premium-touch"
    >
      {/* Online indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-50/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-emerald-100/50">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">{translations[lang].online_now}</span>
      </div>

      <div className="relative">
        <div 
          className="w-20 h-20 rounded-[22px] flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-sm"
          style={{ backgroundColor: AVC[index % 8] }}
        >
          {pro.img ? (
            <img 
              src={pro.img} 
              alt={pro.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            AVE[index % 8]
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col pt-1">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="text-[16px] font-black text-slate-900 truncate">{pro.name}</div>
          {pro.v.id === 1 && (
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.05em] px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1">
            <span>{SUB_IC[pro.sub] || '🛠️'}</span>
            {tSub(pro.sub)}
          </div>
          <div className="text-[10px] font-black text-teal-600 uppercase tracking-[0.05em] px-2 py-0.5 bg-teal-50 rounded-lg border border-teal-100 flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-teal-600" />
            {pro.rating}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{translations[lang].pricing}</span>
            <div className="text-[14px] font-black text-slate-800">£{pro.price}<span className="text-[10px] text-slate-400 font-bold">{pro.unit}</span></div>
          </div>
          
          <div className="w-px h-6 bg-slate-100" />
          
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{translations[lang].hires}</span>
            <div className="text-[14px] font-black text-slate-800">{pro.jobs || 12}+</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0 pl-2">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}
