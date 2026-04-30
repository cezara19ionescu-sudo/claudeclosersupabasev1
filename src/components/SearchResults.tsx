import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Star, 
  Shield, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Filter, 
  ChevronDown,
  User as UserIcon,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Lock,
  Construction,
  MapPin,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional, PortfolioItem, Review, User } from '../types';
import { PROS } from '../constants';
import { translations, Language } from '../utils/translations';

interface SearchResultsScreenProps {
  onBack: () => void;
  categoryTitle: string;
  professionals: Professional[];
  onViewProfile: (pro: Professional) => void;
  onMessage: (pro: Professional) => void;
  isEmergency: boolean;
  setIsEmergency: (v: boolean) => void;
  onShowInfo: () => void;
  user: User;
  aiFeedback?: {message: string, estimate: string | undefined, safetyTip?: string | null, followUps?: string[]} | null;
  surveyAnswers?: Record<string, string> | null;
  lang?: Language;
}

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({ 
  onBack, 
  categoryTitle, 
  professionals,
  onViewProfile,
  onMessage,
  isEmergency,
  setIsEmergency,
  onShowInfo,
  user,
  aiFeedback,
  surveyAnswers,
  lang = 'en'
}) => {
  const t = (key: keyof typeof translations['en']) => (translations[lang] as any)[key] || key;
  const tSub = (sub: string) => (translations[lang] as any).subs?.[sub] || sub;
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'today' | 'this-week'>('all');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  const surveyText = useMemo(() => Object.values(surveyAnswers || {}).join(' ').toLowerCase(), [surveyAnswers]);

  const getMatchScore = (pro: Professional) => {
    let score = 0;

    score += pro.rating * 18;
    score += Math.min(pro.rc || 0, 80) * 0.35;
    score += Math.min(pro.jobs || 0, 120) * 0.18;
    if (pro.v?.id) score += 10;
    if (pro.v?.dbs) score += 8;
    if (pro.v?.ins) score += 6;
    if (pro.isEmergencyAvailable) score += 4;

    if (surveyText) {
      const urgentWords = ['urgent', 'imediat', 'asap', 'azi', 'mâine', 'maine', 'bloc', 'scurgere', 'spart'];
      const flexibleWords = ['flexibil', 'cotatie', 'cotație', 'săptămâna', 'saptamana'];
      if (urgentWords.some(word => surveyText.includes(word))) {
        score += pro.isEmergencyAvailable ? 28 : -8;
      }
      if (flexibleWords.some(word => surveyText.includes(word))) {
        score += pro.price <= 50 ? 10 : 0;
      }

      const profileText = [
        pro.sub,
        pro.about,
        ...(pro.svcs || []),
        ...(pro.faqs || []).map(f => `${f.q} ${f.a}`)
      ].join(' ').toLowerCase();

      for (const token of surveyText.split(/[^a-zăâîșț0-9]+/i).filter(token => token.length > 3)) {
        if (profileText.includes(token)) score += 3;
      }
    }

    score -= Math.min(pro.price || 0, 300) * 0.03;
    return score;
  };

  const sortedProfessionals = useMemo(() => {
    let list = [...professionals];

    // Apply Filters
    if (isEmergency) {
      list = list.filter(p => p.isEmergencyAvailable);
    }

    if (filterVerified) {
      list = list.filter(p => p.v.id === 1);
    }
    
    // Price Filter
    list = list.filter(p => p.price <= maxPrice);

    // Note: Availability filter would need actual slot data, using mock logic for now
    if (filterAvailability === 'today') {
      list = list.filter((_, idx) => idx % 2 === 0);
    }

    return list.sort((a, b) => {
      const matchDiff = getMatchScore(b) - getMatchScore(a);
      if (Math.abs(matchDiff) > 0.01) return matchDiff;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.rc - a.rc;
    });
  }, [filterVerified, filterAvailability, professionals, maxPrice, isEmergency, surveyText]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] max-w-md mx-auto shadow-xl min-h-screen font-sans">
      {/* Premium Header with Location */}
      <div className="sticky top-0 z-30">
        <div className="bg-brand px-5 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 premium-touch"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-[18px] font-black text-white tracking-tight leading-none mb-1">{categoryTitle}</h1>
              <div className="flex items-center gap-1.5 opacity-70">
                <MapPin className="w-3 h-3 text-white" />
                <span className="text-[11px] text-white font-bold uppercase tracking-widest">Northampton, UK</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              const next = !isEmergency;
              setIsEmergency(next);
              if (next) onShowInfo();
            }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-black border-2 premium-btn",
              isEmergency 
                ? "bg-white text-orange-600 border-white shadow-lg shadow-orange-500/30" 
                : "bg-white/10 text-white border-white/20"
            )}
          >
            <Zap className={cn("w-3.5 h-3.5", isEmergency ? "fill-orange-500" : "text-white/50")} />
            {isEmergency ? (lang === 'ro' ? 'SOS ACTIV' : 'SOS ACTIVE') : (lang === 'ro' ? 'AJUTOR ACUM' : 'HELP NOW')}
          </button>
        </div>

        {/* Premium Filter Pills Bar */}
        <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide shadow-sm">
          <button 
            onClick={() => setShowPriceModal(true)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black tracking-tight border premium-touch",
              maxPrice < 1000 
                ? "bg-brand text-white border-brand shadow-md" 
                : "bg-slate-50 text-slate-700 border-slate-200"
            )}
          >
            <DollarSign className={cn("w-3 h-3", maxPrice < 1000 ? "text-white" : "text-slate-400")} />
            {maxPrice < 1000 ? (lang === 'ro' ? `Până la £${maxPrice}` : `Up to £${maxPrice}`) : (lang === 'ro' ? 'Gama de Preț' : 'Price Range')}
            <ChevronDown className={cn("w-3 h-3", maxPrice < 1000 ? "text-white/70" : "text-slate-400")} />
          </button>
          
          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          <button 
            onClick={() => setFilterAvailability(filterAvailability === 'today' ? 'all' : 'today')}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border",
              filterAvailability === 'today' 
                ? "bg-brand/5 text-brand border-brand/20 shadow-inner" 
                : "bg-white text-slate-500 border-slate-100"
            )}
          >
            {lang === 'ro' ? 'Azi' : 'Today'}
          </button>

          <button 
            onClick={() => setFilterAvailability(filterAvailability === 'this-week' ? 'all' : 'this-week')}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border",
              filterAvailability === 'this-week' 
                ? "bg-brand/5 text-brand border-brand/20 shadow-inner" 
                : "bg-white text-slate-500 border-slate-100"
            )}
          >
            {lang === 'ro' ? 'Săptămâna Asta' : 'This Week'}
          </button>

          <button 
            onClick={() => setFilterVerified(!filterVerified)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border",
              filterVerified 
                ? "bg-brand/5 text-brand border-brand/20 shadow-inner" 
                : "bg-white text-slate-500 border-slate-100"
            )}
          >
            <Shield className={cn("w-3 h-3", filterVerified ? "text-brand" : "text-slate-400")} /> 
            {t('verified')}
          </button>
        </div>
      </div>

      {/* AI Feedback Card */}
      {aiFeedback && (
        <div className="px-6 mt-6">
          <div className="bg-gradient-to-r from-teal-50 to-[#f0f7f6] rounded-2xl p-4 shadow-sm border border-teal-100 flex items-start gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-teal-50">
              <Zap className="w-4 h-4 text-[#2d5a5a]" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-[13px] font-black text-[#1a4d4d] mb-0.5">Closer AI Insight</h4>
              <p className="text-[12px] font-medium text-slate-600 leading-snug">{aiFeedback.message}</p>
              {aiFeedback.estimate && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">Estimated cost: <span className="text-emerald-700">{aiFeedback.estimate}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Price Filter Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lang === 'ro' ? 'Gama de Preț' : 'Price Range'}</h3>
              <button onClick={() => setShowPriceModal(false)} className="p-2 bg-slate-100 rounded-full">
                <ChevronDown className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-8 py-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'ro' ? 'Preț Maxim' : 'Max Price'}</span>
                  <div className="text-3xl font-black text-[#1a4d4d]">£{maxPrice}<span className="text-sm text-slate-400 font-bold">/hr</span></div>
                </div>
                  <button 
                    onClick={() => setMaxPrice(1000)}
                    className="text-[11px] font-bold text-brand uppercase tracking-widest hover:underline"
                  >
                    {lang === 'ro' ? 'Resetare' : 'Reset'}
                  </button>
              </div>

              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1a4d4d]"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>£0</span>
                <span>£500</span>
                <span>£1000+</span>
              </div>
            </div>

            <button 
              onClick={() => setShowPriceModal(false)}
              className="w-full py-4 bg-[#1a4d4d] text-white font-black rounded-2xl mt-6 shadow-lg shadow-teal-900/20 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              {lang === 'ro' ? 'Aplică Filtru' : 'Apply Filter'}
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 p-4 space-y-5">
        {sortedProfessionals.map((pro, index) => (
          <div 
            key={pro.id}
            onClick={() => onViewProfile(pro)}
            className="group bg-white rounded-[28px] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] border border-slate-100/50 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
          >
            {/* Subtle Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Top Row: Image & Info */}
            <div className="flex gap-4 mb-4 relative z-10">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-[22px] overflow-hidden bg-slate-50 shadow-inner border border-slate-100">
                  {pro.img ? (
                    <img src={pro.img} alt={pro.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <UserIcon size={32} />
                    </div>
                  )}
                </div>
                {/* Active Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm" />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-[17px] font-black text-slate-800 truncate tracking-tight">{pro.name}</h3>
                  <div className="text-[18px] font-black text-slate-900 tracking-tighter">
                    £{pro.price}<span className="text-[10px] text-slate-400 font-bold ml-0.5 tracking-normal uppercase">/hr</span>
                  </div>
                </div>
                
                {/* Badges - Premium style */}
                <div className="flex items-center gap-2 mb-3">
                  {index === 0 && surveyAnswers && (
                    <div className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black tracking-widest flex items-center gap-1 border border-emerald-100">
                      <Zap size={10} strokeWidth={3} /> BEST MATCH
                    </div>
                  )}
                  <div className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[9px] font-black tracking-widest flex items-center gap-1 border border-sky-100/50">
                    <CheckCircle2 size={10} strokeWidth={3} /> {t('verified').toUpperCase()}
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[9px] font-black tracking-widest border border-purple-100/50">
                    {lang === 'ro' ? 'CAZIER VERIFICAT' : 'DBS CHECKED'}
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-3 text-[12px]">
                  <div className="flex items-center gap-1 font-black text-slate-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100/50">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {pro.rating} <span className="text-amber-600/60 font-bold">({pro.rc})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-bold">
                    <Zap className="w-3 h-3 text-brand" />
                    <span>{lang === 'ro' ? 'Răspunde' : 'Responds'} <span className="text-slate-800 font-black">{lang === 'ro' ? 'rapid' : 'fast'}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Premium Action Buttons */}
            <div className="flex items-center gap-3 mt-4 relative z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); onViewProfile(pro); }}
                className="flex-1 py-3 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:text-brand transition-colors"
              >
                {t('view_profile')}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onMessage(pro); }}
                className="flex-[1.8] py-3.5 bg-brand text-white rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(45,90,90,0.3)] active:scale-95 transition-all hover:bg-brand-light"
              >
                <MessageSquare size={14} strokeWidth={2.5} /> {lang === 'ro' ? 'Trimite Mesaj' : 'Message Pro'}
              </button>
            </div>
          </div>
        ))}

        {sortedProfessionals.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold">No {categoryTitle.toLowerCase()} found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
