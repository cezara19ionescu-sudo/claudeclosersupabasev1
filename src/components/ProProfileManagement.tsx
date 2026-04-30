import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, X, Star, Briefcase, MapPin, CheckCircle2, ChevronLeft, Save, Edit2, Image as ImageIcon, Shield, Zap, Calendar, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional, Job, PortfolioItem } from '../types';
import { CATS } from '../constants';
import * as db from '../lib/database';

interface ProProfileManagementProps {
  pro: Professional;
  onBack: () => void;
  onUpdate: (updatedPro: Professional) => void;
  jobs: Job[];
  onUpdateJob: (jobId: string, photos: string[]) => void;
  initialTab?: 'overview' | 'portfolio' | 'jobs' | 'reviews';
  lang: 'en' | 'ro';
}

export const ProProfileManagement: React.FC<ProProfileManagementProps> = ({ 
  pro, 
  onBack, 
  onUpdate, 
  jobs,
  onUpdateJob,
  initialTab = 'overview',
  lang 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [addressInput, setAddressInput] = useState((pro as any).address || '');
  const [addressStatus, setAddressStatus] = useState<'idle' | 'loading' | 'ok' | 'error' | 'outside'>('idle');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<null | 'avatar' | 'cover' | 'portfolio'>(null);
  const [editData, setEditData] = useState<Professional>({
    ...pro,
    svcs: pro.svcs || [],
    port: pro.port || [],
    revs: pro.revs || [],
    slots: pro.slots || [],
    hiredCount: pro.hiredCount ?? pro.jobs ?? 0,
    responseTime: pro.responseTime || 'Not set',
    yearStarted: pro.yearStarted || new Date().getFullYear(),
    teamSize: pro.teamSize || 'Not set',
    verifiedCredentials: pro.verifiedCredentials || [
      ...(pro.v?.id ? [{ type: 'id', label: 'ID checked' }] : []),
      ...(pro.v?.dbs ? [{ type: 'background', label: 'Background checked' }] : []),
      ...(pro.v?.ins ? [{ type: 'insurance', label: 'Insured' }] : [])
    ],
    faqs: pro.faqs || [
      { q: 'What is your typical process?', a: 'I start with a detailed quote, then schedule the work at your convenience. I always clean up afterwards!' },
      { q: 'Do you offer guarantees?', a: 'Yes, all my work is guaranteed for 12 months.' }
    ]
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'jobs' | 'reviews'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSave = async () => {
    // Geocode address if changed
    const proDbId = (editData as any)._dbId || editData.id;
    const trimmedAddress = addressInput.trim();
    if (trimmedAddress && trimmedAddress !== ((pro as any).address || '')) {
      setAddressStatus('loading');
      try {
        const coords = await db.geocodeStreet(trimmedAddress);
        if (!coords) {
          setAddressStatus('error');
        } else {
          const dist = db.distanceKm(coords.lat, coords.lng, db.PLOIESTI_CENTER.lat, db.PLOIESTI_CENTER.lng);
          if (dist > db.PLOIESTI_RADIUS_KM) {
            setAddressStatus('outside');
          } else {
            setAddressStatus('ok');
            await db.updateProLocation(proDbId, trimmedAddress, coords.lat, coords.lng);
            setEditData(prev => ({ ...prev, address: trimmedAddress, lat: coords.lat, lng: coords.lng }));
          }
        }
      } catch {
        setAddressStatus('error');
      }
    } else if (!trimmedAddress && ((pro as any).address)) {
      // Address cleared
      await db.updateProLocation(proDbId, '', null, null);
      setEditData(prev => ({ ...prev, address: '', lat: undefined, lng: undefined }));
    }
    onUpdate(editData);
    setIsEditing(false);
    setEditingPkg(null);
    // Persist packages + FAQs to Supabase
    if (editData.packages !== undefined) {
      db.updatePackages(proDbId, editData.packages || [])
        .catch(e => console.error('Error saving packages:', e));
    }
    if (editData.faqs !== undefined) {
      db.replaceFaqs(proDbId, editData.faqs || [])
        .catch(e => console.error('Error saving FAQs:', e));
    }
    if (editData.availability !== undefined) {
      db.updateAvailability(proDbId, editData.availability as Record<string, string[]>)
        .catch(e => console.error('Error saving availability:', e));
    }
  };

  const [newPortUrl, setNewPortUrl] = useState('');
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newService, setNewService] = useState('');
  const [newSkillCat, setNewSkillCat] = useState(editData.catId || CATS[0]?.id || 'home');
  // Packages state
  const [editingPkg, setEditingPkg] = useState<number | null>(null);
  const [newPkgFeature, setNewPkgFeature] = useState('');
  // FAQ state
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newSkillSub, setNewSkillSub] = useState(editData.sub || CATS.find(c => c.id === newSkillCat)?.subs[0] || '');

  const handleAddPortfolio = () => {
    const url = newPortUrl.trim() || 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&w=800&q=80';
    const newItem: PortfolioItem = {
      image: url,
      title: newPortTitle.trim() || 'New Project',
      type: 'work'
    };
    setEditData(prev => ({
      ...prev,
      port: [...prev.port, newItem]
    }));
    setNewPortUrl('');
    setNewPortTitle('');
  };

  const handleRemovePortfolio = (idx: number) => {
    setEditData(prev => ({
      ...prev,
      port: prev.port.filter((_, i) => i !== idx)
    }));
  };

  const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'avatar' | 'cover' | 'portfolio'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const proDbId = (editData as any)._dbId || editData.id;
      const url = await db.uploadProfessionalImage(file, proDbId, kind);
      if (kind === 'avatar') {
        setEditData(prev => ({ ...prev, img: url }));
      } else if (kind === 'cover') {
        setEditData(prev => ({ ...prev, coverImg: url }));
      } else {
        setEditData(prev => ({
          ...prev,
          port: [...(prev.port || []), { image: url, title: newPortTitle.trim() || 'Recent work', type: 'work' }]
        }));
        setNewPortTitle('');
      }
    } catch (err) {
      console.error('Profile image upload failed:', err);
      alert('Could not upload image. Please check Supabase storage permissions and try again.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const offeredCategories = editData.categories?.length
    ? editData.categories
    : [{ catId: editData.catId, sub: editData.sub, isPrimary: true }];

  const handleAddService = () => {
    const service = newService.trim();
    if (!service) return;
    setEditData(prev => ({
      ...prev,
      svcs: Array.from(new Set([...(prev.svcs || []), service]))
    }));
    setNewService('');
  };

  const handleRemoveService = (service: string) => {
    setEditData(prev => ({
      ...prev,
      svcs: (prev.svcs || []).filter(s => s !== service)
    }));
  };

  const handleSkillCatChange = (catId: string) => {
    const cat = CATS.find(c => c.id === catId);
    setNewSkillCat(catId);
    setNewSkillSub(cat?.subs[0] || '');
  };

  const handleAddCategory = () => {
    if (!newSkillCat || !newSkillSub) return;
    const exists = offeredCategories.some(c => c.catId === newSkillCat && c.sub === newSkillSub);
    if (exists) return;
    setEditData(prev => ({
      ...prev,
      categories: [...offeredCategories, { catId: newSkillCat, sub: newSkillSub, isPrimary: false }]
    }));
  };

  const handleRemoveCategory = (catId: string, sub: string) => {
    setEditData(prev => {
      const remaining = offeredCategories.filter(c => !(c.catId === catId && c.sub === sub));
      const next = remaining.length > 0 ? remaining : [{ catId: prev.catId, sub: prev.sub, isPrimary: true }];
      return {
        ...prev,
        catId: next.find(c => c.isPrimary)?.catId || next[0].catId,
        sub: next.find(c => c.isPrimary)?.sub || next[0].sub,
        categories: next
      };
    });
  };

  const handleSetPrimaryCategory = (catId: string, sub: string) => {
    setEditData(prev => ({
      ...prev,
      catId,
      sub,
      categories: offeredCategories.map(c => ({
        ...c,
        isPrimary: c.catId === catId && c.sub === sub
      }))
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
    <div className="bg-[#f5f7f7] min-h-screen pb-24 animate-in slide-in-from-right duration-300 text-[13px]">
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelected(e, 'avatar')} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelected(e, 'cover')} />
      <input ref={portfolioInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelected(e, 'portfolio')} />
      {/* Extreme Compact Header */}
      <div className="relative h-48 bg-[#1a4d4d] overflow-hidden rounded-b-[34px] shadow-2xl shadow-teal-900/20">
        {editData.coverImg ? (
          <img src={editData.coverImg} className="absolute inset-0 w-full h-full object-cover opacity-75" alt="Cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_45%),linear-gradient(145deg,#174747,#2f7068)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/18 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {isEditing && (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading === 'cover'}
              className="h-10 px-3 rounded-full bg-white/18 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <Camera className="w-3.5 h-3.5" /> {uploading === 'cover' ? 'Uploading' : 'Cover'}
            </button>
          )}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="h-10 px-4 rounded-full bg-white text-[#1a4d4d] text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              {lang === 'ro' ? 'Editează' : 'Edit'}
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="h-10 px-4 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-900/20"
            >
              {lang === 'ro' ? 'Gata' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Extreme Compact Content Area */}
      <div className="px-4 -mt-20 relative z-30">
        <div className="bg-white/78 backdrop-blur-2xl rounded-[30px] shadow-2xl shadow-slate-900/10 border border-white/80 overflow-hidden">
          
          {/* Profile Basic Info - ABSOLUTE COMPACT */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div
                  onClick={() => isEditing && avatarInputRef.current?.click()}
                  className="w-20 h-20 rounded-[22px] border-[3px] border-white shadow-xl shadow-slate-900/10 overflow-hidden bg-slate-100 active:scale-95 transition-transform"
                >
                  {editData.img ? (
                    <img src={editData.img} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-[#f0f9f9] text-[#1a4d4d]">👤</div>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading === 'avatar'}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#1a4d4d] text-white flex items-center justify-center shadow-xl border-2 border-white disabled:opacity-60 active:scale-90 transition-transform"
                  >
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
                    <div className="space-y-3">
                      <input
                        value={editData.img || ''}
                        onChange={e => setEditData(prev => ({ ...prev, img: e.target.value }))}
                        className="hidden"
                        placeholder={lang === 'ro' ? 'URL poză profil...' : 'Profile photo URL...'}
                      />
                      <input
                        value={editData.coverImg || ''}
                        onChange={e => setEditData(prev => ({ ...prev, coverImg: e.target.value }))}
                        className="hidden"
                        placeholder={lang === 'ro' ? 'URL imagine copertă...' : 'Cover image URL...'}
                      />
                      <textarea 
                        value={editData.about}
                        onChange={e => setEditData(prev => ({ ...prev, about: e.target.value }))}
                        className="w-full h-32 bg-slate-50 rounded-2xl p-4 text-[13px] text-slate-600 border-none focus:ring-2 focus:ring-teal-500 shadow-inner"
                        placeholder="Tell customers about your expertise..."
                      />
                    </div>
                  ) : (
                    <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {editData.about}
                    </p>
                  )}
                </section>

                <section className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-100">
                  <h3 className="text-[14px] font-black text-slate-900 mb-4">{lang === 'ro' ? 'Detalii Afacere' : 'Business Details'}</h3>
                  <div className="space-y-4">
                    {/* Address field */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                          <MapPin className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-500">{lang === 'ro' ? 'Zona ta (opțional)' : 'Your area (optional)'}</span>
                      </div>
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <input
                            value={addressInput}
                            onChange={e => { setAddressInput(e.target.value); setAddressStatus('idle'); }}
                            placeholder={lang === 'ro' ? 'ex. Strada Mihai Bravu (fără număr)' : 'e.g. Strada Mihai Bravu (no number)'}
                            className="w-full bg-white rounded-xl px-3 py-2.5 text-[13px] border border-slate-200 outline-none focus:border-teal-500"
                          />
                          <p className="text-[10px] text-slate-400 px-1">
                            {lang === 'ro'
                              ? '📍 Apare ca cerc ~200m pe hartă, fără adresă exactă. Trebuie să fie în raza de 20km față de Ploiești.'
                              : '📍 Shown as ~200m circle on map, not exact address. Must be within 20km of Ploiești.'}
                          </p>
                          {addressStatus === 'loading' && <p className="text-[11px] text-slate-400">⏳ {lang === 'ro' ? 'Se verifică adresa...' : 'Verifying address...'}</p>}
                          {addressStatus === 'ok' && <p className="text-[11px] text-emerald-600">✓ {lang === 'ro' ? 'Locație salvată pe hartă!' : 'Location saved on map!'}</p>}
                          {addressStatus === 'error' && <p className="text-[11px] text-red-500">✗ {lang === 'ro' ? 'Strada nu a fost găsită. Încearcă alt format.' : 'Street not found. Try a different format.'}</p>}
                          {addressStatus === 'outside' && <p className="text-[11px] text-orange-500">✗ {lang === 'ro' ? 'Adresa este în afara razei de 20km din Ploiești.' : 'Address is outside the 20km radius from Ploiești.'}</p>}
                        </div>
                      ) : (
                        <p className="text-[13px] font-black text-slate-900 pl-10">
                          {(editData as any).address ? `${(editData as any).address}, Ploiești` : (lang === 'ro' ? 'Nesetată' : 'Not set')}
                        </p>
                      )}
                    </div>
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
                      <span key={idx} className="bg-white text-slate-700 px-4 py-2 rounded-xl text-[12px] font-bold border border-slate-100 shadow-sm flex items-center gap-2">
                        {s}
                        {isEditing && (
                          <button onClick={() => handleRemoveService(s)} className="text-slate-300 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <div className="w-full flex gap-2 mt-2">
                        <input
                          value={newService}
                          onChange={e => setNewService(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddService()}
                          placeholder={lang === 'ro' ? 'ex. Prize, lumini, panou electric...' : 'e.g. Sockets, lighting, fuse box...'}
                          className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-[12px] border border-slate-100 outline-none focus:border-teal-500"
                        />
                        <button onClick={handleAddService} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border border-teal-100 border-dashed">
                          + Add
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── SERVICE PACKAGES ── */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-slate-900">{lang === 'ro' ? 'Pachete de servicii' : 'Service Packages'}</h3>
                    {isEditing && (editData.packages || []).length < 3 && (
                      <button onClick={() => {
                        const names: Array<'Basic'|'Standard'|'Premium'> = ['Basic','Standard','Premium'];
                        const used = (editData.packages || []).map(p => p.name);
                        const next = names.find(n => !used.includes(n));
                        if (!next) return;
                        const newPkg = { name: next, price: 50, unit: '/hr', description: '', features: [] };
                        setEditData(prev => ({ ...prev, packages: [...(prev.packages || []), newPkg] }));
                        setEditingPkg((editData.packages || []).length);
                      }} className="text-[11px] font-black text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                        + Add package
                      </button>
                    )}
                  </div>
                  {(editData.packages || []).length === 0 && !isEditing && (
                    <p className="text-[12px] text-slate-400 italic">No packages set yet.</p>
                  )}
                  <div className="space-y-3">
                    {(editData.packages || []).map((pkg, idx) => {
                      const colors = {
                        Basic: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-700', price: 'text-slate-700' },
                        Standard: { bg: 'bg-teal-50', border: 'border-teal-100', badge: 'bg-teal-500 text-white', price: 'text-teal-700' },
                        Premium: { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-500 text-white', price: 'text-amber-700' },
                      }[pkg.name];
                      const isOpen = editingPkg === idx;
                      return (
                        <div key={idx} className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${colors.badge}`}>{pkg.name.toUpperCase()}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[16px] font-black ${colors.price}`}>£{pkg.price}<span className="text-[11px] font-bold opacity-70">{pkg.unit}</span></span>
                              {isEditing && (
                                <button onClick={() => setEditingPkg(isOpen ? null : idx)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                              )}
                              {isEditing && (
                                <button onClick={() => {
                                  setEditData(prev => ({ ...prev, packages: (prev.packages || []).filter((_, i) => i !== idx) }));
                                  setEditingPkg(null);
                                }} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                                  <X className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                          {isEditing && isOpen ? (
                            <div className="space-y-2 mt-3">
                              <input value={pkg.description}
                                onChange={e => setEditData(prev => { const pkgs = [...(prev.packages||[])]; pkgs[idx] = {...pkgs[idx], description: e.target.value}; return {...prev, packages: pkgs}; })}
                                placeholder="Short description..."
                                className="w-full bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none focus:border-teal-400" />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="number" value={pkg.price}
                                  onChange={e => setEditData(prev => { const pkgs = [...(prev.packages||[])]; pkgs[idx] = {...pkgs[idx], price: Number(e.target.value)}; return {...prev, packages: pkgs}; })}
                                  placeholder="Price"
                                  className="bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none focus:border-teal-400" />
                                <select value={pkg.unit}
                                  onChange={e => setEditData(prev => { const pkgs = [...(prev.packages||[])]; pkgs[idx] = {...pkgs[idx], unit: e.target.value}; return {...prev, packages: pkgs}; })}
                                  className="bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none">
                                  {['/hr','/job','/day','/m²','/room'].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                              </div>
                              {/* Features */}
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {pkg.features.map((f, fi) => (
                                  <span key={fi} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-full text-[11px] font-bold text-slate-600">
                                    {f}
                                    <button onClick={() => setEditData(prev => { const pkgs = [...(prev.packages||[])]; pkgs[idx] = {...pkgs[idx], features: pkgs[idx].features.filter((_,i)=>i!==fi)}; return {...prev, packages: pkgs}; })}><X className="w-2.5 h-2.5 text-slate-400" /></button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input value={newPkgFeature} onChange={e => setNewPkgFeature(e.target.value)}
                                  onKeyDown={e => { if (e.key==='Enter' && newPkgFeature.trim()) { setEditData(prev => { const pkgs=[...(prev.packages||[])]; pkgs[idx]={...pkgs[idx],features:[...pkgs[idx].features,newPkgFeature.trim()]}; return {...prev,packages:pkgs}; }); setNewPkgFeature(''); }}}
                                  placeholder="Add feature, press Enter..."
                                  className="flex-1 bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none focus:border-teal-400" />
                              </div>
                            </div>
                          ) : (
                            <>
                              {pkg.description && <p className="text-[12px] text-slate-500 mb-2">{pkg.description}</p>}
                              <ul className="space-y-1">
                                {pkg.features.map((f, fi) => (
                                  <li key={fi} className="flex items-center gap-1.5 text-[12px] text-slate-600 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="text-[14px] font-black text-slate-900 mb-3">{lang === 'ro' ? 'Categorii în care apari' : 'Work Categories'}</h3>
                  <div className="space-y-2">
                    {offeredCategories.map((cat) => {
                      const catLabel = CATS.find(c => c.id === cat.catId)?.label?.replace('\n', ' ') || cat.catId;
                      return (
                        <div key={`${cat.catId}-${cat.sub}`} className="bg-white border border-slate-100 rounded-2xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-black text-slate-800 truncate">{cat.sub}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{catLabel}</div>
                          </div>
                          {cat.isPrimary && <span className="text-[8px] font-black bg-teal-50 text-teal-700 px-2 py-1 rounded-full">MAIN</span>}
                          {isEditing && !cat.isPrimary && (
                            <button onClick={() => handleSetPrimaryCategory(cat.catId, cat.sub)} className="text-[9px] font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
                              Set main
                            </button>
                          )}
                          {isEditing && offeredCategories.length > 1 && (
                            <button onClick={() => handleRemoveCategory(cat.catId, cat.sub)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {isEditing && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newSkillCat}
                            onChange={e => handleSkillCatChange(e.target.value)}
                            className="bg-white rounded-xl px-3 py-2 text-[12px] font-bold text-slate-600 border border-slate-100 outline-none"
                          >
                            {CATS.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label.replace('\n', ' ')}</option>
                            ))}
                          </select>
                          <select
                            value={newSkillSub}
                            onChange={e => setNewSkillSub(e.target.value)}
                            className="bg-white rounded-xl px-3 py-2 text-[12px] font-bold text-slate-600 border border-slate-100 outline-none"
                          >
                            {(CATS.find(cat => cat.id === newSkillCat)?.subs || []).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                        <button onClick={handleAddCategory} className="w-full bg-[#1a4d4d] text-white rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider">
                          {lang === 'ro' ? '+ Adaugă categorie' : '+ Add category'}
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── FAQ SECTION ── */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-slate-900">
                      {lang === 'ro' ? 'Întrebări frecvente' : 'FAQ'}
                    </h3>
                    {isEditing && (
                      <span className="text-[10px] font-bold text-slate-400">{(editData.faqs || []).length} questions</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(editData.faqs || []).map((faq, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 text-left"
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        >
                          <span className="text-[12px] font-black text-slate-800 flex-1 pr-2">{faq.q}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isEditing && (
                              <button onClick={e => { e.stopPropagation(); setEditData(prev => ({ ...prev, faqs: (prev.faqs || []).filter((_, i) => i !== idx) })); }}
                                className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                                <X className="w-3 h-3 text-red-400" />
                              </button>
                            )}
                            <span className="text-slate-400 text-[10px]">{expandedFaq === idx ? '▲' : '▼'}</span>
                          </div>
                        </button>
                        {expandedFaq === idx && (
                          <div className="px-4 pb-3">
                            {isEditing ? (
                              <textarea
                                value={faq.a}
                                onChange={e => setEditData(prev => { const fs = [...(prev.faqs||[])]; fs[idx] = {...fs[idx], a: e.target.value}; return {...prev, faqs: fs}; })}
                                className="w-full bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none focus:border-teal-400 resize-none"
                                rows={3}
                              />
                            ) : (
                              <p className="text-[12px] text-slate-500 leading-relaxed">{faq.a}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="mt-3 bg-slate-50 rounded-2xl border border-slate-100 p-3 space-y-2">
                      <input value={newFaqQ} onChange={e => setNewFaqQ(e.target.value)}
                        placeholder={lang === 'ro' ? 'Întrebare...' : 'Question...'}
                        className="w-full bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none focus:border-teal-400" />
                      <textarea value={newFaqA} onChange={e => setNewFaqA(e.target.value)}
                        placeholder={lang === 'ro' ? 'Răspuns...' : 'Answer...'}
                        rows={2}
                        className="w-full bg-white rounded-xl px-3 py-2 text-[12px] border border-slate-200 outline-none focus:border-teal-400 resize-none" />
                      <button
                        onClick={() => {
                          if (!newFaqQ.trim() || !newFaqA.trim()) return;
                          setEditData(prev => ({ ...prev, faqs: [...(prev.faqs || []), { q: newFaqQ.trim(), a: newFaqA.trim() }] }));
                          setNewFaqQ(''); setNewFaqA('');
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#1a4d4d] text-white text-[11px] font-black uppercase tracking-wider">
                        + {lang === 'ro' ? 'Adaugă întrebare' : 'Add question'}
                      </button>
                    </div>
                  )}
                </section>

                {/* ── AVAILABILITY SECTION ── */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-slate-900">
                      {lang === 'ro' ? 'Disponibilitate' : 'Availability'}
                    </h3>
                    {isEditing && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {lang === 'ro' ? 'setează orele disponibile' : 'set available hours'}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const DAY_KEYS_PM = ['mon','tue','wed','thu','fri','sat','sun'];
                    const DAY_LABELS_PM_RO = ['Lu','Ma','Mi','Jo','Vi','Sâ','Du'];
                    const DAY_LABELS_PM_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];
                    const DAY_FULL_PM_RO = ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'];
                    const DAY_FULL_PM_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                    const HOUR_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
                    const avail: Record<string, string[]> = (editData.availability as any) || {};
                    const dayLabels = lang === 'ro' ? DAY_LABELS_PM_RO : DAY_LABELS_PM_EN;
                    const dayFull = lang === 'ro' ? DAY_FULL_PM_RO : DAY_FULL_PM_EN;
                    const [expandedDay, setExpandedDay] = React.useState<string | null>(null);

                    function toggleHour(dayKey: string, hour: string) {
                      const current = avail[dayKey] || [];
                      const next = current.includes(hour)
                        ? current.filter(h => h !== hour)
                        : [...current, hour].sort();
                      setEditData(prev => ({
                        ...prev,
                        availability: { ...(prev.availability || {}), [dayKey]: next }
                      }));
                    }

                    function toggleDay(dayKey: string) {
                      if (!isEditing) return;
                      setExpandedDay(expandedDay === dayKey ? null : dayKey);
                    }

                    return (
                      <div className="space-y-2">
                        {DAY_KEYS_PM.map((key, i) => {
                          const slots = avail[key] || [];
                          const isActive = slots.length > 0;
                          const isExpanded = expandedDay === key;
                          return (
                            <div key={key} className={`rounded-2xl border overflow-hidden transition-all ${isActive ? 'border-teal-200 bg-teal-50/40' : 'border-slate-100 bg-slate-50'}`}>
                              <button
                                className="w-full flex items-center justify-between px-4 py-3"
                                onClick={() => toggleDay(key)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black ${isActive ? 'bg-[#1a4d4d] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {dayLabels[i]}
                                  </span>
                                  <span className="text-[12px] font-black text-slate-800">{dayFull[i]}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isActive && (
                                    <span className="text-[10px] font-bold text-teal-600">{slots.length} {lang === 'ro' ? 'ore' : 'slots'}</span>
                                  )}
                                  {!isActive && !isEditing && (
                                    <span className="text-[10px] font-bold text-slate-400">{lang === 'ro' ? 'Indisponibil' : 'Unavailable'}</span>
                                  )}
                                  {isEditing && (
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              </button>
                              {isExpanded && isEditing && (
                                <div className="px-4 pb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {HOUR_SLOTS.map(hour => {
                                      const selected = slots.includes(hour);
                                      return (
                                        <button
                                          key={hour}
                                          onClick={() => toggleHour(key, hour)}
                                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                                          style={{
                                            background: selected ? '#1a4d4d' : '#f1f5f9',
                                            color: selected ? 'white' : '#64748b',
                                            border: selected ? '1.5px solid #0d3333' : '1.5px solid transparent',
                                          }}
                                        >
                                          {hour}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditData(prev => ({
                                        ...prev,
                                        availability: { ...(prev.availability || {}), [key]: [] }
                                      }));
                                    }}
                                    className="mt-3 text-[10px] font-bold text-red-400 uppercase tracking-wider"
                                  >
                                    {lang === 'ro' ? 'Șterge ziua' : 'Clear day'}
                                  </button>
                                </div>
                              )}
                              {!isEditing && isActive && (
                                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                                  {slots.map(h => (
                                    <span key={h} className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-700 text-[10px] font-bold">{h}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {!isEditing && !Object.values(avail).some(v => v.length > 0) && (
                          <p className="text-[12px] text-slate-400 italic">
                            {lang === 'ro' ? 'Disponibilitate nesetată.' : 'No availability set.'}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </section>

              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div>
                  <h3 className="text-[18px] font-black text-slate-900 mb-3">{lang === 'ro' ? 'Portofoliu' : 'Portfolio'}</h3>
                  <div className="bg-slate-50 rounded-2xl p-3 space-y-2 mb-4">
                    <input value={newPortTitle} onChange={e => setNewPortTitle(e.target.value)}
                      placeholder={lang === 'ro' ? 'Titlu proiect...' : 'Project title...'}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] outline-none bg-white premium-input" />
                    <input value={newPortUrl} onChange={e => setNewPortUrl(e.target.value)}
                      placeholder={lang === 'ro' ? 'URL imagine (opțional)' : 'Image URL (optional)'}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] outline-none bg-white premium-input" />
                    <button onClick={handleAddPortfolio}
                      className="w-full py-2.5 rounded-xl bg-brand text-white font-black text-[12px] flex items-center justify-center gap-2 premium-btn">
                      <Plus className="w-4 h-4" /> {lang === 'ro' ? 'Adaugă în Portofoliu' : 'Add to Portfolio'}
                    </button>
                    <button
                      onClick={() => portfolioInputRef.current?.click()}
                      disabled={uploading === 'portfolio'}
                      className="w-full py-2.5 rounded-xl bg-white/80 text-[#1a4d4d] font-black text-[12px] flex items-center justify-center gap-2 border border-teal-100 shadow-sm disabled:opacity-60"
                    >
                      <Camera className="w-4 h-4" /> {uploading === 'portfolio' ? 'Uploading' : 'Upload from device'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(editData.port || []).map((item, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200">
                      {item.url ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-bold px-2 text-center">{item.title}</span>
                        </div>
                      )}
                      {isEditing && (
                        <button
                          onClick={() => handleRemovePortfolio(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div className="space-y-3 animate-in fade-in duration-500">
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-slate-400">
                      {lang === 'ro' ? 'Nicio lucrare încă.' : 'No jobs yet.'}
                    </p>
                  </div>
                ) : (
                  jobs.map(job => (
                    <div key={job.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[14px] font-black text-slate-900">{job.customerName}</p>
                          <p className="text-[11px] text-slate-400">{job.sub || job.proSub}</p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-black px-2 py-1 rounded-full",
                          job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          job.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-500'
                        )}>
                          {job.status}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-[12px] text-slate-500 leading-relaxed">{job.description}</p>
                      )}
                      {job.price && (
                        <p className="text-[13px] font-black text-[#1a4d4d] mt-2">{job.price}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-3 animate-in fade-in duration-500">
                {(editData.revs || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-slate-400">
                      {lang === 'ro' ? 'Nicio recenzie încă.' : 'No reviews yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(editData.revs || []).map((rev, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <Star key={s} className={cn("w-3 h-3", s < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{rev.name}</span>
                          {rev.onTime && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {lang === 'ro' ? 'La timp' : 'On time'}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-slate-700 leading-relaxed">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Save button */}
          {isEditing && (
            <div className="px-6 pb-8">
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl bg-[#1a4d4d] text-white font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
              >
                <Save className="w-5 h-5" />
                {lang === 'ro' ? 'Salvează Profilul' : 'Save Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProProfileManagement;
