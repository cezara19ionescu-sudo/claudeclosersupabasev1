// ═══════════════════════════════════════════════════════════════════════
// CLOSER - I NEED HELP NOW FEATURE
// Optimized for Real Data Integration
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap, X, MapPin, Clock, Shield, Star, ChevronRight, ChevronLeft,
  Wrench, Plug, Key, Car, Monitor, Dog, Heart, AlertCircle,
  CheckCircle2, CreditCard, Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════════

const PRIORITY_FEE = 10.00; // Updated to match chatbot info

const EMERGENCY_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: Wrench, available: 8, color: 'blue', catId: 'home', sub: 'Plumber' },
  { id: 'electrical', name: 'Electrical', icon: Plug, available: 5, color: 'yellow', catId: 'home', sub: 'Electrician' },
  { id: 'locksmith', name: 'Locksmith', icon: Key, available: 3, color: 'gray', catId: 'home', sub: 'Locksmith' },
  { id: 'auto', name: 'Auto Emergency', icon: Car, available: 6, color: 'red', catId: 'auto' },
  { id: 'it', name: 'IT Emergency', icon: Monitor, available: 4, color: 'purple', catId: 'tech' },
  { id: 'pet', name: 'Pet Emergency', icon: Dog, available: 2, color: 'orange', catId: 'pets' },
  { id: 'medical', name: 'Medical On-Call', icon: Heart, available: 3, color: 'pink', catId: 'health' },
];

const COMMON_ISSUES = {
  plumbing: ['Burst pipe', 'Blocked drain', 'No hot water', 'Leaking tap', 'Toilet not flushing'],
  electrical: ['No power', 'Sparking socket', 'Tripped fuse box', 'Light not working'],
  locksmith: ['Locked out', 'Broken key', 'Changed locks needed', 'Lost keys'],
  auto: ['Flat battery', 'Punctured tire', 'Car won\'t start', 'Locked out of car'],
  it: ['Computer crashed', 'Data loss', 'Network down', 'Virus/malware'],
  pet: ['Pet injured', 'Emergency pet-sitting', 'Lost pet', 'Pet behavioral issue'],
  medical: ['At-home nurse', 'Emergency physio', 'Elderly care', 'Post-surgery care'],
};

// ═══════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════

