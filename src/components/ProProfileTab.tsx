import React from 'react';
import {
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Eye,
  Globe,
  LogOut,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Job, Professional, User } from '../types';

interface ProProfileTabProps {
  user: User;
  pro: Professional | null;
  lang: 'en' | 'ro';
  myJobs: Job[];
  unreadMsgs: number;
  pendingCnt: number;
  isEmergencyActive: boolean;
  isAdmin: boolean;
  onToggleEmergency: () => void;
  onViewProfile: () => void;
  onEditProfile: () => void;
  onNotifications: () => void;
  onPrivacy: () => void;
  onHelp: () => void;
  onBoost: () => void;
  onAdmin: () => void;
  onLogout: () => void;
  onLanguage: () => void;
  onJobs: () => void;
}

export function ProProfileTab({
  user,
  pro,
  lang,
  myJobs,
  unreadMsgs,
  pendingCnt,
  isEmergencyActive,
  isAdmin,
  onToggleEmergency,
  onViewProfile,
  onEditProfile,
  onNotifications,
  onPrivacy,
  onHelp,
  onBoost,
  onAdmin,
  onLogout,
  onLanguage,
  onJobs,
}: ProProfileTabProps) {
  const completedJobs = myJobs.filter(job => job.status === 'completed').length;
  const activeJobs = myJobs.filter(job => ['hired', 'active', 'finish_requested'].includes(job.status)).length;
  const earnings = myJobs
    .filter(job => job.status === 'completed')
    .reduce((acc, job) => acc + (parseFloat(job.price) || 0), 0);
  const verified = Boolean(pro?.v?.id || pro?.v?.dbs || pro?.v?.ins);

  const copy = {
    en: {
      eyebrow: 'Professional Account',
      title: 'Profile',
      subtitle: 'Control how clients see and book you',
      publicProfile: 'Public Profile',
      publicShort: 'Public',
      editProfile: 'Edit Profile',
      active: 'Active',
      earned: 'Earned',
      rating: 'Rating',
      emergencyMode: 'Emergency Mode',
      emergencyDesc: 'Visible for urgent requests',
      quickActions: 'Quick Actions',
      manageJobs: 'Manage Jobs',
      admin: 'Admin Panel',
      adminDesc: 'Requests, offers, pros and jobs',
      account: 'Account',
      notifications: 'Notifications',
      notificationsDesc: 'Messages and booking alerts',
      language: 'Language',
      business: 'Business Settings',
      privacy: 'Privacy & Security',
      boost: 'Boost Profile',
      help: 'Help & Support',
      verified: 'Verified',
      review: 'Needs review',
      signOut: 'Sign Out',
    },
    ro: {
      eyebrow: 'Cont Profesionist',
      title: 'Profil',
      subtitle: 'Controleaza cum te vad si cum te aleg clientii',
      publicProfile: 'Profil Public',
      publicShort: 'Public',
      editProfile: 'Editeaza Profil',
      active: 'Active',
      earned: 'Castigat',
      rating: 'Rating',
      emergencyMode: 'Mod Urgenta',
      emergencyDesc: 'Vizibil pentru cereri urgente',
      quickActions: 'Actiuni Rapide',
      manageJobs: 'Gestionare Joburi',
      admin: 'Admin Panel',
      adminDesc: 'Cereri, oferte, pro si joburi',
      account: 'Cont',
      notifications: 'Notificari',
      notificationsDesc: 'Mesaje si alerte de booking',
      language: 'Limba',
      business: 'Setari Business',
      privacy: 'Privacy & Security',
      boost: 'Boost Profil',
      help: 'Ajutor & Support',
      verified: 'Verificat',
      review: 'De verificat',
      signOut: 'Sign Out',
    }
  }[lang];

  const stats = [
    { label: copy.active, value: activeJobs, icon: Briefcase, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: copy.earned, value: `£${earnings}`, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: copy.rating, value: pro?.rating || '5.0', icon: Star, bg: 'bg-amber-50', color: 'text-amber-500' },
  ];

  const menuSections = [
    {
      title: copy.account,
      items: [
        { icon: Bell, label: copy.notifications, desc: copy.notificationsDesc, onClick: onNotifications },
      ]
    },
    {
      title: copy.business,
      items: [
        { icon: Briefcase, label: copy.manageJobs, desc: `${activeJobs} active, ${completedJobs} done`, onClick: onJobs },
        { icon: Sparkles, label: copy.boost, desc: 'Appear higher in search', onClick: onBoost, special: true },
        { icon: Shield, label: copy.privacy, desc: 'Security and visibility', onClick: onPrivacy },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: copy.language, desc: lang === 'en' ? 'English' : 'Romana', onClick: onLanguage },
        { icon: MessageSquare, label: copy.help, desc: 'Help center and support', onClick: onHelp },
      ]
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 bg-[#f4f7f7] min-h-screen pb-24 relative">
      <div className="px-5 pt-4 pb-4 rounded-b-[26px] shadow-xl shadow-teal-900/20 relative overflow-hidden bg-gradient-to-br from-[#173f3f] via-[#235d5a] to-[#2f8a7f]">
        <div className="absolute -top-20 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -left-16 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14),transparent_42%,rgba(255,255,255,0.08))]" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[9px] font-black text-white/55 uppercase tracking-[0.18em] mb-1">{copy.eyebrow}</div>
            <h2 className="text-[23px] font-black text-white tracking-tight leading-none">{copy.title}</h2>
            <p className="text-[11px] text-white/72 font-semibold mt-1.5 leading-snug">{copy.subtitle}</p>
          </div>
          <button
            onClick={onNotifications}
            className="w-10 h-10 rounded-2xl bg-white/12 border border-white/15 backdrop-blur-md flex items-center justify-center text-white relative active:scale-90 transition-transform shadow-lg shadow-black/10 shrink-0"
          >
            <Bell className="w-5 h-5" />
            {unreadMsgs > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white/70" />}
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-3 mt-3">
          <div className="w-13 h-13 rounded-[18px] bg-white/14 border border-white/18 backdrop-blur-md flex items-center justify-center shrink-0 text-lg font-black text-white shadow-xl shadow-black/10 overflow-hidden">
            {pro?.img || user.img ? (
              <img src={pro?.img || user.img} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              'P'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-[18px] font-black leading-tight truncate">{pro?.name || user.name}</div>
            <div className="text-white/65 text-[11px] font-bold truncate mt-0.5">{user.email}</div>
            <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/12 border border-white/14 text-white/82 text-[8px] font-black uppercase tracking-[0.1em] shrink-0">
                <Shield className="w-3 h-3" /> {verified ? copy.verified : copy.review}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/12 border border-white/14 text-white/82 text-[8px] font-black uppercase tracking-[0.1em] shrink-0">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {pro?.rating || '5.0'}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-[1.05fr_0.8fr_0.9fr_0.8fr] gap-2 mt-3">
          <button onClick={onViewProfile} className="h-[46px] rounded-2xl bg-white text-[#1a4d4d] text-[10px] font-black flex flex-col items-center justify-center gap-0.5 shadow-xl shadow-black/10 active:scale-[0.98] transition-all">
            <Eye className="w-4 h-4" />
            <span className="leading-none">{copy.publicShort}</span>
          </button>
          {stats.map((stat) => (
            <div key={stat.label} className="h-[46px] rounded-2xl bg-white/12 border border-white/14 backdrop-blur-md px-2.5 py-1.5 flex flex-col justify-center">
              <div className="text-[16px] leading-none font-black text-white truncate">{stat.value}</div>
              <div className="text-[8px] font-black text-white/62 uppercase tracking-[0.12em] mt-1 truncate">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-3 relative z-10 space-y-4">
        <div className={cn(
          'rounded-[22px] p-3 transition-all duration-500 border shadow-xl flex items-center justify-between',
          isEmergencyActive
            ? 'bg-orange-500 border-orange-400 shadow-orange-900/15'
            : 'bg-white/90 backdrop-blur-xl border-white shadow-slate-200/70'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('w-9 h-9 rounded-2xl flex items-center justify-center shrink-0', isEmergencyActive ? 'bg-white text-orange-500' : 'bg-orange-50 text-orange-500')}>
              <Zap className={cn('w-4.5 h-4.5', isEmergencyActive && 'fill-current')} />
            </div>
            <div className="min-w-0">
              <div className={cn('text-[14px] font-black', isEmergencyActive ? 'text-white' : 'text-slate-950')}>{copy.emergencyMode}</div>
              <div className={cn('text-[10px] font-bold truncate', isEmergencyActive ? 'text-white/75' : 'text-slate-400')}>{copy.emergencyDesc}</div>
            </div>
          </div>
          <button
            onClick={onToggleEmergency}
            className={cn('w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner border-2 shrink-0', isEmergencyActive ? 'bg-white border-orange-400' : 'bg-slate-100 border-slate-200')}
          >
            <div className={cn('w-4.5 h-4.5 rounded-full absolute top-[3px] transition-all duration-300 shadow-md', isEmergencyActive ? 'left-6 bg-orange-500' : 'left-[3px] bg-white')} />
          </button>
        </div>

        {isAdmin && (
          <button onClick={onAdmin} className="w-full rounded-[26px] bg-gradient-to-br from-[#173f3f] via-[#245f5c] to-[#2f8a7f] border border-white/40 p-4 text-left shadow-xl shadow-teal-900/20 active:scale-[0.98] transition-all overflow-hidden relative">
            <div className="absolute -top-16 -right-12 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/14 border border-white/18 flex items-center justify-center text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-black text-white">{copy.admin}</div>
                <div className="text-[11px] font-bold text-white/65 mt-0.5">{copy.adminDesc}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </div>
          </button>
        )}

        {menuSections.map((section) => (
          <section key={section.title}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.16em] mb-2 px-1">{section.title}</h3>
            <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white shadow-xl shadow-slate-200/70 overflow-hidden">
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 text-left active:scale-[0.99] transition-all',
                    index !== section.items.length - 1 && 'border-b border-slate-100/80',
                    item.special && 'bg-gradient-to-r from-amber-50/70 to-transparent'
                  )}
                >
                  <div className={cn('w-11 h-11 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0', item.special ? 'bg-amber-50 text-amber-500' : 'bg-white text-brand')}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-black text-slate-900 truncate">{item.label}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <button
          onClick={onLogout}
          className="w-full h-13 rounded-[22px] bg-white border border-red-100 text-red-500 font-black text-[13px] flex items-center justify-center gap-2 shadow-xl shadow-slate-200/70 active:scale-[0.98] transition-all uppercase tracking-[0.12em]"
        >
          <LogOut className="w-4 h-4" /> {copy.signOut}
        </button>
      </div>
    </div>
  );
}
