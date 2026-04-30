import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Briefcase, CheckCircle2, ChevronLeft, Clock, MessageSquare, RefreshCw, Shield, Star, UserCheck, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job, Message, Professional, User } from '../types';

type AdminTab = 'overview' | 'requests' | 'pros' | 'jobs';

type JobRequestRow = {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  status?: string;
  description?: string;
  budget?: string | number | null;
  created_at?: string;
};

type JobOfferRow = {
  id: string;
  request_id?: string;
  professional_id?: string;
  professional_name?: string;
  price?: string | number | null;
  status?: string;
  created_at?: string;
};

type ProfileRow = {
  id: string;
  email?: string;
  name?: string;
  type?: string;
  created_at?: string;
};

interface AdminPanelProps {
  user: User;
  lang: 'en' | 'ro';
  allPros: Professional[];
  allJobs: Job[];
  allMessages: Message[];
  onClose: () => void;
}

const text = {
  ro: {
    title: 'Admin Panel',
    subtitle: 'Control rapid pentru Closer Ploiesti',
    overview: 'Overview',
    requests: 'Cereri',
    pros: 'Profesionisti',
    jobs: 'Joburi',
    refresh: 'Refresh',
    openRequests: 'cereri open',
    noOffers: 'fara oferta',
    prosReview: 'pro de verificat',
    activeJobs: 'joburi active',
    watchlist: 'Watchlist rapid',
    noWatchlist: 'Nu ai cereri blocate acum.',
    closeRequest: 'Inchide cererea',
    verify: 'Marcheaza verificat',
    verified: 'Verificat',
    rlsError: 'Daca vezi eroare aici, inseamna ca Supabase RLS nu permite inca citirea admin din client.',
  },
  en: {
    title: 'Admin Panel',
    subtitle: 'Closer Ploiesti control room',
    overview: 'Overview',
    requests: 'Requests',
    pros: 'Pros',
    jobs: 'Jobs',
    refresh: 'Refresh',
    openRequests: 'open requests',
    noOffers: 'no offer',
    prosReview: 'pros to review',
    activeJobs: 'active jobs',
    watchlist: 'Quick watchlist',
    noWatchlist: 'No blocked requests right now.',
    closeRequest: 'Close request',
    verify: 'Mark verified',
    verified: 'Verified',
    rlsError: 'If you see an error here, Supabase RLS does not yet allow admin reads from the client.',
  }
};

function ageLabel(value?: string) {
  if (!value) return '-';
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff)) return '-';
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function isVerified(pro: Professional) {
  return Boolean(pro.v?.id || pro.v?.dbs || pro.v?.ins);
}

