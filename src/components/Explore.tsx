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
              <motion.div
                animate={{ 
                  scale: [1, 1.25, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "easeInOut" 
                }}
                className="flex items-center justify-center relative z-10"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#2D5A50]" />
              </motion.div>
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
      <div className="grid grid-cols-3 gap-2">
        {CATS.map((c) => {
          const Icon = ICON_MAP[c.id];
          const isExpanded = expandedId === c.id;
          
          return (
            <React.Fragment key={c.id}>
              <motion.button
                id={`cat-${c.id}`}
                onClick={() => handleCatClick(c)}
                animate={{ 
                  scale: isExpanded ? 1.05 : 1,
                  backgroundColor: isExpanded ? `${c.color}15` : "#ffffff",
                  borderColor: isExpanded ? c.color : "transparent",
                  boxShadow: isExpanded 
                    ? `0 15px 30px -12px ${c.color}30` 
                    : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)"
                }}
                whileHover={{
                  scale: isExpanded ? 1.05 : 1.04,
                  backgroundColor: isExpanded ? `${c.color}20` : `${c.color}08`,
                  borderColor: isExpanded ? c.color : `${c.color}60`,
                  boxShadow: isExpanded
                    ? `0 20px 40px -12px ${c.color}40`
                    : `0 12px 24px -6px ${c.color}25, 0 4px 8px -2px rgba(0,0,0,0.06)`
                }}
                whileTap={{
                  scale: 0.93,
                  backgroundColor: `${c.color}25`,
                  boxShadow: `0 0 0 4px ${c.color}15, 0 2px 8px rgba(0,0,0,0.08)`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative cursor-pointer rounded-[32px] p-4 aspect-square text-center flex flex-col items-center justify-center bg-white border-2 group z-0",
                  isExpanded && "z-10"
                )}
                style={{
                  '--cat-color': c.color,
                  '--cat-bg': `${c.color}20`
                } as any}
              >
                <div 
                  className={cn(
                    "w-16 h-16 mb-2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95",
                    isExpanded ? "scale-105 shadow-inner" : "bg-slate-50 group-hover:bg-[var(--cat-bg)]"
                  )}
                  style={{
                    backgroundColor: isExpanded ? `${c.color}25` : undefined
                  }}
                >
                  {Icon && (
                    <Icon 
                      className={cn(
                        "w-8 h-8 transition-colors duration-300",
                        !isExpanded && "text-[#2d5a5a]"
                      )}
                      style={{ 
                        color: isExpanded ? c.color : '#2d5a5a'
                      }}
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                <div 
                  className={cn(
                    "text-[12px] leading-tight tracking-tight transition-all duration-300",
                    isExpanded ? "font-black" : "font-medium",
                    !isExpanded && "text-[#2d5a5a]"
                  )}
                  style={{ 
                    color: isExpanded ? c.color : undefined
                  }}
                >
                  {t(`cat_${c.id}` as any)}
                </div>
                
                {/* Visual Feedback Ring on Active/Touch */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      layoutId={`ring-${c.id}`}
                      className="absolute inset-0 rounded-[24px] border-4 border-current opacity-10 pointer-events-none"
                      style={{ color: c.color }}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 0.1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Inline Expansion Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="col-span-3 overflow-hidden bg-slate-50/50 rounded-[32px] mt-2 mb-4 p-4 border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h4 className="text-[14px] font-black text-[#1a4d4d]">{t('popular_in')} {t(`cat_${c.id}` as any).replace('\n', ' ')}</h4>
                      <button className="text-[11px] font-bold text-emerald-600">{t('view_all')}</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {c.subs.slice(0, 4).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => onSubSelect(sub, c)}
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
                        </button>
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