const calculateSurge = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  if (day === 0 && (hour >= 22 || hour < 6)) return { multiplier: 1.75, label: 'Sunday Night' };
  if (hour >= 22 || hour < 6) return { multiplier: 1.5, label: 'Night Surge' };
  if (day === 0 || day === 6) return { multiplier: 1.25, label: 'Weekend' };
  return { multiplier: 1.0, label: 'Standard' };
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function HelpNowFeature({ pros = [], onEmergencyHire, forceOpen = false, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if (onOpenChange) onOpenChange(isOpen);
  }, [isOpen, onOpenChange]);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ 
    postcode: 'NN1 2AB', 
    city: 'Northampton',
    radius: 10 
  });
  const [matchingState, setMatchingState] = useState('idle'); // idle, matching, matched
  const [matchedPros, setMatchedPros] = useState([]);

  const surge = calculateSurge();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const openModal = () => {
    setIsOpen(true);
    setStep(1);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(1);
      setSelectedCategory(null);
      setDescription('');
      setMatchingState('idle');
      setMatchedPros([]);
    }, 300);
  };

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePayment = async () => {
    setMatchingState('matching');
    
    // FILTER REAL PROS
    const filtered = pros.filter(p => {
      if (!selectedCategory) return false;
      const matchesCat = p.catId === selectedCategory.catId;
      const matchesSub = selectedCategory.sub ? p.sub === selectedCategory.sub : true;
      return matchesCat && matchesSub && p.isEmergencyAvailable;
    }).sort((a, b) => b.rating - a.rating);

    await new Promise(resolve => setTimeout(resolve, 2000));
    setMatchedPros(filtered.length > 0 ? filtered : []);
    setMatchingState('matched');
  };

  return (
    <>
      <HelpNowButton onClick={openModal} />

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 max-w-[430px] mx-auto pointer-events-auto">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            
            <div className="absolute bottom-0 w-full md:relative md:max-w-lg md:rounded-2xl rounded-t-3xl max-h-[90vh] bg-white overflow-hidden flex flex-col shadow-2xl animate-slideUp">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {step > 1 && matchingState !== 'matched' && (
                    <button onClick={handlePrevStep} className="p-1 hover:bg-gray-100 rounded-full">
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                      I Need Help Now
                    </h2>
                    {matchingState === 'idle' && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Step {step} of 4</p>}
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Progress */}
              {matchingState === 'idle' && (
                <div className="h-1 bg-gray-100">
                  <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {matchingState === 'idle' && (
                  <>
                    {step === 1 && <CategoryStep onSelect={(cat) => { setSelectedCategory(cat); handleNextStep(); }} selected={selectedCategory} />}
                    {step === 2 && <DescriptionStep category={selectedCategory} description={description} onChange={setDescription} onNext={handleNextStep} />}
                    {step === 3 && <LocationStep location={location} onChange={setLocation} onNext={handleNextStep} />}
                    {step === 4 && <CheckoutStep category={selectedCategory} surge={surge} onPay={handlePayment} />}
                  </>
                )}
                {matchingState === 'matching' && <MatchingScreen />}
                {matchingState === 'matched' && (
                  <EmergencyProsList
                    pros={matchedPros}
                    category={selectedCategory}
                    onClose={closeModal}
                    onHire={(pro) => {
                      onEmergencyHire(pro, description, selectedCategory);
                      closeModal();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
}

function HelpNowButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center shadow-lg px-3 py-2 rounded-2xl text-[11px] font-black gap-1 bg-white text-slate-600 border border-white/20 premium-btn"
    >
      <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
      I NEED HELP NOW
    </button>
  );
}

function CategoryStep({ onSelect, selected }) {
  return (
    <div className="p-5">
      <h3 className="text-xl font-black text-slate-900 mb-1">What's your emergency?</h3>
      <p className="text-[13px] text-slate-500 mb-6">Select the category that best matches your situation</p>
      <div className="grid grid-cols-2 gap-3">
        {EMERGENCY_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selected?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className={`relative p-4 rounded-2xl border-2 text-left premium-card premium-touch ${
                isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-slate-50">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
              </div>
              <div className="font-bold text-[14px] text-slate-900 leading-tight">{cat.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DescriptionStep({ category, description, onChange, onNext }) {
  const suggestions = COMMON_ISSUES[category?.id] || [];
  return (
    <div className="p-5">
      <h3 className="text-xl font-black text-slate-900 mb-1">Describe the problem</h3>
      <p className="text-[13px] text-slate-500 mb-5">The more detail, the faster we match you</p>
      <textarea
        value={description}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Pipe burst under kitchen sink..."
        rows={4}
        className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none resize-none text-[15px] bg-slate-50"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((issue) => (
          <button
            key={issue}
            onClick={() => onChange(issue)}
            className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-orange-100 rounded-full transition-colors text-slate-600"
          >
            {issue}
          </button>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={description.length < 5}
        className="mt-8 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function LocationStep({ location, location: _, onChange, onNext }) {
  return (
    <div className="p-5">
      <h3 className="text-xl font-black text-slate-900 mb-1">Confirm location</h3>
      <p className="text-[13px] text-slate-500 mb-6">We'll find pros closest to you</p>
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-black text-slate-900 text-[15px]">{location.city}</div>
          <div className="text-[13px] text-slate-500 font-medium">{location.postcode}</div>
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
      >
        Continue to Payment <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckoutStep({ surge, onPay }) {
  return (
    <div className="p-5">
      <h3 className="text-xl font-black text-slate-900 mb-1">Ready to get matched?</h3>
      <p className="text-[13px] text-slate-500 mb-6">Pay the Priority Fee to unlock emergency pros instantly</p>
      <div className="bg-slate-50 rounded-2xl p-5 mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-black text-slate-900 text-[15px]">Priority Matching Fee</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Immediate Dispatch</div>
          </div>
          <div className="font-black text-xl text-orange-500">£{PRIORITY_FEE.toFixed(2)}</div>
        </div>
        {surge.multiplier > 1.0 && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase">
            <Zap className="w-3.5 h-3.5 fill-amber-700" /> {surge.label} SURGE ACTIVE
          </div>
        )}
      </div>
      <button
        onClick={onPay}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
      >
        <CreditCard className="w-5 h-5" /> PAY £{PRIORITY_FEE.toFixed(2)} & GET MATCHED
      </button>
    </div>
  );
}

function MatchingScreen() {
  return (
    <div className="p-10 text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20" />
        <div className="relative w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-200">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-2">Finding your match...</h3>
      <p className="text-[15px] text-slate-500 font-medium">Contacting verified pros available right now</p>
    </div>
  );
}

function EmergencyProsList({ pros, category, onClose, onHire }) {
  if (pros.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">No pros available right now</h3>
        <p className="text-[13px] text-slate-500 mb-6">Sorry, but there are no {category?.name} professionals online at this moment in your area.</p>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl">Return to Search</button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50">
      <div className="mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          {pros.length} verified pros matched
        </div>
        <h3 className="text-xl font-black text-slate-900">Available {category?.name} Pros</h3>
      </div>
      <div className="space-y-4 pb-6">
        {pros.map((pro, i) => (
          <EmergencyProCard key={pro.id} pro={pro} index={i} onHire={() => onHire(pro)} />
        ))}
      </div>
    </div>
  );
}

function EmergencyProCard({ pro, index, onHire }) {
  return (
    <div 
      className="bg-white border-2 border-orange-100 rounded-[24px] p-5 shadow-sm animate-slideUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex gap-4 mb-4">
        <div className="relative shrink-0">
          <img src={pro.img} alt={pro.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-black text-slate-900 text-[17px] truncate pr-2">{pro.name}</h4>
            <div className="text-right shrink-0">
              <div className="font-black text-orange-500 text-[15px]">£{pro.price * 1.5}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Total</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[13px] font-black text-slate-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {pro.rating}
              <span className="text-[11px] text-slate-400 font-bold ml-0.5">({pro.rc})</span>
            </div>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <div className="text-[12px] text-slate-500 font-bold">{pro.sub}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
          <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-0.5">Response Time</div>
          <div className="text-[13px] font-black text-orange-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Under 15m
          </div>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Availability</div>
          <div className="text-[13px] font-black text-emerald-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Arrives ASAP
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 text-[13px] font-black text-slate-400 py-3.5 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-wider">
          Profile
        </button>
        <button 
          onClick={onHire}
          className="flex-[2] bg-orange-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all uppercase tracking-wider text-[13px]"
        >
          Get Help Now
        </button>
      </div>
    </div>
  );
}