export function AdminPanel({ user, lang, allPros, allJobs, allMessages, onClose }: AdminPanelProps) {
  const copy = text[lang] || text.ro;
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [requests, setRequests] = useState<JobRequestRow[]>([]);
  const [offers, setOffers] = useState<JobOfferRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>(allPros);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestRes, offerRes, profileRes, proRes] = await Promise.all([
        supabase.from('job_requests').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('job_offers').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('professionals').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      const firstError = requestRes.error || offerRes.error || profileRes.error || proRes.error;
      if (firstError) throw firstError;

      setRequests((requestRes.data || []) as JobRequestRow[]);
      setOffers((offerRes.data || []) as JobOfferRow[]);
      setProfiles((profileRes.data || []) as ProfileRow[]);
      setProfessionals((proRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.email || 'Professional',
        email: p.email || '',
        img: p.img || '',
        catId: p.cat_id || 'home',
        sub: p.sub || 'Service',
        rating: Number(p.rating || 0),
        rc: Number(p.review_count || 0),
        jobs: Number(p.jobs_completed || 0),
        loc: p.location || 'Ploiesti',
        price: Number(p.price || 0),
        unit: p.unit || '/hr',
        v: {
          id: Number(p.verified_id || 0),
          dbs: Number(p.verified_dbs || 0),
          ins: Number(p.verified_ins || 0),
        },
        about: p.about || '',
        svcs: Array.isArray(p.services) ? p.services : [],
        port: [],
        revs: [],
        slots: [],
        isEmergencyAvailable: Boolean(p.is_emergency_available),
        coverImg: p.cover_img || '',
      })));
    } catch (e: any) {
      setError(e?.message || 'Admin data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const offerCountByRequest = useMemo(() => {
    return offers.reduce<Record<string, number>>((acc, offer) => {
      if (!offer.request_id) return acc;
      acc[offer.request_id] = (acc[offer.request_id] || 0) + 1;
      return acc;
    }, {});
  }, [offers]);

  const openRequests = requests.filter((request) => (request.status || 'open') === 'open');
  const requestsWithoutOffers = openRequests.filter((request) => !offerCountByRequest[request.id]);
  const prosToReview = professionals.filter((pro) => !isVerified(pro));
  const activeJobs = allJobs.filter((job) => job.status !== 'completed' && job.status !== 'cancelled');

  const closeRequest = async (requestId: string) => {
    setSavingId(requestId);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('job_requests')
        .update({ status: 'closed' })
        .eq('id', requestId);
      if (updateError) throw updateError;
      setRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, status: 'closed' } : request));
    } catch (e: any) {
      setError(e?.message || 'Request could not be closed.');
    } finally {
      setSavingId(null);
    }
  };

  const verifyPro = async (proId: string) => {
    setSavingId(proId);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ verified_id: 1 })
        .eq('id', proId);
      if (updateError) throw updateError;
      setProfessionals((prev) => prev.map((pro) => pro.id === proId ? { ...pro, v: { ...pro.v, id: 1 } } : pro));
    } catch (e: any) {
      setError(e?.message || 'Professional could not be verified.');
    } finally {
      setSavingId(null);
    }
  };

  const stats = [
    { label: copy.openRequests, value: openRequests.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: copy.noOffers, value: requestsWithoutOffers.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: copy.prosReview, value: prosToReview.length, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: copy.activeJobs, value: activeJobs.length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-[#f4f7f7] overflow-y-auto">
      <div className="min-h-screen pb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#173f3f] via-[#245f5c] to-[#2f8a7f] px-5 pt-5 pb-7 rounded-b-[34px] shadow-2xl shadow-teal-900/20">
          <div className="absolute -top-20 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-white/12 border border-white/15 text-white flex items-center justify-center active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={loadAdminData} className="h-11 px-4 rounded-2xl bg-white/12 border border-white/15 text-white flex items-center gap-2 text-[12px] font-black active:scale-95">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {copy.refresh}
            </button>
          </div>

          <div className="relative z-10 mt-6">
            <div className="text-[10px] font-black text-white/55 uppercase tracking-[0.18em] mb-1">Closer Admin</div>
            <h1 className="text-[32px] font-black text-white tracking-tight leading-none">{copy.title}</h1>
            <p className="text-[13px] text-white/72 font-semibold mt-3">{copy.subtitle}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/12 border border-white/15 text-white/80 text-[11px] font-black">
              <Shield className="w-4 h-4" /> {user.email}
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] bg-white/85 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/70 p-4">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-[27px] leading-none font-black text-slate-950">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-[22px] bg-red-50 border border-red-100 p-4 text-red-700">
              <div className="font-black text-[13px]">Supabase</div>
              <p className="text-[12px] font-semibold mt-1">{error}</p>
              <p className="text-[11px] font-medium mt-2 text-red-500">{copy.rlsError}</p>
            </div>
          )}

          <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide">
            {([
              ['overview', copy.overview],
              ['requests', copy.requests],
              ['pros', copy.pros],
              ['jobs', copy.jobs],
            ] as [AdminTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 h-11 rounded-2xl text-[12px] font-black border shadow-sm whitespace-nowrap transition-all ${
                  activeTab === key ? 'bg-[#1a4d4d] text-white border-[#1a4d4d]' : 'bg-white text-slate-500 border-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="mt-5 rounded-[28px] bg-white border border-slate-100 shadow-xl shadow-slate-200/70 overflow-hidden">
              <div className="p-4 border-b border-slate-50">
                <h2 className="text-[18px] font-black text-slate-950">{copy.watchlist}</h2>
                <p className="text-[11px] font-bold text-slate-400 mt-1">{profiles.length} users, {professionals.length} pros, {allMessages.length} messages loaded</p>
              </div>
              {requestsWithoutOffers.length === 0 ? (
                <div className="p-5 text-[13px] font-bold text-slate-400">{copy.noWatchlist}</div>
              ) : (
                requestsWithoutOffers.slice(0, 6).map((request) => (
                  <div key={request.id} className="p-4 border-b border-slate-50 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[15px] font-black text-slate-950">{request.subcategory || request.category || 'Request'}</div>
                        <div className="text-[11px] font-bold text-slate-400 mt-1">{request.city || 'Ploiesti'} - {ageLabel(request.created_at)} ago</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase">0 offers</span>
                    </div>
                    <p className="text-[12px] font-semibold text-slate-500 mt-3 line-clamp-2">{request.description || '-'}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="mt-5 space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-[26px] bg-white border border-slate-100 shadow-xl shadow-slate-200/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[16px] font-black text-slate-950 truncate">{request.subcategory || request.category || 'Request'}</div>
                      <div className="text-[11px] font-bold text-slate-400 mt-1">{request.customer_name || request.customer_email || request.customer_id || 'Client'} - {request.city || 'Ploiesti'}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-[9px] font-black uppercase">{request.status || 'open'}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-slate-500 mt-3 line-clamp-3">{request.description || '-'}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-[11px] font-black text-slate-400">{offerCountByRequest[request.id] || 0} offers - {request.budget || 'no budget'}</div>
                    {(request.status || 'open') === 'open' && (
                      <button
                        onClick={() => closeRequest(request.id)}
                        disabled={savingId === request.id}
                        className="h-9 px-3 rounded-xl bg-[#1a4d4d] text-white text-[11px] font-black disabled:opacity-60"
                      >
                        {savingId === request.id ? '...' : copy.closeRequest}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pros' && (
            <div className="mt-5 space-y-3">
              {professionals.map((pro) => (
                <div key={pro.id} className="rounded-[26px] bg-white border border-slate-100 shadow-xl shadow-slate-200/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center text-xl">
                      {pro.img ? <img src={pro.img} alt={pro.name} className="w-full h-full object-cover" /> : 'P'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-black text-slate-950 truncate">{pro.name}</div>
                      <div className="text-[11px] font-bold text-slate-400 truncate">{pro.email}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-slate-400">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {pro.rating || 0} - {pro.sub} - {pro.loc}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${isVerified(pro) ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {isVerified(pro) ? copy.verified : 'Needs review'}
                    </span>
                    {!isVerified(pro) && (
                      <button
                        onClick={() => verifyPro(pro.id)}
                        disabled={savingId === pro.id}
                        className="h-9 px-3 rounded-xl bg-[#1a4d4d] text-white text-[11px] font-black disabled:opacity-60"
                      >
                        {savingId === pro.id ? '...' : copy.verify}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="mt-5 space-y-3">
              {allJobs.map((job) => (
                <div key={job.id} className="rounded-[26px] bg-white border border-slate-100 shadow-xl shadow-slate-200/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-black text-slate-950">{job.pSub || 'Job'}</div>
                      <div className="text-[11px] font-bold text-slate-400 mt-1">{job.cName} to {job.pName}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-[9px] font-black uppercase">{job.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-black text-slate-400">
                    <span>{job.price || '-'}</span>
                    <span>{job.isEmergency ? 'SOS' : 'Standard'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
