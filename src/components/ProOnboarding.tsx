import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, CheckCircle2, Search, Briefcase, MapPin, User as UserIcon, Building, Plus, DollarSign, Shield, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { CATS, GRANULAR_SERVICES } from '../constants';

interface ProOnboardingProps {
  onBack: () => void;
  onComplete: (proData: any) => void;
}

export const ProOnboarding: React.FC<ProOnboardingProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(0);
  
  const [formData, setFormData] = useState({
    serviceCatId: '',
    serviceSub: '', // Primary
    additionalServices: [] as string[],
    zip: '',
    businessName: '',
    businessSize: '',
    firstName: 'Andrei',
    lastName: 'Matache',
    email: 'andreimatke@yahoo.com',
    dob: '17.12.1994',
    password: ''
  });

  const [searchService, setSearchService] = useState('');

  const allServices = CATS.flatMap(c => c.subs.map(s => ({ catId: c.id, sub: s })));
  
  const filteredServices = searchService 
    ? allServices.filter(s => s.sub.toLowerCase().includes(searchService.toLowerCase()))
    : allServices.slice(0, 10); 

  const handleNext = () => setStep(prev => Math.min(prev + 1, 6));
  const handlePrev = () => {
    if (step === 0) onBack();
    else setStep(prev => Math.max(prev - 1, 0));
  };

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFinish = () => {
    onComplete(formData);
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return formData.serviceSub !== '';
      case 2: return true; 
      case 3: return formData.zip.length > 2;
      case 4: return formData.businessName.length > 2 && formData.businessSize !== '';
      case 5: return formData.firstName && formData.lastName && formData.email && formData.password.length > 5;
      default: return true;
    }
  };

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full px-5 pt-8 pb-32 overflow-y-auto scrollbar-hide"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-brand" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight leading-tight px-4">Grow your business with Closer</h1>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium px-6">
                Join thousands of pros finding new customers every day. Setup takes 2 mins.
              </p>
            </div>

            {/* Value Props */}
            <div className="space-y-4 mb-8">
              <div className="flex gap-3.5 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-[15px] mb-0.5">No signup or transaction fees</h3>
                  <p className="text-[12px] text-slate-500 leading-tight">Free to join, 0% commission. You keep 100% of your earnings.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-9 h-9 rounded-xl bg-brand/5 flex items-center justify-center shrink-0 border border-brand/10">
                  <UserIcon className="w-4.5 h-4.5 text-brand" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-[15px] mb-0.5">High intent customers</h3>
                  <p className="text-[12px] text-slate-500 leading-tight">Receive leads from customers who choose you based on your profile.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  <Shield className="w-4.5 h-4.5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-[15px] mb-0.5">Total control & flexibility</h3>
                  <p className="text-[12px] text-slate-500 leading-tight">Set your own prices and schedule. You're the boss.</p>
                </div>
              </div>
            </div>

            {/* Comparison Section */}
            <div className="bg-slate-50/50 rounded-[28px] p-5 border border-slate-100">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 text-center">How Closer is different</h4>
              <div className="space-y-3.5">
                {[
                  'Customers choose you directly',
                  'You control your pricing',
                  'Direct communication',
                  'No hidden fees or contracts',
                  'Free pro community'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-700">{feat}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-slate-200/50 flex items-center justify-center">
                        <X className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-5 mt-4 pr-1">
                <span className="text-[9px] font-black text-brand uppercase tracking-tighter">Closer</span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Others</span>
              </div>
            </div>
          </motion.div>
        );
      
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-6 pt-4 flex flex-col h-full"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">What service do you provide?</h2>
            <p className="text-slate-500 text-[14px] mb-6">Select your primary service.</p>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g., Plumber, Cleaner..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-[16px] outline-none focus:border-brand transition-colors font-bold"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pb-24 scrollbar-hide">
              {filteredServices.map((srv, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    updateForm('serviceSub', srv.sub);
                    updateForm('serviceCatId', srv.catId);
                    setFormData(prev => ({ ...prev, additionalServices: [] }));
                  }}
                  className={cn(
                    "w-full text-left px-5 py-5 rounded-2xl border-2 flex items-center justify-between shadow-sm premium-card premium-touch",
                    formData.serviceSub === srv.sub 
                      ? "border-brand bg-brand/5 ring-1 ring-brand/20 shadow-brand/10" 
                      : "border-slate-100 bg-white text-slate-700 hover:border-brand/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-[20px]",
                      formData.serviceSub === srv.sub ? "bg-brand text-white" : "bg-slate-50"
                    )}>
                      {CATS.find(c => c.id === srv.catId)?.icon === 'home' ? '🏠' : 
                       CATS.find(c => c.id === srv.catId)?.icon === 'truck' ? '🚚' : 
                       CATS.find(c => c.id === srv.catId)?.icon === 'sparkles' ? '✨' : '🛠️'}
                    </div>
                    <span className="font-black text-[16px] tracking-tight">{srv.sub}</span>
                  </div>
                  {formData.serviceSub === srv.sub && (
                    <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}

              <button
                onClick={() => alert('Feature coming soon: Request a new category!')}
                className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 group hover:border-brand/50 transition-all mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-brand" />
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-black text-slate-800">Don't see your service?</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Request to add it</div>
                </div>
              </button>
            </div>
          </motion.div>
        );

      case 2:
        const granular = GRANULAR_SERVICES[formData.serviceSub];
        const relatedSubs = CATS.find(c => c.id === formData.serviceCatId)?.subs.filter(s => s !== formData.serviceSub) || [];
        const displayItems = granular || relatedSubs;
        
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-6 pt-4 flex flex-col h-full"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">Select the services you offer.</h2>
            <p className="text-slate-500 text-[14px] mb-6">You'll show up in search results and get jobs for all services you select.</p>
            
            <button 
              onClick={() => {
                const all = displayItems;
                updateForm('additionalServices', formData.additionalServices.length === all.length ? [] : all);
              }}
              className="text-brand text-[14px] font-bold self-start mb-4 hover:underline"
            >
              {formData.additionalServices.length === displayItems.length ? 'Deselect all' : 'Select all'}
            </button>

            <div className="flex-1 overflow-y-auto space-y-0 border-t border-slate-100 pb-24 scrollbar-hide">
              {displayItems.map((sub, idx) => {
                const isSelected = formData.additionalServices.includes(sub);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const next = isSelected 
                        ? formData.additionalServices.filter(s => s !== sub)
                        : [...formData.additionalServices, sub];
                      updateForm('additionalServices', next);
                    }}
                    className="w-full flex items-center gap-4 py-5 border-b border-slate-100 active:bg-slate-50 transition-colors group"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                      isSelected ? "bg-brand border-brand" : "border-slate-200 group-hover:border-brand/40"
                    )}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={cn(
                      "text-[15px] font-bold transition-colors",
                      isSelected ? "text-slate-900" : "text-slate-600"
                    )}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-6 pt-4"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">Where do you work?</h2>
            <p className="text-slate-500 text-[14px] mb-8">Enter your primary zip code or city.</p>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Zip code or City"
                value={formData.zip}
                onChange={(e) => updateForm('zip', e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-[16px] outline-none focus:border-brand transition-colors font-bold"
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-6 pt-4"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">Business Details</h2>
            <p className="text-slate-500 text-[14px] mb-8">Tell customers about your business.</p>

            <div className="space-y-6">
              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Business Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. Andrei's Plumbing"
                    value={formData.businessName}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-[16px] outline-none focus:border-brand transition-colors font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Company Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Just me', '2-5 people', '6-10 people', '11+ people'].map(size => (
                    <button
                      key={size}
                      onClick={() => updateForm('businessSize', size)}
                      className={cn(
                        "py-3 rounded-xl border-2 font-bold text-[14px] transition-all",
                        formData.businessSize === size 
                          ? "border-brand bg-brand/5 text-brand" 
                          : "border-slate-100 bg-white text-slate-600"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-6 pt-4"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 text-[14px] mb-8">Almost there! Complete your personal details.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-[15px] outline-none focus:border-brand font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-[15px] outline-none focus:border-brand font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-[15px] outline-none focus:border-brand font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Date of Birth</label>
                <input 
                  type="text" 
                  value={formData.dob}
                  onChange={(e) => updateForm('dob', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-[15px] outline-none focus:border-brand font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
                <input 
                  type="password" 
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-[15px] outline-none focus:border-brand font-bold"
                />
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-6 pt-20"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">You're all set, {formData.firstName}!</h2>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-12">
              Your Pro account is ready. Let's head to your dashboard to see your first leads.
            </p>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white max-w-md mx-auto shadow-xl relative overflow-hidden font-sans min-h-dvh">
      {/* Dynamic Header */}
      <div className="px-5 py-4 flex items-center justify-between relative z-10 bg-white">
        <button 
          onClick={handlePrev}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            step === 0 || step === 6 ? "opacity-0 pointer-events-none" : "bg-slate-100 text-slate-600 active:scale-90"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {step > 0 && step < 6 && (
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Step {step} of 5
          </div>
        )}
        
        <div className="w-10 h-10" /> {/* Balancer */}
      </div>

      {/* Progress Bar */}
      {step > 0 && step < 6 && (
        <div className="h-1 bg-slate-100 w-full mb-4">
          <motion.div 
            className="h-full bg-brand"
            initial={{ width: `${((step - 1) / 5) * 100}%` }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12">
        {step === 0 ? (
          <button 
            onClick={handleNext}
            className="w-full bg-brand text-white py-4 rounded-2xl font-black text-[16px] shadow-[0_8px_20px_-4px_rgba(45,90,90,0.3)] flex items-center justify-center gap-2 premium-btn"
          >
            Get Started
          </button>
        ) : step < 5 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-[16px] flex items-center justify-center gap-2 premium-btn",
              isStepValid()
                ? "bg-brand text-white shadow-[0_8px_20px_-4px_rgba(45,90,90,0.3)]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            Next <ArrowRight className="w-5 h-5" />
          </button>
        ) : step === 5 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-[16px] premium-btn",
              isStepValid()
                ? "bg-brand text-white shadow-[0_8px_20px_-4px_rgba(45,90,90,0.3)]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            Create Pro Account
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-[16px] shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 premium-btn"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
