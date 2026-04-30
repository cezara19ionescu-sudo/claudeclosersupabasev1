import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Star,
  DollarSign,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
  LayoutGrid,
  MapPin,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional, Job } from '../types';

interface ProDashboardProps {
  pro: Professional;
  isEmergencyActive: boolean;
  onToggleEmergency: () => void;
  allJobs: Job[];
  onEditProfile: () => void;
  onViewProfile: () => void;
  onTabChange: (tab: number) => void;
  lang: 'en' | 'ro';
}

const ProDashboard: React.FC<ProDashboardProps> = ({
  pro,
  isEmergencyActive,
  onToggleEmergency,
  allJobs,
  onEditProfile,
  onViewProfile,
  onTabChange,
  lang
}) => {
  const proJobs = allJobs.filter(job => job.pId === pro.id || job.pEmail === pro.email);
  const totalEarnings = proJobs
    .filter(job => job.status === 'completed')
    .reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);

  const activeJobs = proJobs.filter(job => ['hired', 'active', 'finish_requested'].includes(job.status)).length;
  const completedJobs = proJobs.filter(job => job.status === 'completed').length;
  const conversations = proJobs.length;
  const verified = Boolean(pro.v?.id || pro.v?.dbs || pro.v?.ins);
  const [performancePeriod, setPerformancePeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const copy = {
    en: {
      welcome: 'Welcome back,',
      online: 'Online',
      publicShort: 'Public',
      emergency_mode: 'Emergency Mode',
      emergency_desc: 'Visible for urgent client requests',
      earnings: 'Earnings',
      active_jobs: 'Active',
      done: 'Done',
      conversations: 'Chats',
      rating: 'Rating',
      new_leads: 'Matching requests',
      distance: 'km away',
      view_lead: 'View',
      profile_strength: 'Profile strength',
      profile_hint: 'Complete the details clients use before hiring',
      performance: 'Weekly performance',
      performance_hint: 'Real activity from this week',
      period_day: 'Today',
      period_week: 'This week',
      period_month: 'This month',
      period_year: 'This year',
      profile: 'Profile',
      this_week: 'This week',
      verified: 'Verified',
      not_verified: 'Needs review',
      response_time: 'Response',
      top_match: 'Best match',
    },
    ro: {
      welcome: 'Bine ai revenit,',
      online: 'Online',
      publicShort: 'Public',
      emergency_mode: 'Mod Urgenta',
      emergency_desc: 'Vizibil pentru clienti cu cereri urgente',
      earnings: 'Venituri',
      active_jobs: 'Active',
      done: 'Finalizate',
      conversations: 'Chat',
      rating: 'Rating',
      new_leads: 'Cereri potrivite',
      distance: 'km distanta',
      view_lead: 'Vezi',
      profile_strength: 'Puterea Profilului',
      profile_hint: 'Completeaza detaliile pe care clientii le verifica inainte sa aleaga',
      performance: 'Performanta saptamanii',
      performance_hint: 'Activitate reala din saptamana asta',
      period_day: 'Azi',
      period_week: 'Saptamana asta',
      period_month: 'Luna asta',
      period_year: 'Anul asta',
      profile: 'Profil',
      this_week: 'Saptamana asta',
      verified: 'Verificat',
      not_verified: 'De verificat',
      response_time: 'Raspuns',
      top_match: 'Best match',
    }
  }[lang];

  const profileTasks = [
    { done: Boolean(pro.img), label: lang === 'ro' ? 'Poza profil' : 'Profile photo' },
    { done: Boolean(pro.about && pro.about.length > 40), label: lang === 'ro' ? 'Descriere' : 'Description' },
    { done: Boolean(pro.port?.length), label: lang === 'ro' ? 'Portofoliu' : 'Portfolio' },
    { done: Boolean(pro.svcs?.length > 1), label: lang === 'ro' ? 'Servicii' : 'Services' },
    { done: verified, label: lang === 'ro' ? 'Verificare' : 'Verification' },
  ];

  const profileStrength = Math.round((profileTasks.filter(task => task.done).length / profileTasks.length) * 100);
  const missingTasks = profileTasks.filter(task => !task.done).slice(0, 3);
  const periodOptions = [
    { key: 'day' as const, label: copy.period_day },
    { key: 'week' as const, label: copy.period_week },
    { key: 'month' as const, label: copy.period_month },
    { key: 'year' as const, label: copy.period_year },
  ];
  const currentPeriodLabel = periodOptions.find(option => option.key === performancePeriod)?.label || copy.period_week;
  const periodStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (performancePeriod === 'week') {
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    }
    if (performancePeriod === 'month') {
      start.setDate(1);
    }
    if (performancePeriod === 'year') {
      start.setMonth(0, 1);
    }
    return start;
  }, [performancePeriod]);
  const periodJobs = proJobs.filter(job => {
    const created = new Date(job.created);
    return Number.isFinite(created.getTime()) && created >= periodStart;
  });
  const completedInPeriod = periodJobs.filter(job => job.status === 'completed').length;
  const activeInPeriod = periodJobs.filter(job => ['hired', 'active', 'finish_requested'].includes(job.status)).length;
  const revenueInPeriod = periodJobs
    .filter(job => job.status === 'completed')
    .reduce((acc, job) => acc + (parseFloat(job.price) || 0), 0);

  const mockLeads = [
    { id: 'l1', type: pro.sub || 'Electrician', dist: '1.2', budget: '£150-200', desc: lang === 'ro' ? 'Client nou in zona ta' : 'New client near you' },
    { id: 'l2', type: pro.svcs?.[0] || 'Home repair', dist: '4.5', budget: '£80+', desc: lang === 'ro' ? 'Cerere fara oferta inca' : 'No offer yet' },
  ];

  return (
    <div className="bg-[#f4f7f7] min-h-screen pb-32 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#173f3f] via-[#235d5a] to-[#2f8a7f] px-5 pt-5 pb-6 rounded-b-[30px] shadow-2xl shadow-teal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-[22px] border border-white/25 overflow-hidden shadow-xl bg-white/10 shrink-0">
            {pro.img ? (
              <img src={pro.img} className="w-full h-full object-cover" alt={pro.name} />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-white text-xl font-black">P</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-white/60 text-[10px] font-black uppercase tracking-[0.18em] leading-none mb-1">{copy.welcome}</div>
            <div className="text-[22px] font-black text-white tracking-tight leading-none truncate">{pro.name}</div>
            <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/12 border border-white/15 text-white/85 text-[9px] font-black uppercase shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {copy.online}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/12 border border-white/15 text-white/85 text-[9px] font-black uppercase shrink-0">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {pro.rating || '5.0'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/12 border border-white/15 text-white/85 text-[9px] font-black uppercase shrink-0">
                <ShieldCheck className="w-3 h-3" /> {verified ? copy.verified : copy.not_verified}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 mt-5 rounded-[24px] bg-white/10 border border-white/14 backdrop-blur-md p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <div className="min-w-0 flex-1 grid grid-cols-3 divide-x divide-white/12">
            {[
              { value: activeJobs, label: copy.active_jobs },
              { value: `£${totalEarnings}`, label: copy.earnings },
              { value: pro.responseTime || '15 min', label: copy.response_time },
            ].map((stat) => (
              <div key={stat.label} className="h-10 min-w-0 px-2 flex flex-col justify-center">
                <div className="text-[15px] leading-none font-black text-white truncate">{stat.value}</div>
                <div className="text-[7px] font-black text-white/58 uppercase tracking-[0.12em] mt-1 truncate">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 relative z-20 space-y-4">
        <div className="rounded-[26px] bg-gradient-to-br from-[#173f3f] via-[#245f5c] to-[#2f8a7f] p-4 shadow-xl shadow-teal-900/20 border border-white/40 overflow-hidden relative">
          <div className="absolute -top-16 -right-12 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[15px] font-black text-white">{copy.performance}</div>
              <div className="text-[10px] font-bold text-white/55 mt-0.5">{copy.performance_hint}</div>
            </div>
            <div className="flex rounded-full bg-white/10 border border-white/14 p-0.5 shrink-0">
              {periodOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => setPerformancePeriod(option.key)}
                  className={cn(
                    'h-7 px-2 rounded-full text-[8px] font-black uppercase tracking-[0.08em] transition-all',
                    performancePeriod === option.key ? 'bg-white text-[#1a4d4d] shadow-sm' : 'text-white/65'
                  )}
                >
                  {option.key === 'day' ? (lang === 'ro' ? 'Zi' : 'Day') : option.key === 'week' ? (lang === 'ro' ? 'Sapt' : 'Week') : option.key === 'month' ? (lang === 'ro' ? 'Luna' : 'Month') : (lang === 'ro' ? 'An' : 'Year')}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mb-3 text-[10px] font-black text-white/62 uppercase tracking-[0.14em]">{currentPeriodLabel}</div>
          <div className="relative grid grid-cols-4 gap-2">
            {[
              { value: `${profileStrength}%`, label: copy.profile },
              { value: `+${completedInPeriod}`, label: copy.done },
              { value: activeInPeriod, label: copy.active_jobs },
              { value: `£${revenueInPeriod}`, label: copy.earnings },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/12 border border-white/14 px-2.5 py-2">
                <div className="text-[15px] font-black text-white leading-none truncate">{item.value}</div>
                <div className="text-[7px] font-black text-white/58 uppercase tracking-[0.1em] mt-1 truncate">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onViewProfile}
          className="w-full h-13 rounded-[24px] bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/70 px-4 flex items-center justify-between active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#1a4d4d] flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-[15px] font-black text-slate-950 truncate">{lang === 'ro' ? 'Vezi profilul public' : 'View public profile'}</div>
              <div className="text-[11px] font-bold text-slate-400 truncate">{lang === 'ro' ? 'Asa te vad clientii' : 'See what clients see'}</div>
            </div>
          </div>
          <div className="text-[10px] font-black text-[#1a4d4d] uppercase tracking-[0.12em]">{copy.publicShort}</div>
        </button>

        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[28px] shadow-xl shadow-slate-200/70 border border-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[17px] font-black text-slate-950">{copy.profile_strength}</h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-1 leading-snug">{copy.profile_hint}</p>
            </div>
            <div className="text-[26px] font-black text-[#1a4d4d] leading-none">{profileStrength}%</div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-[#1a4d4d] to-[#13b89b] rounded-full transition-all" style={{ width: `${profileStrength}%` }} />
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            {(missingTasks.length ? missingTasks : [{ label: copy.verified, done: true }]).map((task) => (
              <button key={task.label} onClick={onEditProfile} className="px-3 h-8 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 whitespace-nowrap">
                {missingTasks.length ? `+ ${task.label}` : task.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: CheckCircle2, value: completedJobs, label: copy.done, tint: 'from-emerald-400/18 to-teal-500/10', color: 'text-emerald-700' },
            { icon: Briefcase, value: conversations, label: copy.conversations, tint: 'from-[#1a4d4d]/16 to-teal-400/10', color: 'text-[#1a4d4d]' },
            { icon: Star, value: pro.rating || '5.0', label: copy.rating, tint: 'from-amber-300/20 to-teal-300/10', color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className={cn(
              'relative overflow-hidden rounded-[22px] border border-white/80 bg-white/68 backdrop-blur-xl shadow-[0_18px_36px_-28px_rgba(15,23,42,0.85)] p-3 text-center min-w-0',
              'before:absolute before:inset-0 before:bg-gradient-to-br before:pointer-events-none',
              stat.tint
            )}>
              <div className={cn('relative w-9 h-9 rounded-2xl mx-auto flex items-center justify-center mb-2 bg-white/58 border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]', stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="relative text-[16px] font-black text-[#173f3f] leading-none truncate">{stat.value}</div>
              <div className="relative text-[8px] font-black text-[#1a4d4d]/58 uppercase tracking-[0.08em] mt-1 truncate">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={cn(
          'rounded-[26px] p-4 transition-all duration-500 border shadow-xl flex items-center justify-between',
          isEmergencyActive
            ? 'bg-orange-500 border-orange-400 shadow-orange-900/15'
            : 'bg-white border-slate-100 shadow-slate-200/70'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', isEmergencyActive ? 'bg-white text-orange-500' : 'bg-orange-50 text-orange-500')}>
              <Zap className={cn('w-5 h-5', isEmergencyActive && 'fill-current')} />
            </div>
            <div className="min-w-0">
              <div className={cn('text-[15px] font-black', isEmergencyActive ? 'text-white' : 'text-slate-950')}>{copy.emergency_mode}</div>
              <div className={cn('text-[11px] font-bold truncate', isEmergencyActive ? 'text-white/75' : 'text-slate-400')}>{copy.emergency_desc}</div>
            </div>
          </div>
          <button
            onClick={onToggleEmergency}
            className={cn('w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner border-2 shrink-0', isEmergencyActive ? 'bg-white border-orange-400' : 'bg-slate-100 border-slate-200')}
          >
            <div className={cn('w-5 h-5 rounded-full absolute top-1 transition-all duration-300 shadow-md', isEmergencyActive ? 'left-7 bg-orange-500' : 'left-1 bg-white')} />
          </button>
        </div>

        <section className="pt-3 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-2 h-6 bg-orange-500 rounded-full" />
              {copy.new_leads}
            </h3>
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black">LIVE</span>
          </div>

          <div className="space-y-3">
            {mockLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white/90 backdrop-blur-xl p-4 rounded-[24px] shadow-lg shadow-slate-200/60 border border-white flex items-center justify-between gap-3 pr-16"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-black text-slate-950 leading-tight truncate">{lead.type}</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#1a4d4d] text-[8px] font-black uppercase shrink-0">{copy.top_match}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 truncate">{lead.desc}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <MapPin className="w-3 h-3 text-orange-500" /> {lead.dist} {copy.distance}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <DollarSign className="w-3 h-3" /> {lead.budget}
                    </div>
                  </div>
                </div>
                <button onClick={() => onTabChange(1)} className="h-10 px-4 rounded-2xl bg-slate-950 text-white text-[11px] font-black active:scale-95 transition-all">
                  {copy.view_lead}
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProDashboard;
