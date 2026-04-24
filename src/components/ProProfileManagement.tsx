import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, X, Star, Briefcase, MapPin, CheckCircle2, ChevronLeft, Save, Edit2, Image as ImageIcon, Shield, Zap, Calendar, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional, Job, PortfolioItem } from '../types';

interface ProProfileManagementProps {
  pro: Professional;
  onBack: () => void;
  onUpdate: (updatedPro: Professional) => void;
  jobs: Job[];
  onUpdateJob: (jobId: string, photos: string[]) => void;
  lang: 'en' | 'ro';
}

export const ProProfileManagement: React.FC<ProProfileManagementProps> = ({ 
  pro, 
  onBack, 
  onUpdate, 
  jobs,
  onUpdateJob,
  lang 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Professional>({
    ...pro,
    svcs: pro.svcs || [],
    port: pro.port || [],
    revs: pro.revs || [],
    slots: pro.slots || [],
    hiredCount: pro.hiredCount || 15,
    responseTime: pro.responseTime || '1hr',
    yearStarted: pro.yearStarted || 2018,
    teamSize: pro.teamSize || '1-2 people',
    verifiedCredentials: pro.verifiedCredentials || [
      { type: 'background', label: 'Background checked' },
      { type: 'license', label: 'Licensed' },
      { type: 'insurance', label: 'Insured' }
    ],
    faqs: pro.faqs || [
      { q: 'What is your typical process?', a: 'I start with a detailed quote, then schedule the work at your convenience. I always clean up afterwards!' },
      { q: 'Do you offer guarantees?', a: 'Yes, all my work is guaranteed for 12 months.' }
    ]
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'jobs' | 'reviews'>('overview');

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleAddPortfolio = () => {
    const newItem: PortfolioItem = {
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&w=800&q=80',
      title: 'New Project',
      type: 'work'
    };
    setEditData(prev => ({
      ...prev,
      port: [...prev.port, newItem]
    }));
  };

  const handleRemovePortfolio = (idx: number) => {
    setEditData(prev => ({
      ...prev,
      port: prev.port.filter((_, i) => i !== idx)
    }));
  };

  const handleAddJobPhoto = (jobId: string) => {
    // Mock photo upload
    const mockPhoto = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80';
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      const updatedPhotos = [...(job.photos || []), mockPhoto];
      onUpdateJob(jobId, updatedPhotos);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-in slide-in-from-right duration-300 text-[13px]">
      {/* Extreme Compact Header */}
      <div className="relative h-32 bg-[#1a4d4d] overflow-hidden">
        {editData.coverImg && <img src={editData.coverImg} className="w-full h-full object-cover opacity-60" alt="Cover" />}
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 rounded-full bg-white text-[#1a4d4d] text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              {lang === 'ro' ? 'Editează' : 'Edit'}
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg"
            >
              {lang === 'ro' ? 'Gata' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Extreme Compact Content Area */}
      <div className="px-2 -mt-10 relative z-30">
        <div className="bg-white rounded-[20px] shadow-2xl shadow-black/5 overflow-hidden">
          
          {/* Profile Basic Info - ABSOLUTE COMPACT */}
          <div className="p-3">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-[16px] border-[3px] border-white shadow-lg overflow-hidden bg-slate-100">
                  {editData.img ? (
                    <img src={editData.img} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-[#f0f9f9] text-[#1a4d4d]">👤</div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-[#1a4d4d] text-white flex items-center justify-center shadow-xl border border-white">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.name}
                      onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-base font-black text-slate-900 w-full bg-slate-50 rounded px-2 py-0.5 border-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <h2 className="text-[17px] font-black text-slate-900 truncate tracking-tight">{editData.name}</h2>
                  )}
                  {/* Badges - NOW INSIDE CARD */}
                  <div className="flex flex-col gap-1 items-end ml-2">
                    <div className="bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm">
                      TOP PRO
                    </div>
                    <div className="bg-teal-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm">
                      100% REC.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5 text-slate-500 font-bold text-[10px]">
                    <MapPin className="w-2.5 h-2.5 text-teal-600" /> {editData.loc}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-0.5 text-teal-700 font-bold text-[10px] bg-teal-50 px-1.5 rounded-full">
                    {editData.sub}
                  </div>
                </div>
              </div>
            </div>

            {/* High-Impact Trust Bar - HORIZONTAL INTEGRATED */}
            <div className="mt-3 grid grid-cols-3 bg-slate-50 rounded-lg border border-slate-100 divide-x divide-slate-100 overflow-hidden">
              <div className="py-1.5 flex flex-col items-center">
                <div className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-[13px] font-black text-slate-900">{editData.rating}</span>
                </div>
                <span className="text-[7px] font-black text-slate-400 uppercase">{editData.rc} Revs</span>
              </div>
              <div className="py-1.5 flex flex-col items-center justify-center">
                <div className="text-[13px] font-black text-slate-900">{editData.hiredCount}</div>
                <span className="text-[7px] font-black text-slate-400 uppercase">Hires</span>
              </div>
              <div className="py-1.5 flex flex-col items-center">
                <div className="flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[13px] font-black text-slate-900">{editData.responseTime}</span>
                </div>
                <span className="text-[7px] font-black text-slate-400 uppercase">Resp.</span>
              </div>
            </div>
          </div>

          {/* Verification Badges - MICRO ROW */}
          <div className="px-3 pb-3 flex justify-center gap-1.5">
            {(editData.verifiedCredentials || []).map((cred, i) => (
              <div key={i} className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/30">
                <Shield className="w-2 h-2 fill-emerald-100" /> {cred.label.split(' ')[0]}
              </div>
            ))}
          </div>

          {/* Micro Tabs */}
          <div className="flex border-y border-slate-50 bg-slate-50/20 sticky top-0 z-40 backdrop-blur-md">
            {[
              { id: 'overview', label: 'About' },
              { id: 'portfolio', label: 'Photos' },
              { id: 'jobs', label: 'Jobs' },
              { id: 'reviews', label: 'Revs' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-2 text-[8px] font-black uppercase tracking-tighter transition-all relative",
                  activeTab === tab.id ? "text-[#1a4d4d]" : "text-slate-400"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1a4d4d] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* OVERVIEW TAB - CLEANER SUMMARY */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* Secondary Metrics Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900 leading-none">{editData.jobs}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{lang === 'ro' ? 'Job-uri gata' : 'Jobs Done'}</div>
                    </div>
                  </div>
                  <div className="bg-[#1a4d4d] rounded-2xl p-4 shadow-xl shadow-teal-900/10 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black leading-none">100%</div>
                      <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1">{lang === 'ro' ? 'Recomandat' : 'Recommended'}</div>
                    </div>
                  </div>
                </div>

                <section>
                  <h3 className="text-[14px] font-black text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-teal-500 rounded-full" />
                    {lang === 'ro' ? 'Despre mine' : 'About Me'}
                  </h3>
                  {isEditing ? (
                    <textarea 
                      value={editData.about}
                      onChange={e => setEditData(prev => ({ ...prev, about: e.target.value }))}
                      className="w-full h-32 bg-slate-50 rounded-2xl p-4 text-[13px] text-slate-600 border-none focus:ring-2 focus:ring-teal-500 shadow-inner"
                      placeholder="Tell customers about your expertise..."
                    />
                  ) : (
                    <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {editData.about}
                    </p>
                  )}
                </section>

                <section className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-100">
                  <h3 className="text-[14px] font-black text-slate-900 mb-4">{lang === 'ro' ? 'Detalii Afacere' : 'Business Details'}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Calendar className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-500">{lang === 'ro' ? 'Început în' : 'In business since'}</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-900">{editData.yearStarted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Users className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-500">{lang === 'ro' ? 'Echipă' : 'Team size'}</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-900">{editData.teamSize}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[14px] font-black text-slate-900 mb-3">{lang === 'ro' ? 'Servicii Oferite' : 'Services Offered'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(editData.svcs || []).map((s, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-4 py-2 rounded-xl text-[12px] font-bold border border-slate-100 shadow-sm">
                        {s}
                      </span>
                    ))}
                    {isEditing && (
                      <button className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border border-teal-100 border-dashed">
                        + Add
                      </button>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-black text-slate-900">{lang === 'ro' ? 'Portofoliu' : 'Portfolio'}</h3>
                  <button 
                    onClick={handleAddPortfolio}
                    className="w-11 h-11 rounded-2xl bg-[#1a4d4d] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(editData.port || []).map((item, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-[32px] overflow-hidden bg-slate-100 shadow-lg group">
                      <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Work" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                        <span className="text-white text-[13px] font-black leading-tight">{item.title}</span>
                      </div>
                      {isEditing && (
                        <button 
                          onClick={() => handleRemovePortfolio(idx)}
                          className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-[18px] font-black text-slate-900">{lang === 'ro' ? 'Proiecte Finalizate' : 'Completed Projects'}</h3>
                {(jobs || []).filter(j => j.status === 'completed').length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No completed jobs yet</p>
                  </div>
                ) : (
                  (jobs || []).filter(j => j.status === 'completed').map(job => (
                    <div key={job.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl shadow-black/5 hover:shadow-black/10 transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-[17px] font-black text-slate-900">{job.cName}</div>
                          <div className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {new Date(job.created).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-[15px] font-black border border-emerald-100">
                          £{job.price}
                        </div>
                      </div>
                      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed font-medium">"{job.desc}"</p>
                      
                      {/* Job Photos Row */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {(job.photos || []).map((p, idx) => (
                          <div key={idx} className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md active:scale-150 transition-transform z-10">
                            <img src={p} className="w-full h-full object-cover" alt="Job result" />
                          </div>
                        ))}
                        <button 
                          onClick={() => handleAddJobPhoto(job.id)}
                          className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-teal-300 hover:text-teal-500 transition-all bg-slate-50/50"
                        >
                          <Camera className="w-6 h-6" />
                          <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Add</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest pt-4 border-t border-slate-50">
                        <CheckCircle2 className="w-4 h-4 fill-emerald-100" /> {lang === 'ro' ? 'Verificat' : 'Verified Project'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[18px] font-black text-slate-900">{lang === 'ro' ? 'Ce spun clienții' : 'What clients say'}</h3>
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-[14px] font-black text-amber-700">{editData.rating}</span>
                  </div>
                </div>
                
                {(editData.revs || []).length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No reviews yet</p>
                  </div>
                ) : (
                  (editData.revs || []).map((rev, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-bl-[100px] -z-10" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl shadow-inner">
                            👤
                          </div>
                          <div>
                            <div className="text-[15px] font-black text-slate-900 tracking-tight">{rev.n}</div>
                            <div className="flex gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-3 h-3", i < (rev.r || rev.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{rev.date}</span>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-1 -top-1 text-slate-100 text-4xl font-serif">"</div>
                        <p className="text-[15px] text-slate-600 leading-relaxed font-medium italic relative z-10 pl-2">
                          {rev.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
