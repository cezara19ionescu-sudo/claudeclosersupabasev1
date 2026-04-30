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
  professionals?: Professional[];
}

export function JobsList({ jobs, isPro, onAction, onChat, onReview, lang = 'en', professionals = PROS }: JobsListProps) {
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
      <div className="bg-[#f4f7f7] min-h-screen px-6 pt-10 pb-24 text-center text-slate-400">
        <Briefcase className="w-10 h-10 mx-auto mb-2.5 text-slate-300" />
        <p className="font-bold text-[15px] text-slate-500">{lang === 'ro' ? 'Niciun serviciu încă' : 'No jobs yet'}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f7] min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-5 pb-7 rounded-b-[34px] shadow-xl relative overflow-hidden sticky top-0 z-20 bg-gradient-to-br from-[#173f3f] via-[#245f5c] to-[#2f8a7f]">
        <div className="absolute -top-20 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -left-16 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14),transparent_42%,rgba(255,255,255,0.08))]" />
        
        <div className="flex items-center justify-between relative z-10 mb-5">
          <div>
            <div className="text-[10px] font-black text-white/55 uppercase tracking-[0.18em] mb-1">Dashboard</div>
            <h1 className="text-[31px] font-black text-white tracking-tight leading-none">{t('my_jobs')}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "w-10 h-10 rounded-2xl border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-black/10",
                showSearch ? "bg-white text-brand" : "bg-white/12 text-white"
              )}
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button className="w-10 h-10 rounded-2xl bg-white/12 border border-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg shadow-black/10">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50 overflow-hidden">
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

        <div className="relative z-10 grid grid-cols-3 gap-2 mb-4 mt-4">
          <div className="rounded-2xl bg-white/12 border border-white/14 backdrop-blur-md px-3 py-2.5">
            <div className="text-[18px] leading-none font-black text-white">{counts.Upcoming}</div>
            <div className="text-[8px] font-black text-white/62 uppercase tracking-[0.12em] mt-1">Active</div>
          </div>
          <div className="rounded-2xl bg-white/12 border border-white/14 backdrop-blur-md px-3 py-2.5">
            <div className="text-[18px] leading-none font-black text-white">{counts.Completed}</div>
            <div className="text-[8px] font-black text-white/62 uppercase tracking-[0.12em] mt-1">{lang === 'ro' ? 'Finalizate' : 'Done'}</div>
          </div>
          <div className="rounded-2xl bg-white/12 border border-white/14 backdrop-blur-md px-3 py-2.5">
            <div className="text-[18px] leading-none font-black text-white">£{stats.spent > 999 ? `${(stats.spent/1000).toFixed(1)}k` : stats.spent}</div>
            <div className="text-[8px] font-black text-white/62 uppercase tracking-[0.12em] mt-1">{lang === 'ro' ? 'Total' : 'Spent'}</div>
          </div>
        </div>

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
      <div className="grid grid-cols-4 gap-2 relative z-10 px-5 py-4 -mt-1">
        {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "h-11 min-w-0 flex items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-black whitespace-nowrap shadow-sm premium-touch border overflow-hidden",
              activeTab === t 
                ? "bg-[#1a4d4d] text-white shadow-[#1a4d4d]/20 border-[#1a4d4d]" 
                : "bg-white/72 backdrop-blur-md text-slate-600 border-white/80"
            )}
          >
            <span className="min-w-0 truncate">
              {t === 'All' ? (lang === 'ro' ? 'Toate' : 'All') : 
               t === 'Upcoming' ? (lang === 'ro' ? 'Active' : 'Active') :
               t === 'Completed' ? (lang === 'ro' ? 'Gata' : 'Done') :
               (lang === 'ro' ? 'Anulate' : 'Cancel')}
            </span>
            <span className={cn(
              "min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center shrink-0",
              activeTab === t ? "bg-white/20 text-white" : "bg-slate-100/85 text-slate-400"
            )}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="px-6 space-y-5 pt-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[18px] font-black text-brand">{lang === 'ro' ? 'Servicii Recente' : 'Recent Jobs'}</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{filteredJobs.length} {lang === 'ro' ? 'rezultate' : 'results'}</p>
          </div>
          <button className="text-[12px] font-black text-brand flex items-center gap-1 bg-white border border-slate-100 px-3 py-2 rounded-full shadow-sm">
            {lang === 'ro' ? 'Vezi Istoric' : 'View History'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filteredJobs.map((j) => {
          const proRole = isPro(j);
          const otherName = proRole ? j.cName : j.pName;
          const statusKey = j.disputed ? 'disputed' : j.status;
          const proIndex = professionals.findIndex(p => p.id === j.pId || p.email === j.pEmail);
          const p = professionals.find(x => x.id === j.pId || x.email === j.pEmail) || {
            id: j.pId,
            name: j.pName,
            email: j.pEmail,
            catId: 'home',
            sub: j.pSub,
            rating: 0,
            rc: 0,
            jobs: 0,
            loc: 'Northampton',
            price: parseFloat(j.price) || 0,
            unit: '',
            v: { id: 0, dbs: 0, ins: 0 },
            about: '',
            svcs: [],
            port: [],
            revs: [],
            slots: []
          } as Professional;
          const avatarColor = AVC[(proIndex >= 0 ? proIndex : 0) % 8];
          const avatarImg = proRole ? null : p?.img;

          return (
            <div 
              key={j.id} 
              className={cn(
                "bg-white rounded-[28px] p-4 mb-4 shadow-xl shadow-slate-200/70 relative overflow-hidden group border premium-card",
                j.isEmergency ? "border-orange-100 bg-orange-50/50" : "border-slate-100"
              )}
            >
              <div className={cn(
                "absolute inset-x-8 top-0 h-1 rounded-b-full z-[1]",
                j.isEmergency ? "bg-orange-500" :
                j.status === 'completed' ? "bg-emerald-500" :
                j.status === 'cancelled' || j.status === 'declined' ? "bg-red-500" :
                "bg-[#1a4d4d]"
              )} />
              <div className="relative z-[2] flex gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div 
                    className="w-14 h-14 rounded-[20px] overflow-hidden bg-white border border-slate-100 shadow-md"
                    style={{ backgroundColor: !avatarImg ? avatarColor : undefined }}
                  >
                    {avatarImg ? (
                      <img src={avatarImg} alt={otherName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
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
                      <h3 className="text-[16px] font-black text-slate-950 truncate pr-1 leading-tight">{otherName}</h3>
                      <div className="inline-flex px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black mt-1">
                        {tSub(j.pSub)}
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 border",
                      j.isEmergency ? "bg-orange-500 text-white" : (
                        j.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        j.status === 'cancelled' || j.status === 'declined' ? "bg-red-50 text-red-600 border-red-100" :
                        j.status === 'hired' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"
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

                  <div className="text-[18px] font-black text-brand mt-1 leading-none">
                    £{j.price}
                  </div>
                </div>
              </div>

              {/* Job Details - Ultra Compact */}
              <div className="relative z-[2] mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2">
                <div className="min-w-0 h-9 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-bold bg-slate-50 rounded-xl px-2">
                  <Calendar className="w-3 h-3 text-brand shrink-0" />
                  <span className="min-w-0 truncate">{j.slot}</span>
                  <span className="text-slate-300">·</span>
                  <span className="shrink-0">{new Date(j.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="min-w-0 h-9 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-bold bg-slate-50 rounded-xl px-2">
                  <MapPin className="w-3 h-3 text-brand shrink-0" />
                  <span className="min-w-0 truncate">{p?.loc.split(',')[0] || 'Northampton'}</span>
                  <span className="text-slate-300">·</span>
                  <span className="shrink-0">2.3 km</span>
                </div>
              </div>

              {/* Review Section - Ultra Compact */}
              {j.status === 'completed' && (
                <div className="mt-2.5 space-y-1.5">
                  {/* Rate Button (only if not yet rated) */}
                  {!(proRole ? j.pRev : j.rev) && (
                    <button 
                      onClick={() => onReview(j)}
                      className="w-full py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-amber-100 transition-all"
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
                            "flex-1 h-9 min-w-0 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                            j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                          )}
                        >
                          <Check className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Acceptă' : 'Accept'}
                        </button>
                        <button 
                          onClick={() => onAction(j.id, 'decline')}
                          className="flex-1 h-9 min-w-0 bg-white border border-red-100 text-red-500 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 active:scale-[0.98] transition-all"
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
                            "flex-1 h-9 min-w-0 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                            j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                          )}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Finalizează' : 'Finish Job'}
                        </button>
                        <button 
                          onClick={() => onChat(p!)}
                          className="flex-1 h-9 min-w-0 bg-white border border-slate-100 text-slate-700 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5" /> {t('message')}
                        </button>
                      </>
                    )}
                    {j.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => onChat(p!)}
                          className="flex-1 h-9 min-w-0 bg-white border border-slate-100 text-slate-700 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5" /> Message
                        </button>
                        <button className="flex-1 h-9 min-w-0 bg-white border border-slate-100 text-slate-700 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all">
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
                            "flex-[1.3] h-9 min-w-0 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                            j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                          )}
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Rezervă iar' : 'Book Again'}
                        </button>
                        <button 
                          onClick={() => onChat(p!)}
                          className="flex-1 h-9 min-w-0 bg-white border border-slate-100 text-slate-700 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5" /> {t('message')}
                        </button>
                        <button className="flex-1 h-9 min-w-0 bg-white border border-slate-100 text-slate-700 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all">
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
                                "flex-1 h-9 min-w-0 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                                j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                              )}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Confirmă Final' : 'Confirm Finish'}
                            </button>
                            <button 
                              onClick={() => onAction(j.id, 'dispute')}
                              className="flex-1 h-9 min-w-0 bg-white border border-red-100 text-red-500 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 active:scale-[0.98] transition-all"
                            >
                              <Shield className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Dispută' : 'Dispute'}
                            </button>
                          </>
                        ) : (
                          <>
                             <button 
                              onClick={() => onAction(j.id, 'reschedule')}
                              className={cn(
                                "flex-[1.3] h-9 min-w-0 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all",
                                j.isEmergency ? "bg-orange-500 text-white shadow-orange-200" : "bg-brand text-white shadow-brand/10"
                              )}
                            >
                              <Calendar className="w-2.5 h-2.5" /> {lang === 'ro' ? 'Reprogramare' : 'Reschedule'}
                            </button>
                            <button 
                              onClick={() => onChat(p!)}
                              className="flex-1 h-9 min-w-0 bg-white border border-slate-100 text-slate-700 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-[0.98] transition-all"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> {t('message')}
                            </button>
                            <button 
                              onClick={() => onAction(j.id, 'cancel')}
                              className="flex-1 h-9 min-w-0 bg-white border border-red-100 text-red-500 rounded-xl px-2 text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 active:scale-[0.98] transition-all"
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
