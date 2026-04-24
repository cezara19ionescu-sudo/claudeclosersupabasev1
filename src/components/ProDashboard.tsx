import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Star, 
  DollarSign, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Briefcase,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  LayoutGrid
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
  // Calculate mock earnings and stats
  const totalEarnings = allJobs
    .filter(j => j.pId === pro.id && j.status === 'completed')
    .reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);

  const successScore = 98; // Mock success score
  const activeJobs = allJobs.filter(j => j.pId === pro.id && ['hired', 'active', 'finish_requested'].includes(j.status)).length;

  const t = (key: string) => {
    const translations = {
      en: {
        welcome: 'Welcome back,',
        emergency_mode: 'Emergency Mode',
        emergency_desc: 'Be visible to "I Need Help Now" requests',
        success_score: 'Job Success',
        earnings: 'Total Earnings',
        top_rated: 'Top Rated Pro',
        active_jobs: 'Active Jobs',
        new_leads: 'New Potential Leads',
        distance: 'km away',
        view_lead: 'View Lead',
        quick_actions: 'Quick Actions',
        edit_profile: 'Update Profile',
        manage_jobs: 'Manage Jobs',
        view_storefront: 'View Storefront'
      },
      ro: {
        welcome: 'Bine ai revenit,',
        emergency_mode: 'Mod Urgență',
        emergency_desc: 'Fii vizibil pentru cererile "Am nevoie acum"',
        success_score: 'Succes Job-uri',
        earnings: 'Venituri Totale',
        top_rated: 'Profesionist de Top',
        active_jobs: 'Job-uri Active',
        new_leads: 'Cereri Noi în Apropiere',
        distance: 'km distanță',
        view_lead: 'Vezi Cererea',
        quick_actions: 'Acțiuni Rapide',
        edit_profile: 'Actualizează Profilul',
        manage_jobs: 'Gestionare Job-uri',
        view_storefront: 'Vezi Prezentarea'
      }
    };
    return translations[lang][key as keyof typeof translations['en']] || key;
  };

  const mockLeads = [
    { id: 'l1', type: 'Burst Pipe', dist: '1.2', time: '2m ago', budget: '£150-200' },
    { id: 'l2', type: 'Full Bathroom Renovation', dist: '4.5', time: '15m ago', budget: '£2,500+' },
    { id: 'l3', type: 'Drain Unblocking', dist: '3.1', time: '1h ago', budget: '£80' },
  ];

  return (
    <div className="bg-[#f8fbfb] min-h-screen pb-32 animate-in fade-in duration-500">
      {/* Premium Command Header */}
      <div className="bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a] px-6 pt-6 pb-16 rounded-b-[40px] shadow-2xl shadow-teal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="flex items-center justify-between relative z-10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl">
              {pro.img ? (
                <img src={pro.img} className="w-full h-full object-cover" alt={pro.name} />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-xl">👤</div>
              )}
            </div>
            <div>
              <div className="text-white/60 text-[11px] font-black uppercase tracking-widest leading-none mb-1">{t('welcome')}</div>
              <div className="text-xl font-black text-white tracking-tight leading-none">{pro.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white relative">
              <Clock className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Emergency Control Center */}
        <div className={cn(
          "relative z-10 rounded-[28px] p-5 transition-all duration-500 border",
          isEmergencyActive 
            ? "bg-orange-500 border-orange-400 shadow-xl shadow-orange-900/20" 
            : "bg-white/5 backdrop-blur-md border-white/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                isEmergencyActive ? "bg-white text-orange-500" : "bg-white/10 text-white"
              )}>
                <Zap className={cn("w-6 h-6", isEmergencyActive && "fill-current")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[17px] font-black tracking-tight", isEmergencyActive ? "text-white" : "text-white")}>
                  {t('emergency_mode')}
                </div>
                <div className={cn("text-[11px] font-bold leading-tight", isEmergencyActive ? "text-white/80" : "text-white/40")}>
                  {t('emergency_desc')}
                </div>
              </div>
            </div>
            <button 
              onClick={onToggleEmergency}
              className={cn(
                "w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner border-2",
                isEmergencyActive ? "bg-white border-orange-400" : "bg-slate-700/50 border-white/10"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full absolute top-1 transition-all duration-300 shadow-md",
                isEmergencyActive ? "left-7 bg-orange-500" : "left-1 bg-white"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Gamified Stats Grid */}
      <div className="px-5 -mt-8 relative z-20 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white p-5 rounded-[32px] shadow-xl shadow-black/5 border border-slate-50 relative overflow-hidden cursor-pointer premium-touch"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="w-16 h-16" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1">{successScore}%</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('success_score')}</div>
            <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" /> +2% this week
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white p-5 rounded-[32px] shadow-xl shadow-black/5 border border-slate-50 relative overflow-hidden cursor-pointer premium-touch"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Trophy className="w-16 h-16" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1">Top</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('top_rated')}</div>
            <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500">
              <ShieldCheck className="w-3 h-3" /> Verified Status
            </div>
          </motion.div>
        </div>

        {/* Earnings Card */}
        <div className="bg-[#1a4d4d] p-6 rounded-[32px] shadow-2xl shadow-teal-900/20 text-white relative overflow-hidden premium-touch cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">{t('earnings')}</div>
              <div className="text-4xl font-black tracking-tight leading-none">£{totalEarnings.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[75%] rounded-full" />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-white/40">Goal: £5,000</span>
                <span className="text-[10px] font-bold text-white/80">75%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black leading-none">{activeJobs}</div>
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{t('active_jobs')}</div>
            </div>
          </div>
        </div>

        {/* Real-time Leads Section */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-2 h-6 bg-orange-500 rounded-full" />
              {t('new_leads')}
            </h3>
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            {mockLeads.map((lead, idx) => (
              <motion.div 
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group hover:border-orange-200 premium-card cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900 leading-tight">{lead.type}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{lead.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <MapPin className="w-3 h-3 text-orange-500" /> {lead.dist} {t('distance')}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <DollarSign className="w-3 h-3" /> {lead.budget}
                    </div>
                  </div>
                </div>
                <button className="bg-slate-50 group-hover:bg-orange-500 group-hover:text-white px-4 py-2 rounded-xl text-[11px] font-black premium-btn">
                  {t('view_lead')}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="pt-4 pb-8">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">{t('quick_actions')}</h3>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={onEditProfile}
              className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-50 flex flex-col items-center gap-2 premium-card premium-touch"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-slate-600 text-center leading-tight">{t('edit_profile')}</span>
            </button>
            <button 
              onClick={() => onTabChange(1)}
              className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-50 flex flex-col items-center gap-2 premium-card premium-touch"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-slate-600 text-center leading-tight">{t('manage_jobs')}</span>
            </button>
            <button 
              onClick={onViewProfile}
              className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-50 flex flex-col items-center gap-2 premium-card premium-touch"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-slate-600 text-center leading-tight">{t('view_storefront')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProDashboard;
