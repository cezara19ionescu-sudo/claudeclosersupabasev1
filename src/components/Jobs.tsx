import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  Check, 
  MessageSquare, 
  Star, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  DollarSign, 
  Heart,
  CheckCircle2,
  MapPin,
  RotateCcw,
  FileText,
  XCircle,
  Edit3,
  Shield
} from 'lucide-react';
import { Job, Professional } from '../types';
import { STC, STL, AVC, AVE, PROS } from '../constants';
import { cn } from '../lib/utils';
import { translations, Language } from '../utils/translations';

interface JobsListProps {
  jobs: Job[];
  isPro: (job: Job) => boolean;
  onAction: (jid: string, act: string) => void;
  onChat: (pro: Professional) => void;
  onReview: (job: Job) => void;
  lang?: Language;
}

export function JobsList({ jobs, isPro, onAction, onChat, onReview, lang = 'en' }: JobsListProps) {
  const t = (key: keyof typeof translations['en']) => (translations[lang] as any)[key] || key;
  const tSub = (sub: string) => (translations[lang] as any).subs?.[sub] || sub;
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');

  const stats = useMemo(() => {
    const completed = jobs.filter(j => j.status === 'completed');
    const totalSpent = completed.reduce((acc, j) => acc + (parseFloat(j.price) || 0), 0);
    const avgRating = completed.reduce((acc, j) => acc + (j.rev?.rating || 0), 0) / (completed.filter(j => j.rev).length || 1);
    
    return {
      completed: completed.length,
      spent: totalSpent,
      rating: avgRating || 0,
      favourites: 8 // Mocked as per prompt
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let list = [...jobs];
    
    // Tab filtering
    if (activeTab === 'Upcoming') list = list.filter(j => ['hired', 'active', 'finish_requested'].includes(j.status));
    else if (activeTab === 'Completed') list = list.filter(j => j.status === 'completed');
    else if (activeTab === 'Cancelled') list = list.filter(j => ['cancelled', 'declined'].includes(j.status));
    
    // Search filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(j => 
        j.pName.toLowerCase().includes(q) || 
        j.cName.toLowerCase().includes(q) || 
        j.pSub.toLowerCase().includes(q) ||
        j.desc.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'price') return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === 'name') return (isPro(a) ? a.cName : a.pName).localeCompare(isPro(b) ? b.cName : b.pName);
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

    return list;
  }, [jobs, activeTab, searchQuery, sortBy, isPro]);

  const counts = useMemo(() => ({
    All: jobs.length,
    Upcoming: jobs.filter(j => ['hired', 'active', 'finish_requested'].includes(j.status)).length,
    Completed: jobs.filter(j => j.status === 'completed').length,
    Cancelled: jobs.filter(j => ['cancelled', 'declined'].includes(j.status)).length,
  }), [jobs]);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 px-5 text-slate-400">
        <Briefcase className="w-10 h-10 mx-auto mb-2.5 text-slate-300" />
        <p className="font-bold text-[15px] text-slate-500">{lang === 'ro' ? 'Niciun serviciu încă' : 'No jobs yet'}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fcfb] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a] px-6 pt-5 pb-12 rounded-b-[40px] shadow-xl shadow-teal-900/20 relative overflow-hidden sticky top-0 z-20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
        
        <div className="flex items-center justify-between relative z-10 mb-1">
          <h1 className="text-[32px] font-black text-white tracking-tight">{t('my_jobs')}</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform",
                showSearch ? "bg-white text-brand" : "bg-white/10"
              )}
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-bottom border-slate-50">{lang === 'ro' ? 'Sortează după' : 'Sort By'}</div>
                {(['date', 'price', 'name'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors",
                      sortBy === s ? "text-brand bg-slate-50" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {s === 'date' ? (lang === 'ro' ? 'Dată' : 'Date') : s === 'price' ? (lang === 'ro' ? 'Preț' : 'Price') : (lang === 'ro' ? 'Nume' : 'Name')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-[15px] text-white/70 font-medium relative z-10 mb-2">{lang === 'ro' ? 'Urmărește, evaluează și rezervă din nou' : 'Track, review and book again'}</p>

        {showSearch && (
          <div className="relative z-10 mb-2 animate-in slide-in-from-top duration-200">
            <input 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ro' ? 'Caută servicii după nume sau serviciu...' : 'Search jobs by name or service...'}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 text-sm outline-none focus:bg-white/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs - Moved below header */}
      <div className="flex items-center gap-2 relative z-10 overflow-x-auto scrollbar-hide px-6 py-4 -mt-2">
        {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap shadow-sm premium-touch",
              activeTab === t 
                ? "bg-[#1a4d4d] text-white shadow-[#1a4d4d]/20" 
                : "bg-white text-slate-600 border border-slate-100"
            )}
          >
            {t === 'All' ? (lang === 'ro' ? 'Toate' : 'All Jobs') : 
             t === 'Upcoming' ? (lang === 'ro' ? 'Viitoare' : 'Upcoming') :
             t === 'Completed' ? (lang === 'ro' ? 'Finalizate' : 'Completed') :
             (lang === 'ro' ? 'Anulate' : 'Cancelled')}
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[9px] font-black",
              activeTab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
            )}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="px-6 space-y-6 pt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-black text-brand">{lang === 'ro' ? 'Servicii Recente' : 'Recent Jobs'}</h2>
          <button className="text-[13px] font-bold text-brand flex items-center gap-1">
            {lang === 'ro' ? 'Vezi Istoric' : 'View History'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filteredJobs.map((j) => {
          const proRole = isPro(j);
          const otherName = proRole ? j.cName : j.pName;
          const statusKey = j.disputed ? 'disputed' : j.status;
          const proIndex = PROS.findIndex(p => p.id === j.pId);
          const p = PROS.find(x => x.id === j.pId);
          const avatarColor = AVC[(proIndex >= 0 ? proIndex : 0) % 8];
          const avatarImg = proRole ? null : p?.img;

          return (
            <div 
              key={j.id} 
              className={cn(
                "bg-white rounded-[15px] p-4 mb-4 shadow-[0_4px_15px_rgba(45,90,80,0.15)] relative overflow-hidden group border border-transparent premium-card",
                j.isEmergency ? "border-orange-200 shadow-orange-100 bg-orange-50/30" : "hover:border-[#2D5A50]/20"
              )}
            >
              <div className="flex gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div 
                    className="w-12 h-12 rounded-[16px] overflow-hidden bg-slate-100 border-2 border-white shadow-sm"
                    style={{ backgroundColor: !avatarImg ? avatarColor : undefined }}
                  >
                    {avatarImg ? (
                      <img src={avatarImg} alt={otherName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        {proRole ? '👤' : AVE[(proIndex >= 0 ? proIndex : 0) % 8]}
                      </div>
                    )}
                  </div>
                  {p?.v.id === 1 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] font-black text-brand truncate pr-1">{otherName}</h3>
                      <div className="inline-flex px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[8px] font-bold mt-0.5">
                        {tSub(j.pSub)}
                      </div>
                    </div>
                    <div className={cn(
                      "px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shrink-0",
                      j.isEmergency ? "bg-orange-500 text-white" : (
                        j.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                        j.status === 'cancelled' || j.status === 'declined' ? "bg-red-50 text-red-600" :
                        j.status === 'hired' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      )
                    )}>
                      {j.isEmergency ? 'URGENT' : (lang === 'ro' ? (statusKey === 'completed' ? 'FINALIZAT' : statusKey === 'cancelled' ? 'ANULAT' : statusKey === 'hired' ? 'ANGAJAT' : 'ACTIV') : STL[statusKey])}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-2 h-2", i < (p?.rating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200")} />
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-brand ml-0.5">{p?.rating || 0}</span>
                  </div>

                  <div className="text-[14px] font-black text-brand mt-0.5">
                    £{j.price}
                  </div>
                </div>
              </div>

              {/* Job Details - Ultra Compact */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex flex-wrap gap-x-2.5 gap-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <Calendar className="w-2.5 h-2.5 text-slate-400" />
                  <span>{j.slot}</span>
                  <span className="text-slate-300">·</span>
                  <span>{new Date(j.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  <span>{p?.loc.split(',')[0] || 'Northampton'}</span>
                  <span className="text-slate-300">·</span>
                  <span>2.3 km</span>
                </div>
              </div>

              {/* Review Section - Ultra Compact */}
              {j.status === 'completed' && (
                <div className="mt-2.5 space-y-1.5">
                  {/* Rate Button (only if not yet rated) */}
                  {!(proRole ? j.pRev : j.rev) && (
                    <button 
                      onClick={() => onReview(j)}
                      className="w-full py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-amber-100 transition-all"
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> 
                       {proRole ? (lang === 'ro' ? 'Evaluează Clientul' : 'Rate Client') : (lang === 'ro' ? 'Evaluează Profesionistul' : 'Rate Professional')}
                    </button>
                  )}

                  {/* Received Review (Feedback from the other party) */}
                  {(proRole ? j.rev : j.pRev) && (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          {proRole ? (lang === 'ro' ? 'Feedback de la Client' : 'Feedback from Client') : (lang === 'ro' ? 'Feedback de la Profesionist' : 'Feedback from Professional')}
                        </h4>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-2 h-2", i < ((proRole ? j.rev : j.pRev)?.rating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic line-clamp-1">
                        "{(proRole ? j.rev : j.pRev)?.text}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions - Ultra Small Buttons */}
              <div className="mt-3 flex gap-1.5">
                {proRole ? (
                  // PROFESSIONAL ACTIONS
                  <>
                    {j.status === 'hired' && (
                      <>
                        <button 
                          onClick={() => onAction(j.id, 'accept')}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                            j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                          )}
                        >
                          <Check className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Acceptă' : 'Accept'}
                        </button>
                        <button 
                          onClick={() => onAction(j.id, 'decline')}
                          className="flex-1 py-1.5 bg-white border border-red-50 text-red-500 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 active:scale-[0.98] transition-all"
                        >
                          <XCircle className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Refuză' : 'Decline'}
                        </button>
                      </>
                    )}
                    {j.status === 'active' && (
                      <>
                        <button 
                          onClick={() => onAction(j.id, 'fin-p')}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                            j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                          )}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Finalizează' : 'Finish Job'}
                        </button>
                        <button 
                          onClick={() => onChat(p!)}
                          className="flex-1 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5" /> {t('message')}
                        </button>
                      </>
                    )}
                    {j.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => onChat(p!)}
                          className="flex-1 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5" /> Message
                        </button>
                        <button className="flex-1 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all">
                          <FileText className="w-2.5 h-2.5" /> Invoice
                        </button>
                      </>
                    )}
                    {['cancelled', 'declined'].includes(j.status) && (
                      <div className="flex-1 py-1.5 text-center text-[10px] font-bold text-slate-400 italic">
                        {lang === 'ro' ? 'Serviciu' : 'Job'} {lang === 'ro' ? (j.status === 'cancelled' ? 'anulat' : 'refuzat') : j.status}
                      </div>
                    )}
                  </>
                ) : (
                  // CLIENT ACTIONS
                  <>
                    {j.status === 'completed' ? (
                      <>
                        <button 
                          onClick={() => onAction(j.id, 'book_again')}
                          className={cn(
                            "flex-[1.3] py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                            j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                          )}
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Rezervă iar' : 'Book Again'}
                        </button>
                        <button 
                          onClick={() => onChat(p!)}
                          className="flex-1 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5" /> {t('message')}
                        </button>
                        <button className="flex-1 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all">
                          <FileText className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Factură' : 'Invoice'}
                        </button>
                      </>
                    ) : (
                      <>
                        {j.status === 'finish_requested' ? (
                          <>
                            <button 
                              onClick={() => onAction(j.id, 'fin-c')}
                              className={cn(
                                "flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                                j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                              )}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Confirmă Final' : 'Confirm Finish'}
                            </button>
                            <button 
                              onClick={() => onAction(j.id, 'dispute')}
                              className="flex-1 py-1.5 bg-white border border-red-50 text-red-500 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 active:scale-[0.98] transition-all"
                            >
                              <Shield className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Dispută' : 'Dispute'}
                            </button>
                          </>
                        ) : (
                          <>
                             <button 
                              onClick={() => onAction(j.id, 'reschedule')}
                              className={cn(
                                "flex-[1.3] py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                                j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                              )}
                            >
                              <Calendar className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Reprogramare' : 'Reschedule'}
                            </button>
                            <button 
                              onClick={() => onChat(p!)}
                              className="flex-1 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> {t('message')}
                            </button>
                            <button 
                              onClick={() => onAction(j.id, 'cancel')}
                              className="flex-1 py-1.5 bg-white border border-red-50 text-red-500 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 active:scale-[0.98] transition-all"
                            >
                              <XCircle className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Anulează' : 'Cancel'}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Stats Dashboard - Moved to Bottom */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-black text-brand">{lang === 'ro' ? 'Activitatea Ta' : 'Your Activity'}</h2>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { icon: Briefcase, label: lang === 'ro' ? 'Servicii' : 'Jobs', value: stats.completed, color: 'text-brand' },
              { icon: DollarSign, label: lang === 'ro' ? 'Cheltuit' : 'Spent', value: `£${stats.spent > 999 ? (stats.spent/1000).toFixed(1)+'k' : stats.spent}`, color: 'text-slate-700' },
              { icon: Star, label: lang === 'ro' ? 'Rating' : 'Rating', value: stats.rating.toFixed(1), color: 'text-amber-500' },
              { icon: Heart, label: lang === 'ro' ? 'Favs' : 'Favs', value: stats.favourites, color: 'text-red-500' }
            ].map((s, i) => (
              <div key={i} className="bg-white aspect-square rounded-[20px] shadow-sm border border-slate-50 flex flex-col items-center justify-center p-2 transition-transform active:scale-95">
                <div className={cn("w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-1.5", s.color)}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="text-[13px] font-black text-brand leading-none">{s.value}</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
