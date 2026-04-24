import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Globe, Search, X, ChevronLeft, ChevronRight, Star, MapPin, Shield, CheckCircle2, DollarSign, MessageSquare, Calendar, Clock, Send, LogOut, Bell, User as UserIcon, Briefcase, Compass, Wrench, Zap, Paintbrush, Hammer, Lock, Construction, Droplets, PaintRoller, Eye, Sparkles, Plus, Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Info, AlertTriangle, Scissors, Car, Truck, Clipboard, Camera, Music, ChefHat, Flower, Calculator, Dumbbell, Smartphone, TreeDeciduous, Dog, Scale, BookOpen, Brain, Utensils, Monitor } from 'lucide-react';
import { cn } from './lib/utils';
import { User, UserType, Category, Professional, Job, Message, Review } from './types';
import { CATS, PROS, SUB_IC, AVC, AVE, STC, STL, SUB_ALIASES } from './constants';
import { AppContainer, BottomNav } from './components/Layout';
import { AuthScreen } from './components/Auth';
import { SearchBar, CategoryGrid, ProCard } from './components/Explore';
import { Modal } from './components/Modal';
import { JobsList } from './components/Jobs';
import { SearchResultsScreen } from './components/SearchResults';
import { AboutCloserSection } from './components/About';
import CloserChatBot from './components/CloserChatBot';
import HelpNowFeature from './components/HelpNow/HelpNowFeature';
import CloserAppPresentation from './components/CloserAppPresentation';
import { SmartSearchEngine } from './utils/CloserSmartSearch';
import { matchProToFilters, rankPros, generateSmartSummary } from './utils/CloserSmartFilters';
import { SmartSearchResults } from './components/SmartSearchResults';
import { SearchSurvey } from './components/SearchSurvey';
import { ProOnboarding } from './components/ProOnboarding';
import { translations, Language } from './utils/translations';
import { ProProfileManagement } from './components/ProProfileManagement';
import ProDashboard from './components/ProDashboard';
import { supabase } from './lib/supabase';
import * as db from './lib/database';

const engine = new SmartSearchEngine();

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [allMsgs, setAllMsgs] = useState<Message[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allPros, setAllPros] = useState<Professional[]>(PROS || []);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // --- SUPABASE AUTH ---
  // Simple helper: make a User from any Supabase auth user
  const makeUser = (su: any): User => ({
    id: su.id,
    name: su.user_metadata?.name || su.email?.split('@')[0] || 'User',
    email: su.email || '',
    type: (su.user_metadata?.type as UserType) || 'customer',
    img: ''
  });

  useEffect(() => {
    let cancelled = false;
    let signingIn = false; // flag to ignore SIGNED_OUT during login flow

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AUTH] getSession result:', session ? `user=${session.user.email}` : 'no session');
        if (cancelled) return;
        if (session?.user) {
          const u = makeUser(session.user);
          console.log('[AUTH] Setting user from session:', u.name, u.email);
          setUser(u);
          db.getProfile(session.user.id).then(profile => {
            if (!cancelled && profile) {
              console.log('[AUTH] Got profile from DB, updating user');
              setUser(profile);
            }
          }).catch((e) => console.warn('[AUTH] getProfile failed:', e));
          loadUserData(session.user.id).catch(() => {});
        } else {
          console.log('[AUTH] No session found, showing login screen');
        }
      } catch (e) {
        console.error('[AUTH] Init error:', e);
      }
      if (!cancelled) setAuthLoading(false);
      loadProfessionals().catch(() => {});
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      console.log('[AUTH] Event:', event, session?.user?.email || 'no user');
      if (event === 'SIGNED_IN' && session?.user) {
        signingIn = false;
        const u = makeUser(session.user);
        console.log('[AUTH] SIGNED_IN → setting user:', u.name);
        setUser(u);
        setAuthLoading(false);
        db.getProfile(session.user.id).then(profile => {
          if (!cancelled && profile) setUser(profile);
        }).catch(() => {});
        loadUserData(session.user.id).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        // Only clear user if this is a real logout, not part of login flow
        if (!signingIn) {
          console.log('[AUTH] SIGNED_OUT → clearing user');
          setUser(null);
          setAllJobs([]);
          setAllMsgs([]);
        } else {
          console.log('[AUTH] SIGNED_OUT ignored (part of login flow)');
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('[AUTH] Token refreshed for:', session.user.email);
      }
    });

    // Expose signingIn flag so handleAuthSuccess can set it
    (window as any).__closerSigningIn = (v: boolean) => { signingIn = v; };

    const timer = setTimeout(() => { if (!cancelled) setAuthLoading(false); }, 2000);

    return () => { cancelled = true; clearTimeout(timer); subscription.unsubscribe(); delete (window as any).__closerSigningIn; };
  }, []);

  // Load professionals from Supabase + merge with static PROS
  const loadProfessionals = async () => {
    try {
      const dbPros = await db.getAllProfessionals();
      if (dbPros.length > 0) {
        // Merge: DB pros take priority, then add static PROS that aren't in DB
        const dbEmails = new Set(dbPros.map(p => p.email));
        const dbIds = new Set(dbPros.map(p => p.id));
        const staticOnly = (PROS || []).filter(p => !dbEmails.has(p.email) && !dbIds.has(p.id));
        setAllPros([...dbPros, ...staticOnly]);
      }
    } catch (e) {
      console.error('Error loading professionals:', e);
      // Fallback to static PROS
    }
  };

  // Load user-specific data (jobs, messages)
  const loadUserData = async (userId: string) => {
    try {
      const [jobs, messages] = await Promise.all([
        db.getMyJobs(userId),
        db.getMyMessages(userId)
      ]);
      setAllJobs(jobs);
      setAllMsgs(messages);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user) return;

    let msgChannel: any = null;
    let jobChannel: any = null;

    try {
      msgChannel = db.subscribeToMessages(user.id, (newMsg) => {
        setAllMsgs(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      jobChannel = db.subscribeToJobs(user.id, (updatedJob) => {
        setAllJobs(prev => {
          const idx = prev.findIndex(j => j.id === updatedJob.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedJob;
            return next;
          }
          return [...prev, updatedJob];
        });
      });
    } catch (e) {
      console.error('Realtime subscription error:', e);
    }

    return () => {
      if (msgChannel) supabase.removeChannel(msgChannel);
      if (jobChannel) supabase.removeChannel(jobChannel);
    };
  }, [user]);

  const [tab, setTab] = useState(0);
  const [step, setStep] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'calendar' | 'hire' | 'chat' | 'review' | 'edit-profile' | 'notifications' | 'privacy' | 'help' | null>(null);
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [hirePrice, setHirePrice] = useState('');
  const [hireDesc, setHireDesc] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewJob, setReviewJob] = useState<Job | null>(null);
  const [isCalling, setIsCalling] = useState<false | 'voice' | 'video'>(false);
  const [showCallLimitInfo, setShowCallLimitInfo] = useState(false);
  // authError no longer needed - handled inside AuthScreen
  const [isSplash, setIsSplash] = useState(true);
  const [dealIndex, setDealIndex] = useState(0);
  const [showEmergencyInfo, setShowEmergencyInfo] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{message: string, estimate: string | undefined, safetyTip?: string | null, followUps?: string[]} | null>(null);
  const [showEmergencyActivation, setShowEmergencyActivation] = useState(false);
  const [emergencyStartTime, setEmergencyStartTime] = useState(() => localStorage.getItem('closer_emergency_start') || '08:00');
  const [emergencyEndTime, setEmergencyEndTime] = useState(() => localStorage.getItem('closer_emergency_end') || '22:00');
  const [emergencyExpiresAt, setEmergencyExpiresAt] = useState<string | null>(() => localStorage.getItem('closer_emergency_expires'));
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('closer_lang');
    if (saved === 'en' || saved === 'ro') return saved as Language;
    return 'en';
  });

  const t = (key: string) => {
    try {
      const group = translations[lang] || translations['en'];
      return (group as any)[key] || key;
    } catch (e) {
      return key;
    }
  };
  
  // --- SURVEY STATE ---
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveySub, setSurveySub] = useState<string | null>(null);
  const [surveyCat, setSurveyCat] = useState<Category | null>(null);

  const dealScrollRef = useRef<HTMLDivElement>(null);

  const handleDealScroll = () => {
    if (dealScrollRef.current) {
      const scrollLeft = dealScrollRef.current.scrollLeft;
      const width = dealScrollRef.current.offsetWidth - 40; // accounting for padding/gap
      const index = Math.round(scrollLeft / width);
      setDealIndex(index);
    }
  };

  // --- PROFILE EDIT STATE ---
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('👤');

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      // In a real app we'd have an avatar field, for now we use the emoji logic
      setEditAvatar(user.type === 'customer' ? '👤' : '🛠️');

      if (user.type === 'professional') {
        const pro = allPros.find(p => p.id === user.id || p.email === user.email);
        if (pro) {
          setIsProEmergencyActive(!!pro.isEmergencyAvailable);
        }
      } else {
        setIsEmergency(false); // Reset SOS mode for customers on login
      }
    }
  }, [user]);

  // --- LOCAL PERSISTENCE (only for UI preferences) ---
  useEffect(() => {
    localStorage.setItem('closer_emergency_start', emergencyStartTime);
    localStorage.setItem('closer_emergency_end', emergencyEndTime);
    localStorage.setItem('closer_lang', lang);
    if (emergencyExpiresAt) localStorage.setItem('closer_emergency_expires', emergencyExpiresAt);
    else localStorage.removeItem('closer_emergency_expires');
  }, [emergencyStartTime, emergencyEndTime, emergencyExpiresAt, lang]);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // --- AUTO-TRIGGER SOS ---
  useEffect(() => {
    if (!search || search.length < 4 || showEmergencyModal) return;
    const s = search.toLowerCase();
    const urgentKeywords = ['urgenta', 'i need now', 'acum', 'urgent', 'asap', 'nevoie acum'];
    if (urgentKeywords.some(k => s.includes(k))) {
      setShowEmergencyModal(true);
    }
  }, [search, showEmergencyModal]);

  // --- HELPERS ---
  const myJobs = useMemo(() => {
    if (!user) return [];
    return allJobs.filter(j => j.cId === user.id || j.pId === user.id || j.cEmail === user.email || j.pEmail === user.email);
  }, [allJobs, user]);

  const isProRole = (j: Job) => j.pId === user?.id || j.pEmail === user?.email;
  
  const pendingCnt = useMemo(() => myJobs.filter(j => ['hired', 'finish_requested'].includes(j.status)).length, [myJobs]);
  const unreadMsgs = useMemo(() => allMsgs.filter(m => m.to === user?.id && !m.read).length, [allMsgs, user]);

  const markAsRead = (proId: string) => {
    if (!user) return;
    const cid = [user.id, proId].sort().join('-');
    setAllMsgs(prev => prev.map(m =>
      (m.cid === cid && m.to === user.id && !m.read) ? { ...m, read: true } : m
    ));
    // Sync to Supabase
    db.markMessagesAsRead(cid, user.id).catch(e => console.error('Error marking as read:', e));
  };

  // --- EMERGENCY AUTO-EXPIRATION ---
  useEffect(() => {
    if (!isEmergency || !emergencyExpiresAt) return;
    
    const checkExpiry = () => {
      if (new Date() > new Date(emergencyExpiresAt)) {
        setIsProEmergencyActive(false);
        setEmergencyExpiresAt(null);
        const pro = allPros.find(p => p.id === user?.id || p.email === user?.email);
        if (pro) pro.isEmergencyAvailable = false;
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isEmergency, emergencyExpiresAt, user]);

  // --- AUTO SLIDE DEALS ---
  useEffect(() => {
    if (step === 0 && tab === 0) {
      const interval = setInterval(() => {
        if (dealScrollRef.current) {
          const nextIndex = (dealIndex + 1) % 5;
          const width = dealScrollRef.current.offsetWidth - 40;
          dealScrollRef.current.scrollTo({
            left: nextIndex * width,
            behavior: 'smooth'
          });
          setDealIndex(nextIndex);
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [step, tab, dealIndex]);

  const existingJob = useMemo(() => {
    if (!selectedPro || !user) return null;
    return allJobs.find(j => 
      (j.pId === selectedPro.id || j.pEmail === selectedPro.email) && 
      (j.cId === user.id || j.cEmail === user.email) && 
      !['cancelled', 'declined', 'completed'].includes(j.status)
    );
  }, [allJobs, selectedPro, user]);

  const [showSOS, setShowSOS] = useState(false);
  const [incomingSOS, setIncomingSOS] = useState<Job | null>(null);
  
  const [isProEmergencyActive, setIsProEmergencyActive] = useState(false);
  
  // Detect incoming SOS for Pro
  useEffect(() => {
    if (!user || user.type !== 'professional') return;
    const latestSOS = allJobs.find(j => 
      j.pId === user.id && 
      j.isEmergency && 
      j.status === 'hired'
    );
    
    if (latestSOS && (!incomingSOS || incomingSOS.id !== latestSOS.id)) {
      setIncomingSOS(latestSOS);
      setShowSOS(true);
    }
  }, [allJobs, user, incomingSOS]);

  const currentConv = useMemo(() => {
    if (!selectedPro || !user) return [];
    const cid = [user.id, selectedPro.id].sort().join('-');
    return allMsgs.filter(m => m.cid === cid);
  }, [allMsgs, selectedPro, user]);

  const toggleEmergency = () => {
    if (isProEmergencyActive) {
      // Deactivating is straightforward
      setIsProEmergencyActive(false);
      setEmergencyExpiresAt(null);
      const pro = PROS.find(p => p.id === user?.id || p.email === user?.email);
      if (pro) pro.isEmergencyAvailable = false;
    } else {
      // Activating requires showing the new modal
      setShowEmergencyActivation(true);
    }
  };

  const handleActivateEmergency = () => {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    
    setEmergencyExpiresAt(expires.toISOString());
    setIsProEmergencyActive(true);
    setShowEmergencyActivation(false);

    const pro = PROS.find(p => p.id === user?.id || p.email === user?.email);
    if (pro) {
      pro.isEmergencyAvailable = true;
      // In a real app, we would also save the specific hours (startTime to endTime)
    }
  };

  const handleViewMyProfile = () => {
    if (!user || user.type !== 'professional') return;
    const me = allPros.find(p => p.id === user.id) || allPros.find(p => p.email === user.email);
    if (me) {
      setSelectedPro(me);
      setSelectedCat(null);
      setSelectedSub(null);
      setStep(3);
      setTab(0);
    }
  };

  const handleUpdatePro = (updatedPro: Professional) => {
    setAllPros(prev => prev.map(p => p.id === updatedPro.id ? updatedPro : p));
    setSelectedPro(updatedPro);
    // If it's the current user, update user state too if needed
    if (user && user.id === updatedPro.id) {
      setUser({ ...user, name: updatedPro.name, img: updatedPro.img });
    }
    // Sync to Supabase
    const proAny = updatedPro as any;
    if (proAny._dbId) {
      db.updateProfessional(proAny._dbId, updatedPro).catch(e => console.error('Error updating pro:', e));
    }
  };

  const handleUpdateJobPhotos = (jobId: string, photos: string[]) => {
    setAllJobs(prev => prev.map(j => j.id === jobId ? { ...j, photos } : j));
    // Sync to Supabase
    const job = allJobs.find(j => j.id === jobId);
    if (job) {
      db.updateJobStatus(jobId, job.status, { photos }).catch(e => console.error('Error updating photos:', e));
    }
  };

  // --- ACTIONS ---
  const handleAiSearch = async (specificQuery?: string) => {
    const queryToSearch = specificQuery || search;
    if (!queryToSearch.trim()) return;
    if (specificQuery) setSearch(specificQuery);
    
    setIsAiLoading(true);
    setAiFeedback(null);
    
    // Use the local Smart Search Engine
    const startTime = Date.now();
    const results = engine.search(queryToSearch);
    
    // Simulate smart minimum delay for better UX
    const elapsed = Date.now() - startTime;
    if (elapsed < 600) await new Promise(res => setTimeout(res, 600 - elapsed));
    
    setIsAiLoading(false);

    if (results && results.aiResponse) {
      const resp = results.aiResponse;
      
      if (resp.urgency === 'emergency') {
        setIsEmergency(true);
        setShowEmergencyInfo(true);
      } else {
        setIsEmergency(false);
      }

      setAiFeedback({
        message: resp.friendly_message,
        estimate: resp.estimated_price,
        safetyTip: resp.safety_tip,
        followUps: results.chips || []
      });
      
      // Update search to matched subcategory for filtering
      if (results.subcategories.length > 0) {
        setSearch(results.subcategories[0]);
        // Also auto-select category to show results
        const cat = CATS.find(c => c.id === results.categories[0].toLowerCase() || c.label.includes(results.categories[0]));
        if (cat) {
          setSelectedCat(cat);
          setSelectedSub(results.subcategories[0]);
          setStep(4);
        }
      } else if (results.categories.length > 0) {
        const cat = CATS.find(c => c.id === results.categories[0].toLowerCase() || c.label.includes(results.categories[0]));
        if (cat) {
          setSelectedCat(cat);
          setSelectedSub(null);
          setStep(4);
        }
      }
    }
  };

  const handleSubSelect = (sub: string, cat: Category) => {
    setSurveySub(sub);
    setSurveyCat(cat);
    setShowSurvey(true);
  };

  const handleSurveyComplete = (data: any) => {
    setShowSurvey(false);
    if (surveySub) {
      setSearch(surveySub);
      setSelectedSub(surveySub);
      if (surveyCat) setSelectedCat(surveyCat);
      setStep(4); // Go to results
    }
  };

  const handleTabChange = (t: number) => {
    setTab(t);
    setStep(0);
    setSelectedCat(null);
    setSelectedSub(null);
    setSelectedPro(null);
    setAiFeedback(null);
    setSearch('');
  };

  // Called from AuthScreen after successful signIn/signUp
  const handleAuthSuccess = async () => {
    console.log('[AUTH] handleAuthSuccess called');
    // The onAuthStateChange listener will handle setting the user.
    // But as a safety net, if the listener didn't fire within 1s, set user manually.
    await new Promise(r => setTimeout(r, 1000));

    // If user is STILL null after 1 second, try to get session manually
    try {
      const session = await db.getSession();
      if (session?.user) {
        console.log('[AUTH] Safety net: setting user from session');
        setUser(makeUser(session.user));
        loadUserData(session.user.id).catch(() => {});
        loadProfessionals().catch(() => {});
      }
    } catch (e) {
      console.error('[AUTH] handleAuthSuccess error:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await db.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setAllJobs([]);
    setAllMsgs([]);
    setIsEmergency(false);
    setIsProEmergencyActive(false);
    setTab(0);
    setStep(0);
  };

  const goBack = () => {
    if (modal) { setModal(null); return; }
    if (step === 4) {
      setStep(1);
      setSelectedSub(null);
      return;
    }
    if (step === 3) { 
      if (selectedSub) setStep(4);
      else if (selectedCat) setStep(1);
      else setStep(0);
      setSelectedPro(null); 
    }
    else if (step === 2) { 
      if (selectedCat) setStep(1);
      else setStep(0);
      setSelectedSub(null); 
    }
    else if (step === 1) { 
      setStep(0); 
      setSelectedCat(null); 
      setSearch('');
    }
  };

  const handleHire = async () => {
    if (!hirePrice || !selectedPro || !user) return;
    try {
      // Find the pro's DB professional_id
      const proAny = selectedPro as any;
      const newJob = await db.createJob({
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        professionalId: proAny._dbId || selectedPro.id,
        proUserId: selectedPro.id,
        proName: selectedPro.name,
        proEmail: selectedPro.email,
        proSub: selectedPro.sub,
        price: hirePrice,
        description: hireDesc,
        slot: selSlot || 'Flexible',
        isEmergency: isEmergency
      });
      setAllJobs(prev => [...prev, newJob]);
    } catch (e) {
      console.error('Error creating job:', e);
      // Fallback to local job creation
      const localJob: Job = {
        id: `j_${Date.now()}`,
        cId: user.id,
        cName: user.name,
        cEmail: user.email,
        pId: selectedPro.id,
        pEmail: selectedPro.email,
        pName: selectedPro.name,
        pSub: selectedPro.sub,
        price: hirePrice,
        desc: hireDesc,
        slot: selSlot || 'Flexible',
        status: 'hired',
        cFin: false,
        pFin: false,
        rev: null,
        pRev: null,
        created: new Date().toISOString()
      };
      setAllJobs(prev => [...prev, localJob]);
    }
    setModal(null);
    setHirePrice('');
    setHireDesc('');
    setTab(1);
    setStep(0);
    setSelectedCat(null);
    setSelectedSub(null);
    setSelectedPro(null);
  };

  const handleJobAction = (jid: string, act: string) => {
    const job = allJobs.find(j => j.id === jid);
    if (act === 'book_again' || act === 'reschedule') {
      if (job) {
        const p = PROS.find(x => x.id === job.pId);
        if (p) {
          setSelectedPro(p);
          setModal(act === 'book_again' ? 'hire' : 'calendar');
        }
      }
      return;
    }

    // Update locally first for instant UI feedback
    setAllJobs(prev => prev.map(j => {
      if (j.id !== jid) return j;
      if (act === 'accept') return { ...j, status: 'active' };
      if (act === 'decline') return { ...j, status: 'declined' };
      if (act === 'cancel') return { ...j, status: 'cancelled' };
      if (act === 'fin-c') {
        if (j.pFin) return { ...j, cFin: true, status: 'completed' };
        return { ...j, cFin: true, status: 'finish_requested' };
      }
      if (act === 'fin-p') {
        if (j.cFin) return { ...j, pFin: true, status: 'completed' };
        return { ...j, pFin: true, status: 'finish_requested' };
      }
      if (act === 'dispute') return { ...j, disputed: true };
      return j;
    }));

    // Then sync to Supabase
    const currentJob = allJobs.find(j => j.id === jid);
    if (currentJob) {
      let newStatus = currentJob.status;
      let extras: any = {};
      if (act === 'accept') newStatus = 'active';
      if (act === 'decline') newStatus = 'declined';
      if (act === 'cancel') newStatus = 'cancelled';
      if (act === 'fin-c') {
        extras.customerFinished = true;
        newStatus = currentJob.pFin ? 'completed' : 'finish_requested';
      }
      if (act === 'fin-p') {
        extras.proFinished = true;
        newStatus = currentJob.cFin ? 'completed' : 'finish_requested';
      }
      if (act === 'dispute') extras.isDisputed = true;

      db.updateJobStatus(jid, newStatus, extras).catch(e => console.error('Error updating job:', e));
    }
  };

  const handleSendMsg = async () => {
    if (!chatMsg.trim() || !selectedPro || !user) return;
    const cid = [user.id, selectedPro.id].sort().join('-');
    const hasEmergencyJob = myJobs.some(j =>
      (j.pId === selectedPro.id || j.cId === selectedPro.id) &&
      j.isEmergency &&
      ['hired', 'active', 'finish_requested'].includes(j.status)
    );

    const msgText = chatMsg.trim();
    setChatMsg('');

    try {
      const newMsg = await db.sendMessage({
        conversationId: cid,
        fromId: user.id,
        fromName: user.name,
        toId: selectedPro.id,
        text: msgText,
        isEmergency: hasEmergencyJob
      });
      setAllMsgs(prev => [...prev, newMsg]);
    } catch (e) {
      console.error('Error sending message:', e);
      // Fallback to local message
      const localMsg: Message = {
        id: `m_${Date.now()}`,
        cid,
        from: user.id,
        fn: user.name,
        to: selectedPro.id,
        text: msgText,
        time: new Date().toISOString(),
        read: false,
        isEmergency: hasEmergencyJob
      };
      setAllMsgs(prev => [...prev, localMsg]);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewJob || !reviewText.trim() || !user) return;
    const isPro = reviewJob.pId === user.id || reviewJob.pEmail === user.email;
    const rv: Review = { rating: reviewRating, text: reviewText, by: user.name, date: new Date().toLocaleDateString() };

    // Update locally first
    setAllJobs(prev => prev.map(j => {
      if (j.id !== reviewJob.id) return j;
      if (isPro) return { ...j, pRev: rv };
      return { ...j, rev: rv };
    }));

    // Save to Supabase
    try {
      await db.createJobReview({
        jobId: reviewJob.id,
        authorId: user.id,
        authorType: isPro ? 'professional' : 'customer',
        rating: reviewRating,
        text: reviewText
      });
    } catch (e) {
      console.error('Error creating review:', e);
    }

    setModal(null);
    setReviewText('');
    setReviewRating(5);
    setReviewJob(null);
  };

  const handleUpdateProfile = async () => {
    if (!user || !editName.trim() || !editEmail.trim()) return;
    const updatedUser = { ...user, name: editName.trim(), email: editEmail.trim() };
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setModal(null);

    // Save to Supabase
    try {
      await db.updateProfile(user.id, { name: editName.trim() });
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };


  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (modal === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConv, modal]);

  // --- RENDER HELPERS ---
  const searchResults = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return null;
    
    const stopWords = ['i', 'need', 'a', 'an', 'the', 'to', 'for', 'my', 'in', 'want', 'looking', 'some', 'urgent', 'urgently', 'am', 'vreau', 'un', 'o'];
    const searchWords = s.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    
    const partialMatch = (target: string) => {
      const t = target.toLowerCase();
      // Only check partial match if there is at least one valid search word not in stopwords
      return searchWords.length > 0 && searchWords.some(w => t.includes(w));
    };

    let res = allPros.filter(p => {
      const cat = CATS.find(c => c.id === p.catId);
      const catLabel = cat ? cat.label.toLowerCase() : '';
      const aliases = cat?.aliases || [];
      const subAliases = SUB_ALIASES[p.sub] || [];
      
      const exactAliasMatch = aliases.some(alias => {
        try { return new RegExp(`\\b${alias.toLowerCase()}\\b`, 'i').test(s); } catch { return false; }
      });
      const partialAliasMatch = aliases.some(alias => partialMatch(alias));
      
      const exactSubAliasMatch = subAliases.some(alias => {
        try { return new RegExp(`\\b${alias.toLowerCase()}\\b`, 'i').test(s); } catch { return false; }
      });
      const partialSubAliasMatch = subAliases.some(alias => partialMatch(alias));

      return p.name.toLowerCase().includes(s) || 
        p.sub.toLowerCase().includes(s) || 
        catLabel.includes(s) ||
        exactAliasMatch ||
        partialAliasMatch ||
        exactSubAliasMatch ||
        partialSubAliasMatch ||
        partialMatch(p.sub) ||
        partialMatch(catLabel) ||
        p.svcs.some(svc => svc.toLowerCase().includes(s) || partialMatch(svc));
    });
    
    if (isEmergency && user?.type !== 'professional') {
      res = res.filter(p => p.isEmergencyAvailable);
    }
    return res;
  }, [search, isEmergency, user]);

  const matchedSubcategories = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    
    const stopWords = ['i', 'need', 'a', 'an', 'the', 'to', 'for', 'my', 'in', 'want', 'looking', 'some', 'urgent', 'urgently', 'am', 'vreau', 'un', 'o'];
    const searchWords = s.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    
    const partialMatch = (target: string) => {
      const t = target.toLowerCase();
      return searchWords.length > 0 && searchWords.some(w => t.includes(w));
    };
    
    let subs: Array<{sub: string, cat: Category}> = [];

    CATS.forEach(c => {
      const catLabel = c.label.toLowerCase();
      const aliases = c.aliases || [];
      const exactAliasMatch = aliases.some(alias => {
        try { return new RegExp(`\\b${alias.toLowerCase()}\\b`, 'i').test(s); } catch { return false; }
      });
      const partialAliasMatch = aliases.some(alias => partialMatch(alias));
      
      const categoryMatches = catLabel.includes(s) || exactAliasMatch || partialAliasMatch || partialMatch(catLabel);
      
      if (categoryMatches) {
        c.subs.forEach(sub => {
          if (!subs.find(x => x.sub === sub)) subs.push({sub, cat: c});
        });
      } else {
        c.subs.forEach(sub => {
          const subAliases = SUB_ALIASES[sub] || [];
          const exactSubAliasMatch = subAliases.some(alias => {
            try { return new RegExp(`\\b${alias.toLowerCase()}\\b`, 'i').test(s); } catch { return false; }
          });
          const partialSubAliasMatch = subAliases.some(alias => partialMatch(alias));

          if (sub.toLowerCase().includes(s) || partialMatch(sub) || exactSubAliasMatch || partialSubAliasMatch) {
            if (!subs.find(x => x.sub === sub)) subs.push({sub, cat: c});
          }
        });
      }
    });

    return subs;
  }, [search]);

  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-[#2d5a5a] flex flex-col items-center justify-center z-[1000]">
        <img 
          src="https://i.imgur.com/OBYrlgU.png" 
          alt="Closer Logo" 
          className="h-32 object-contain mb-6 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          referrerPolicy="no-referrer"
        />
        <div className="text-[13px] text-white/60">{lang === 'ro' ? 'Servicii locale în care poți avea încredere' : 'Local services you can trust'}</div>
      </div>
    );
  }

  const handleProSignup = async (proData: any) => {
    const em = proData.email.trim().toLowerCase();
    const password = proData.password || 'closer123'; // ProOnboarding should include password field
    const fullName = `${proData.firstName} ${proData.lastName}`;

    try {
      // Sign up via Supabase Auth
      await db.signUp(em, password, fullName, 'professional');

      // Wait for session
      const session = await db.getSession();
      if (session?.user) {
        const userId = session.user.id;
        const profile = await db.getProfile(userId);
        if (profile) {
          setUser(profile);

          // Create professional entry in Supabase
          try {
            await db.createProfessional({
              user_id: userId,
              name: fullName,
              email: em,
              catId: proData.category || 'home',
              sub: proData.subcategory || 'Handyman',
              loc: proData.location || 'Local',
              about: proData.bio || 'New professional on Closer.',
              rating: 5.0,
              rc: 0,
              jobs: 0,
              price: 30,
              unit: '/hr',
              v: { id: 1, dbs: 0, ins: 0 },
              svcs: [],
              isEmergencyAvailable: false
            });
          } catch (proErr) {
            console.error('Error creating pro profile:', proErr);
          }

          await loadProfessionals();
          await loadUserData(userId);
        }
      }
    } catch (e: any) {
      console.error('Pro signup error:', e);
      alert(e.message || 'Signup failed');
      return;
    }

    setIsOnboarding(false);
  };

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[#2d5a5a]">
        <img src="https://i.imgur.com/OBYrlgU.png" alt="Closer" className="h-24 object-contain mb-4 animate-pulse" referrerPolicy="no-referrer" />
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (isOnboarding) {
       return <ProOnboarding onBack={() => setIsOnboarding(false)} onComplete={handleProSignup} />;
    }
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onJoinPro={() => setIsOnboarding(true)} />;
  }

  return (
    <AppContainer>
      <div className="flex-1 overflow-y-auto pb-[68px]">
        {/* EXPLORE TAB */}
        {tab === 0 && (
          <>
            {user?.type === 'professional' ? (
              <ProDashboard 
                pro={allPros.find(p => p.id === user.id) || allPros[0]}
                isEmergencyActive={isProEmergencyActive}
                onToggleEmergency={toggleEmergency}
                allJobs={allJobs}
                onEditProfile={() => setModal('edit-profile')}
                onViewProfile={handleViewMyProfile}
                onTabChange={handleTabChange}
                lang={lang}
              />
            ) : (
              <>
                {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col min-h-[calc(100dvh-68px)]">
                <div className="relative px-5 pb-8">
                  {/* Background layer */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a] rounded-b-[40px] shadow-lg shadow-teal-900/10 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                  </div>
                  
                  {/* Content layer */}
                  <div className="relative z-10 w-full h-full flex flex-col">
                    <div className="flex items-center py-3 -ml-1">
                      <div className="relative">
                        <img 
                          src="https://i.imgur.com/OBYrlgU.png" 
                          alt="Closer Logo" 
                          className="h-14 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                          referrerPolicy="no-referrer"
                        />
                        {user.type === 'professional' && (
                          <div className="absolute -top-1 -right-4 bg-amber-400 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white/50 animate-bounce">
                            PRO
                          </div>
                        )}
                      </div>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1.5">
                        {user.type !== 'professional' ? (
                          <HelpNowFeature 
                            pros={allPros} 
                            forceOpen={showEmergencyModal}
                            onOpenChange={setShowEmergencyModal}
                            onEmergencyHire={(pro: Professional, desc: string, cat: any) => {
                              const newJob: Job = {
                                id: `j-sos-${Date.now()}`,
                                cId: user.id,
                                cName: user.name,
                                cEmail: user.email,
                                pId: pro.id,
                                pName: pro.name,
                                pEmail: pro.email,
                                pSub: pro.sub,
                                price: (pro.price * 1.5).toString(), // Emergency premium
                                desc: desc || `Emergency ${cat.name} request`,
                                slot: 'Today, ASAP',
                                status: 'hired',
                                cFin: false,
                                pFin: false,
                                rev: null,
                                pRev: null,
                                isEmergency: true,
                                created: new Date().toISOString()
                              };
                              setAllJobs(prev => [newJob, ...prev]);
                              
                              const cid = [user.id, pro.id].sort().join('-');
                              const sosMsg: Message = {
                                id: `m-sos-${Date.now()}`,
                                cid,
                                from: user.id,
                                fn: user.name,
                                to: pro.id,
                                text: `🆘 URGENT SOS REQUEST: ${desc || cat.name}. Please respond ASAP!`,
                                time: new Date().toISOString(),
                                read: false,
                                isEmergency: true
                              };
                              setAllMsgs(prev => [sosMsg, ...prev]);
                              setSelectedPro(pro);
                              setModal('chat');
                            }}
                          />
                        ) : (
                          <button 
                            onClick={() => {
                              toggleEmergency();
                              if (!isEmergency) setShowEmergencyInfo(true);
                            }}
                            className={cn(
                              "flex items-center justify-center transition-all shadow-lg active:scale-95 w-11 h-11 rounded-full",
                              isEmergency 
                                ? "bg-orange-500 text-white shadow-orange-500/40 animate-pulse" 
                                : "bg-white text-slate-600 border border-white/20 animate-sos-subtle"
                            )}
                          >
                            <Zap className={cn("w-6 h-6", isEmergency ? "text-white fill-white" : "text-orange-400")} />
                          </button>
                        )}
                      </div>
                    </div>

                    <SearchBar value={search} onChange={setSearch} onClear={() => {setSearch(''); setAiFeedback(null);}} onSearch={handleAiSearch} isLoading={isAiLoading} lang={lang} />
                  </div>
                </div>

                {isAiLoading && !aiFeedback && (
                  <div className="mx-5 mt-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-gradient-to-r from-teal-50 to-[#f0f7f6] rounded-2xl p-4 shadow-sm border border-teal-100 flex items-start gap-3 relative overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-teal-50 animate-pulse">
                        <Sparkles className="w-4 h-4 text-teal-300" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4 mt-1">
                        <div className="h-3 w-32 bg-teal-200/50 rounded-full animate-pulse mb-2"></div>
                        <div className="h-2.5 w-full bg-slate-200/50 rounded-full animate-pulse mb-1.5"></div>
                        <div className="h-2.5 w-4/5 bg-slate-200/50 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {aiFeedback && !isAiLoading && (
                  <div className="mx-5 mt-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-gradient-to-r from-teal-50 to-[#f0f7f6] rounded-2xl p-4 shadow-sm border border-teal-100 flex items-start gap-3 relative overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-teal-50">
                        <Sparkles className="w-4 h-4 text-[#2d5a5a]" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-[13px] font-black text-[#1a4d4d] mb-0.5">Closer AI Assistant</h4>
                        <p className="text-[12px] font-medium text-slate-600 leading-snug">{aiFeedback.message}</p>
                        {aiFeedback.estimate && (
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] font-bold text-slate-700">Estimated cost: <span className="text-emerald-700">{aiFeedback.estimate}</span></span>
                          </div>
                        )}
                        
                        {/* Suggested Action Cards */}
                        {aiFeedback.followUps && aiFeedback.followUps.length > 0 && (
                          <div className="mt-4 flex flex-col gap-3">
                            {aiFeedback.followUps.map((q, idx) => (
                              <div key={idx} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-5 h-5 text-teal-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-[14px] font-bold text-slate-800 leading-tight mb-1">{q}</h5>
                                    <p className="text-[11px] font-medium text-slate-400">AI Verified Match</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                                  <button onClick={() => handleAiSearch(q)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-full font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors">
                                    <Search className="w-3.5 h-3.5" />
                                    Explore Pros
                                  </button>
                                  <button onClick={() => handleAiSearch(q)} className="flex-1 bg-[#1a4d4d] text-white py-2.5 rounded-full font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#2d5a5a] transition-colors shadow-md shadow-teal-900/20">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Book Now
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setAiFeedback(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Safety Tip (Emergency Only) */}
                    {aiFeedback.safetyTip && (
                      <div className="bg-red-50 text-red-700 rounded-xl p-3 flex items-start gap-3 border border-red-100 shadow-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                        <p className="text-[12px] font-bold leading-tight">{aiFeedback.safetyTip}</p>
                      </div>
                    )}
                  </div>
                )}

                {search.length >= 2 ? (
                  <SmartSearchResults 
                    query={search} 
                    onSelectPro={(p) => { setSelectedPro(p); setStep(3); setSearch(''); }} 
                    onSelectSubcategory={(catId, sub) => {
                      const catObj = CATS.find(c => c.id === catId);
                      if (catObj) handleSubSelect(sub, catObj);
                    }}
                    isEmergency={user.type === 'customer' && isEmergency}
                    allPros={allPros}
                  />
                ) : (
                  <>
                    <div className="mt-6">
                      <CategoryGrid 
                        onSelect={(c) => { 
                          setSelectedCat(c); 
                          setStep(1); 
                        }} 
                        onSubSelect={handleSubSelect}
                        lang={lang}
                      />
                    </div>
                    <div className="px-5 mt-auto mb-8">
                      <h3 className="text-[22px] font-serif text-[#5d4037] mb-4 px-1">{t('local_deals')}</h3>
                      <div 
                        ref={dealScrollRef}
                        onScroll={handleDealScroll}
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                      >
                        {allPros.slice(0, 5).map((p, i) => (
                          <div 
                            key={p.id}
                            onClick={() => { setSelectedPro(p); setStep(3); }}
                            className="min-w-[85%] snap-center rounded-[32px] overflow-hidden border-2 border-[#1a4d4d] flex-shrink-0 cursor-pointer bg-[#fdfaf3] shadow-xl shadow-black/5 flex h-[180px] relative"
                          >
                            {/* Left: Image */}
                            <div className="w-[40%] h-full p-3">
                              <div className="w-full h-full rounded-[24px] overflow-hidden bg-slate-100">
                                {p.img ? (
                                  <img 
                                    src={p.img} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: AVC[i % 8] }}>
                                    {AVE[i % 8]}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Info */}
                            <div className="flex-1 p-4 pl-1 flex flex-col justify-between relative">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-[#1a4d4d] flex items-center justify-center">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-500 leading-none">{t('verified')}</span>
                                      <span className="text-[10px] font-bold text-slate-500 leading-none">{t('professional')}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                                    <div className="flex gap-0.5">
                                      {[...Array(4)].map((_, i) => (
                                        <Star key={i} className="w-2.5 h-2.5 text-[#1a4d4d] fill-[#1a4d4d]" />
                                      ))}
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700">{p.rating}</span>
                                  </div>
                                </div>

                                <h4 className="text-[22px] font-bold text-slate-900 leading-tight mt-2">{p.name.split(' ')[0]}<br/>{p.name.split(' ')[1]}</h4>
                                
                                <div className="inline-flex mt-2 bg-[#1a4d4d] px-3 py-1 rounded-lg">
                                  <span className="text-[9px] font-black text-white uppercase tracking-wider">{lang === 'ro' ? 'CERTIFICAT' : 'CERTIFIED'} {translations[lang].subs?.[p.sub] || p.sub}</span>
                                </div>
                              </div>

                              {/* Price Badge */}
                              <div className="absolute bottom-0 right-0 bg-[#1a4d4d] text-white pl-6 pr-4 py-2 rounded-tl-[32px] flex flex-col items-end">
                                <span className="text-[9px] font-bold text-white/70 uppercase">{t('from')}</span>
                                <span className="text-[18px] font-black leading-none">£{p.price}{p.unit}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination Dots */}
                      <div className="flex justify-center gap-2 mt-2">
                        {allPros.slice(0, 5).map((_, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "h-1.5 transition-all duration-300 rounded-full",
                              dealIndex === i ? "w-6 bg-[#1a4d4d]" : "w-1.5 bg-slate-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <CloserAppPresentation onCtaClick={() => setStep(0)} />
                    <AboutCloserSection />
                  </>
                )}
              </div>
            )}

            {step === 1 && selectedCat && (
              <div className="animate-in slide-in-from-right duration-300 bg-[#f4f7f7] min-h-screen flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a] px-6 pt-5 pb-12 rounded-b-[40px] shadow-xl shadow-teal-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                  
                  <div className="flex items-center justify-between relative z-10 mb-4">
                    <button onClick={goBack} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="w-9 h-9" /> {/* Spacer to keep title centered if needed, or just empty */}
                  </div>

                  <div className="text-center relative z-10">
                    <h3 className="text-white text-[28px] font-black leading-tight tracking-tight mb-1">
                      {(() => {
                        let label = selectedCat?.label?.replace('\n', ' ') || '';
                        if (selectedCat?.id === 'home') {
                          label = label.replace('&', ' and ');
                        }
                        return label ? (label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()) : '';
                      })()}
                    </h3>
                    <p className="text-white/80 text-[14px] font-normal mb-2">
                      {t('find_pro')}
                    </p>
                  </div>
                </div>

                <div className="flex-1 px-6 pt-8 pb-10">
                  <div className="flex flex-col gap-3.5">
                    {selectedCat.subs.map((sb) => {
                      const proList = allPros.filter(p => p.catId === selectedCat.id && p.sub === sb);
                      const proCount = proList.length;
                      
                      const getIcon = (name: string, size: number) => {
                        const props = { size, strokeWidth: 1.5, className: "text-[#1a4d4d]" };
                        switch (name) {
                          case 'Plumber': return <Droplets {...props} />;
                          case 'Electrician': return <Zap {...props} />;
                          case 'Painter': return <PaintRoller {...props} />;
                          case 'Carpenter': return <Hammer {...props} />;
                          case 'Locksmith': return <Lock {...props} />;
                          case 'Handyman': return <Wrench {...props} />;
                          case 'Hairdresser': return <Scissors {...props} />;
                          case 'Nail Tech': return <Sparkles {...props} />;
                          case 'Massage': return <UserIcon {...props} />;
                          case 'Makeup': return <Paintbrush {...props} />;
                          case 'Barber': return <Scissors {...props} />;
                          case 'Mechanic': return <Car {...props} />;
                          case 'MOT': return <Clipboard {...props} />;
                          case 'Valeting': return <Car {...props} />;
                          case 'Recovery': return <Truck {...props} />;
                          case 'Photographer': return <Camera {...props} />;
                          case 'DJ': return <Music {...props} />;
                          case 'Catering': return <ChefHat {...props} />;
                          case 'Florist': return <Flower {...props} />;
                          case 'Maths Tutor': return <Calculator {...props} />;
                          case 'Language': return <BookOpen {...props} />;
                          case 'Music': return <Music {...props} />;
                          case 'Sports': return <Dumbbell {...props} />;
                          case 'PC Repair': return <Monitor {...props} />;
                          case 'Phone Repair': return <Smartphone {...props} />;
                          case 'Web Design': return <Briefcase {...props} />;
                          case 'CCTV': return <Video {...props} />;
                          case 'Lawn Mowing': return <TreeDeciduous {...props} />;
                          case 'Hedge Trimming': return <Scissors {...props} />;
                          case 'Garden Design': return <TreeDeciduous {...props} />;
                          case 'Tree Surgery': return <TreeDeciduous {...props} />;
                          case 'Dog Walking': return <Dog {...props} />;
                          case 'Notary': return <Scale {...props} />;
                          default: return <Wrench {...props} />;
                        }
                      };

                      return (
                        <button
                          key={sb}
                          onClick={() => handleSubSelect(sb, selectedCat)}
                          className={cn(
                            "w-full bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white active:scale-[0.98] transition-all group relative overflow-hidden",
                            isEmergency && allPros.filter(p => p.catId === selectedCat.id && p.sub === sb && p.isEmergencyAvailable).length > 0
                              ? "border-orange-200 ring-2 ring-orange-100 shadow-orange-100/50"
                              : ""
                          )}
                        >
                          {isEmergency && allPros.filter(p => p.catId === selectedCat.id && p.sub === sb && p.isEmergencyAvailable).length > 0 && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-sm z-10">
                              {allPros.filter(p => p.catId === selectedCat.id && p.sub === sb && p.isEmergencyAvailable).length} SOS AVAILABLE
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-14 h-14 flex items-center justify-center rounded-2xl transition-colors",
                              isEmergency && allPros.filter(p => p.catId === selectedCat.id && p.sub === sb && p.isEmergencyAvailable).length > 0
                                ? "bg-orange-50"
                                : "bg-slate-50 group-hover:bg-teal-50"
                            )}>
                              {getIcon(sb, 32)}
                            </div>
                            <div className="text-left">
                              <h4 className="text-[16px] font-black text-slate-900 leading-tight">{(translations[lang] as any).subs?.[sb] || sb}</h4>
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {proCount} {proCount === 1 ? 'PRO' : 'PROS'}
                              </span>
                            </div>
                          </div>
                          <div className={cn(
                            "px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition-all",
                            isEmergency && allPros.filter(p => p.catId === selectedCat.id && p.sub === sb && p.isEmergencyAvailable).length > 0
                              ? "bg-orange-500 shadow-orange-500/20"
                              : "bg-[#1a4d4d] shadow-teal-900/20"
                          )}>
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{t('check')}</span>
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-8 mb-4">
                    <div className="h-[1px] flex-1 bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] whitespace-nowrap">
                      {selectedCat.subs.length} {lang === 'ro' ? 'servicii' : 'services'}
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-200" />
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-6">
                    <button 
                      onClick={() => { setSelectedSub(null); setStep(4); }}
                      className="bg-white border border-slate-100 px-8 py-3 rounded-full shadow-sm text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-[#1a4d4d]" />
                        </div>
                        <div>
                          <div className="text-[12px] font-black text-slate-900">{lang === 'ro' ? 'ID Verificat' : 'ID Checked'}</div>
                          <div className="text-[10px] font-bold text-slate-400">{lang === 'ro' ? 'Identitate Confirmată' : 'Identity Verified'}</div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-[#1a4d4d]" />
                        </div>
                        <div>
                          <div className="text-[12px] font-black text-slate-900">DBS</div>
                          <div className="text-[10px] font-bold text-slate-400">{lang === 'ro' ? 'Cazier Verificat' : 'Criminal Record Checked'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OLD STEP 2 REMOVED */}

            {step === 3 && selectedPro && (
              user?.id === selectedPro.id ? (
                <ProProfileManagement 
                  pro={selectedPro}
                  jobs={allJobs}
                  onBack={goBack}
                  onUpdate={handleUpdatePro}
                  onUpdateJob={handleUpdateJobPhotos}
                  lang={lang}
                />
              ) : (
                <div className="animate-in slide-in-from-right duration-300">
                  <div className="bg-brand p-3.5 px-5 flex items-center gap-3.5 sticky top-0 z-10">
                    <button onClick={goBack} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-white text-[15px] font-bold flex-1 truncate">{selectedPro.sub} | Northampton</span>
                  </div>
                  
                  <div className="h-12 bg-brand" />
                  <div className="text-center -mt-9 px-5">
                    <div 
                      className="w-20 h-20 rounded-full border-[3px] border-white mx-auto flex items-center justify-center text-4xl shadow-lg overflow-hidden"
                      style={{ backgroundColor: AVC[allPros.findIndex(p => p.id === selectedPro.id) % 8] || '#eee' }}
                    >
                      {selectedPro.img ? (
                        <img 
                          src={selectedPro.img} 
                          alt={selectedPro.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        AVE[allPros.findIndex(p => p.id === selectedPro.id) % 8] || '👤'
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-2">{selectedPro.name}</h2>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3" /> {selectedPro.loc}
                    </div>
                  </div>

                  <div className="flex mx-5 mt-4 rounded-xl border-1.5 border-slate-200 overflow-hidden bg-white">
                    <div className="flex-1 text-center py-3">
                      <div className="text-lg font-extrabold text-brand">{Math.round(selectedPro.rating * 20)}%</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Success</div>
                    </div>
                    <div className="flex-1 text-center py-3 border-l-1.5 border-slate-200">
                      <div className="text-lg font-extrabold text-amber-500">⭐{selectedPro.rating}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating</div>
                    </div>
                    <div className="flex-1 text-center py-3 border-l-1.5 border-slate-200">
                      <div className="text-lg font-extrabold text-blue-600">{selectedPro.jobs}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jobs</div>
                    </div>
                  </div>

                  <div className="px-5 mt-5 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1.5">About Me</h4>
                      <p className="text-[13px] text-slate-600 leading-relaxed">{selectedPro.about}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1.5">Verified</h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedPro.v.id && <div className="flex items-center gap-1.5 bg-slate-50 border-1.5 border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700">🪪 ID <CheckCircle2 className="w-3 h-3 text-brand" /></div>}
                        {selectedPro.v.dbs && <div className="flex items-center gap-1.5 bg-slate-50 border-1.5 border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700">🛡️ DBS <CheckCircle2 className="w-3 h-3 text-brand" /></div>}
                        {selectedPro.v.ins && <div className="flex items-center gap-1.5 bg-slate-50 border-1.5 border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700">📋 Insured <CheckCircle2 className="w-3 h-3 text-brand" /></div>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1.5">Services · From £{selectedPro.price}{selectedPro.unit}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPro.svcs.map(s => (
                          <span key={s} className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-2.5">Portfolio · Past Work</h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {selectedPro.port.map((p, idx) => (
                          <div key={idx} className="aspect-[4/3] rounded-2xl flex items-center justify-center text-2xl relative overflow-hidden group bg-slate-100 border border-slate-100 shadow-sm">
                            {p.image ? (
                              <img src={p.image} alt="Portfolio" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-2xl">🖼️</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project {idx + 1}</span>
                              </div>
                            )}
                            
                            {p.type === 'before' && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-bold text-white uppercase tracking-widest">Before</div>
                            )}
                            {p.type === 'after' && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-brand/80 backdrop-blur-md rounded-lg text-[9px] font-bold text-white uppercase tracking-widest">After</div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-white text-[10px] font-bold uppercase tracking-wider">{p.title || 'View Details'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-2.5">Reviews</h4>
                      <div className="space-y-3">
                        {selectedPro.revs.map((r, idx) => (
                          <div key={idx} className="p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-50">
                                <UserIcon className="w-5 h-5 text-slate-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[13px] font-bold text-slate-900">{r.n}</span>
                                    <div className="flex gap-0.5 mt-0.5">
                                      {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-2.5 h-2.5", i < (r.rating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200")} />)}
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">{r.date}</span>
                                </div>
                                <p className="text-[12px] text-slate-600 leading-relaxed mt-2 italic">"{r.text}"</p>
                                
                                {r.photos && r.photos.length > 0 && (
                                  <div className="flex gap-2 mt-3">
                                    {r.photos.map((photo, pIdx) => (
                                      <div key={pIdx} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100">
                                        <img src={photo} alt="Review" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {existingJob && (
                    <div className="mx-5 my-4 p-3.5 bg-blue-50 rounded-xl border-1.5 border-blue-200 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-[13px] font-bold text-blue-600">Active: {STL[existingJob.status]}</span>
                    </div>
                  )}

                  <div className="h-24" />
                  
                  {/* CTA BAR */}
                  {selectedPro.id !== user.id && !existingJob && (
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto flex gap-2 p-3.5 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
                      <button 
                        onClick={() => setModal('calendar')} 
                        className="flex-1 py-3 rounded-xl border-1.5 border-slate-200 bg-slate-50 text-slate-800 text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
                      >
                        <Calendar className="w-4 h-4" /> Check Availability
                      </button>
                      <button 
                        onClick={() => { setModal('chat'); markAsRead(selectedPro.id); }} 
                        className="flex-1 py-3 rounded-xl border-1.5 border-brand bg-white text-brand text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <button 
                        onClick={() => setModal('hire')} 
                        className="flex-1 py-3 rounded-xl bg-brand text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20 hover:bg-brand-light transition-colors"
                      >
                        <DollarSign className="w-4 h-4" /> Hire
                      </button>
                    </div>
                  )}

                  {user.type === 'customer' && existingJob && existingJob.status === 'active' && !existingJob.cFin && (
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto flex gap-2 p-3.5 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
                      <button 
                        onClick={() => { setModal('chat'); markAsRead(selectedPro.id); }} 
                        className="flex-1 py-3 rounded-xl border-1.5 border-brand bg-white text-brand text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <button 
                        onClick={() => handleJobAction(existingJob.id, 'fin-c')} 
                        className="flex-1 py-3 rounded-xl bg-brand text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20 hover:bg-brand-light transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Finish Job
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
            {step === 4 && selectedCat && user && (
              <SearchResultsScreen 
                onBack={goBack} 
                categoryTitle={(() => {
                  if (selectedSub) return selectedSub;
                  let label = selectedCat?.label?.replace('\n', ' ') || '';
                  if (selectedCat?.id === 'home') {
                    label = label.replace('&', ' and ');
                  }
                  return label ? (label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()) : '';
                })()}
                professionals={allPros.filter(p => p.catId === selectedCat.id && (!selectedSub || p.sub === selectedSub))}
                onViewProfile={(pro) => {
                  setSelectedPro(pro);
                  setStep(3);
                }}
                onMessage={(pro) => {
                  setSelectedPro(pro);
                  setModal('chat');
                }}
                isEmergency={user.type === 'customer' && isEmergency}
                setIsEmergency={setIsEmergency}
                onShowInfo={() => setShowEmergencyInfo(true)}
                user={user}
                aiFeedback={aiFeedback}
                lang={lang}
              />
              )}
            </>
          )}
        </>
      )}

        {/* JOBS TAB */}
        {tab === 1 && (
          <div className="animate-in fade-in duration-500">
            <JobsList 
              jobs={myJobs} 
              isPro={isProRole} 
              onAction={handleJobAction} 
              onChat={(p) => { setSelectedPro(p); setModal('chat'); markAsRead(p.id); }} 
              onReview={(j) => { setReviewJob(j); setModal('review'); }} 
              lang={lang}
            />
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab === 2 && (
          <div className="animate-in fade-in duration-500 bg-[#f8fcfb] min-h-screen">
            <div className="bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a] px-6 pt-5 pb-12 rounded-b-[40px] shadow-xl shadow-teal-900/20 relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="flex items-center justify-between relative z-10 mb-1">
                <h2 className="text-[32px] font-black text-white tracking-tight">{t('messages')}</h2>
                <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[15px] text-white/70 font-medium relative z-10 mb-2">{lang === 'ro' ? 'Conversații cu profesioniștii tăi' : 'Chat with your professionals'}</p>
            </div>
            <div className="px-5">
              {(() => {
                const myM = allMsgs.filter(m => m.from === user.id || m.to === user.id);
                const convs: Record<string, { oid: string, name: string, msgs: Message[], last: string }> = {};
                myM.forEach(m => {
                  const oid = m.from === user.id ? m.to : m.from;
                  if (!convs[oid]) convs[oid] = { oid, name: '', msgs: [], last: '' };
                  convs[oid].msgs.push(m);
                  convs[oid].last = m.time;
                  if (m.from !== user.id) convs[oid].name = m.fn;
                  else {
                    const p = allPros.find(x => x.id === oid);
                    convs[oid].name = p?.name || 'User';
                  }
                });
                const sorted = Object.values(convs).sort((a, b) => new Date(b.last).getTime() - new Date(a.last).getTime());
                
                if (sorted.length === 0) {
                  return (
                    <div className="text-center py-16 text-slate-300">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                      <p className="font-bold text-slate-500">No messages yet</p>
                    </div>
                  );
                }

                return sorted.map(c => {
                  const lm = c.msgs[c.msgs.length - 1];
                  const pi = allPros.findIndex(p => p.id === c.oid);
                  const p = allPros.find(x => x.id === c.oid);
                  return (
                    <div 
                      key={c.oid}
                      onClick={() => { 
                        const p = allPros.find(p => p.id === c.oid) || { id: c.oid, name: c.name } as Professional;
                        setSelectedPro(p); 
                        setModal('chat'); 
                        markAsRead(c.oid);
                      }}
                      className="flex gap-3.5 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden"
                        style={{ backgroundColor: AVC[(pi >= 0 ? pi : 0) % 8] }}
                      >
                        {p?.img ? (
                          <img src={p.img} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          pi >= 0 ? AVE[pi % 8] : '👤'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-800 truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400">{new Date(lm.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {lm.from === user.id ? 'You: ' : ''}{lm.text}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 3 && (
          <div className="animate-in fade-in duration-500 bg-[#f8f9fa] min-h-screen pb-24 relative">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a] px-6 pt-5 pb-12 rounded-b-[40px] shadow-xl shadow-teal-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="flex items-center justify-between relative z-10 mb-1">
                <h2 className="text-[32px] font-black text-white tracking-tight">{t('my_profile')}</h2>
                <button 
                  onClick={() => setModal('notifications')}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white relative active:scale-90 transition-transform"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a4d4d]" />
                </button>
              </div>
              <p className="text-[15px] text-white/70 font-medium relative z-10">{t('manage_account')}</p>
            </div>
            
            <div className="px-6 mt-6 relative z-10">
              {/* White Card Container */}
              <div className="bg-white rounded-[32px] shadow-xl shadow-black/5 p-6 pb-10">
                
                {/* Jobs Tabs */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide">
                  <button className="bg-[#1a4d4d] text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap">
                    All (2)
                  </button>
                  <button className="bg-slate-50 text-slate-500 px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap">
                    Upcoming <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                  </button>
                  <button className="bg-slate-50 text-slate-500 px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap">
                    Completed <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white border border-slate-50 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                    <Briefcase className="w-6 h-6 text-slate-400 mb-2" />
                    <div className="text-[15px] font-black text-slate-900 leading-none">12 {lang === 'ro' ? 'Job-uri' : 'Jobs'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('jobs')}</div>
                  </div>
                  <div className="bg-white border border-slate-50 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                    <Star className="w-6 h-6 text-amber-400 mb-2" />
                    <div className="text-[15px] font-black text-slate-900 leading-none">4.8</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">(47 {lang === 'ro' ? 'recenzii' : 'reviews'})</div>
                  </div>
                  <div className="bg-white border border-slate-50 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                    <div className="text-[15px] font-black text-slate-900 leading-none">£1,250</div>
                    <div className="text-[11px] font-bold text-slate-400 mt-0.5">{lang === 'ro' ? 'câștigat' : 'earned'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lang === 'ro' ? 'CHELTUIT' : 'SPENT'}</div>
                  </div>
                </div>

                {/* Urgent Mode Card */}
                {user.type === 'professional' && (
                  <div className="bg-red-50/50 rounded-2xl p-4 mb-4 flex items-center justify-between border border-red-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <Zap className="w-5 h-5 fill-red-600" />
                      </div>
                      <div>
                        <div className="text-[15px] font-black text-slate-900">Urgent Mode</div>
                        <div className="text-[11px] text-slate-500 font-medium">Be visible to clients who need help NOW</div>
                      </div>
                    </div>
                    <button 
                      onClick={toggleEmergency}
                      className={cn(
                        "w-12 h-6.5 rounded-full relative transition-all duration-300 shadow-inner",
                        isProEmergencyActive ? "bg-[#1a4d4d]" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-md",
                        isProEmergencyActive ? "left-[25px]" : "left-[3px]"
                      )} />
                    </button>
                  </div>
                )}

                {/* Create Job Card */}
                {user.type === 'professional' && (
                  <button 
                    onClick={() => setModal('new-job' as any)}
                    className="w-full bg-gradient-to-r from-[#1a4d4d] to-[#2d5a5a] p-5 rounded-[28px] mb-6 flex items-center justify-between group shadow-xl shadow-teal-900/10 active:scale-[0.98] transition-all border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="text-[17px] font-black text-white tracking-tight">Add New Job</div>
                        <div className="text-[11px] text-white/70 font-bold uppercase tracking-widest">Register manual booking</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </button>
                )}

                {/* Menu Sections */}
                <div className="space-y-4">
                  {[
                    {
                      title: 'ACCOUNT',
                      items: [
                        { icon: Eye, label: 'View Profile', onClick: handleViewMyProfile },
                        { icon: UserIcon, label: 'Edit Profile', onClick: () => setModal('edit-profile') },
                      ]
                    },
                    {
                      title: t('preferences'),
                      items: [
                        { icon: Bell, label: t('notifications'), onClick: () => setModal('notifications') },
                        { 
                          icon: Globe, 
                          label: t('language'), 
                          desc: lang === 'en' ? 'English' : 'Română',
                          onClick: () => setLang(prev => prev === 'en' ? 'ro' : 'en') 
                        },
                      ]
                    },
                    {
                      title: t('security'),
                      items: [
                        { icon: Shield, label: t('privacy'), onClick: () => setModal('privacy') },
                        { 
                          icon: Sparkles, 
                          label: t('boost'), 
                          desc: t('boost_desc'),
                          onClick: () => setModal('boost'),
                          isSpecial: true
                        },
                        { icon: MessageSquare, label: t('help'), onClick: () => setModal('help') },
                      ]
                    }
                  ].map((section, sIdx) => (
                    <div key={sIdx}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{section.title}</h3>
                      <div className="bg-white border border-slate-50 rounded-2xl shadow-sm overflow-hidden">
                        {section.items.map((item, iIdx) => (
                          <button 
                            key={iIdx}
                            onClick={item.onClick}
                            className={cn(
                              "w-full flex items-center gap-4 p-3 text-left transition-colors active:bg-slate-50",
                              iIdx !== section.items.length - 1 && "border-b border-slate-50",
                              item.isSpecial && "bg-gradient-to-r from-yellow-50/30 to-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                              item.isSpecial ? "text-amber-500" : "text-slate-400"
                            )}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-[15px] font-bold text-slate-800">{item.label}</div>
                              {'desc' in item && <div className="text-[11px] text-slate-400 font-medium">{item.desc}</div>}
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="w-full mt-10 py-4 rounded-2xl bg-red-50 text-red-500 font-black text-[14px] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Floating Action Button */}
            {user.type === 'professional' && (
              <button 
                onClick={() => setModal('new-job' as any)}
                className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#1a4d4d] to-[#2d5a5a] text-white shadow-2xl shadow-teal-900/40 flex flex-col items-center justify-center active:scale-95 transition-all z-50 border-2 border-white/20"
              >
                <Plus className="w-6 h-6 mb-0.5" />
                <span className="text-[9px] font-black uppercase tracking-tight">New Job</span>
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav 
        activeTab={tab} 
        onTabChange={handleTabChange} 
        pendingJobs={pendingCnt} 
        unreadMsgs={unreadMsgs} 
        lang={lang}
      />

      {/* MODALS */}
      <Modal 
        isOpen={showEmergencyInfo} 
        onClose={() => setShowEmergencyInfo(false)} 
        title="I Need Help Now"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Zap className="w-8 h-8 text-orange-500 fill-orange-500" />
          </div>
          <p className="text-[14px] text-slate-600 leading-relaxed text-center">
            The <span className="font-bold text-orange-600">"I Need Help Now"</span> feature is designed for urgent situations where clients need immediate assistance.
          </p>
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">1</div>
              <p className="text-[12px] text-slate-700 font-medium">When active, your profile appears in the emergency filter results.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">2</div>
              <p className="text-[12px] text-slate-700 font-medium">Clients will see a special "SOS" badge on your profile.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">3</div>
              <p className="text-[12px] text-slate-700 font-medium">This status automatically expires in 24 hours to ensure availability is always fresh.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowEmergencyInfo(false)}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 active:scale-95 transition-all mt-2"
          >
            Got it!
          </button>
        </div>
      </Modal>

      {/* NEW: Emergency Activation Modal for Professionals */}
      <Modal 
        isOpen={showEmergencyActivation} 
        onClose={() => setShowEmergencyActivation(false)} 
        title="Activate Emergency Mode"
      >
        <div className="space-y-6">
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-[14px] font-black text-slate-900 leading-tight mb-1">24-Hour Availability</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Emergency mode stays active for exactly 24 hours. After that, you'll need to reactivate it to stay visible.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Set Today's Hours</h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 ml-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Start Time
                </label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={emergencyStartTime}
                    onChange={(e) => setEmergencyStartTime(e.target.value)}
                    className="w-full bg-slate-50 border-1.5 border-slate-200 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-800 outline-none focus:border-orange-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 ml-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> End Time
                </label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={emergencyEndTime}
                    onChange={(e) => setEmergencyEndTime(e.target.value)}
                    className="w-full bg-slate-50 border-1.5 border-slate-200 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-800 outline-none focus:border-orange-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Schedule</span>
              </div>
              <div className="text-[13px] font-bold text-slate-800">
                Today: {emergencyStartTime} — {emergencyEndTime}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Clients will only be able to book you within this window today.
              </p>
            </div>
          </div>

          <button 
            onClick={handleActivateEmergency}
            className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Go Available Now <Zap className="w-4 h-4 fill-white" />
          </button>
          
          <button 
            onClick={() => setShowEmergencyActivation(false)}
            className="w-full py-3 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'edit-profile'} 
        onClose={() => setModal(null)} 
        title="Edit Profile"
      >
        <div className="space-y-5">
          <div className="text-center mb-4">
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl border-[3px] border-white shadow-lg relative cursor-pointer group overflow-hidden",
              user.type === 'customer' ? "bg-brand/10 text-brand" : "bg-brand/10 text-brand"
            )}>
              {user.img ? (
                <img 
                  src={user.img} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                editAvatar
              )}
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Bell className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {['👤', '🛠️', '👨‍🔧', '👩‍🎨', '👷', '👩‍🍳'].map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => setEditAvatar(emoji)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all",
                    editAvatar === emoji ? "border-brand bg-brand/5" : "border-slate-100 bg-white"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>
          <button 
            onClick={handleUpdateProfile}
            className="w-full py-4 rounded-xl bg-brand text-white font-bold text-[15px] shadow-lg shadow-brand/20 hover:bg-brand-light transition-colors"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'notifications'} 
        onClose={() => setModal(null)} 
        title="Notifications"
      >
        <div className="space-y-4">
          {[
            { title: 'Job Updates', desc: 'Get notified when a job status changes', active: true },
            { title: 'Messages', desc: 'New message alerts from clients/pros', active: true },
            { title: 'Promotions', desc: 'Discounts and local service deals', active: false }
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="text-sm font-bold text-slate-800">{n.title}</div>
                <div className="text-[11px] text-slate-500">{n.desc}</div>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                n.active ? "bg-brand" : "bg-slate-300"
              )}>
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all",
                  n.active ? "left-5.5" : "left-0.5"
                )} />
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'privacy'} 
        onClose={() => setModal(null)} 
        title="Privacy & Security"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-[12px] text-blue-700 leading-relaxed">
              Your data is encrypted and stored locally. We never share your private information with third parties without your consent.
            </div>
          </div>
          <button className="w-full p-3.5 text-left text-[13px] font-bold text-slate-700 border-b border-slate-100 flex justify-between items-center">
            Change Password <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button className="w-full p-3.5 text-left text-[13px] font-bold text-slate-700 border-b border-slate-100 flex justify-between items-center">
            Two-Factor Authentication <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-500">OFF</span>
          </button>
          <button className="w-full p-3.5 text-left text-[13px] font-bold text-red-500">
            Delete Account
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'help'} 
        onClose={() => setModal(null)} 
        title="How to Install Closer"
      >
        <div className="space-y-6">
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
            <p className="text-[13px] text-teal-900 font-medium leading-relaxed">
              <strong>Important:</strong> You must open this link in your phone's <strong>Real Browser</strong> (Chrome or Safari), not inside the Facebook/Instagram/Preview app.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">1</div>
                Android (Chrome)
              </h3>
              <ul className="text-[13px] text-slate-600 space-y-2 ml-8 list-disc">
                <li>Open <strong>Chrome</strong>.</li>
                <li>Tap the <strong>3 dots (⋮)</strong> in the top right corner.</li>
                <li>Look for <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> directly in the list.</li>
                <li><em>Note: It is usually NOT under the "Share" menu.</em></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">2</div>
                iPhone (Safari)
              </h3>
              <ul className="text-[13px] text-slate-600 space-y-2 ml-8 list-disc">
                <li>Open <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (square with arrow up) at the bottom.</li>
                <li>Scroll down the list until you see <strong>"Add to Home Screen"</strong>.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Support Details:</div>
            <div className="text-[12px] text-slate-600">
              Email: support@closer.app<br/>
              Version: 1.0.2 (PWA Enabled)
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'icon-preview'} 
        onClose={() => setModal(null)} 
        title="App Icon Preview"
      >
        <div className="space-y-6">
          <p className="text-[13px] text-slate-500 leading-relaxed">
            This is how the <strong>Closer</strong> app icon would look on an Android home screen:
          </p>
          
          <div className="relative aspect-[9/16] w-full max-w-[260px] mx-auto rounded-[32px] border-[6px] border-slate-800 bg-cover bg-center overflow-hidden shadow-2xl"
               style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80)' }}>
            {/* Status Bar */}
            <div className="h-6 w-full flex justify-between items-center px-4 pt-1">
              <span className="text-[10px] font-bold text-white">12:30</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-4 gap-y-6 p-6 mt-10">
              {[
                { name: 'Phone', color: 'bg-brand' },
                { name: 'Messages', color: 'bg-blue-500' },
                { name: 'Chrome', color: 'bg-slate-100' },
                { name: 'Camera', color: 'bg-slate-700' },
                { name: 'Closer', isApp: true },
                { name: 'Maps', color: 'bg-white' },
                { name: 'Photos', color: 'bg-white' },
                { name: 'Settings', color: 'bg-slate-400' },
              ].map((app, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {app.isApp ? (
                    <div className="w-11 h-11 rounded-2xl bg-[#2d5a5a] flex items-center justify-center shadow-lg ring-1 ring-white/20 scale-110">
                      <img 
                        src="https://i.imgur.com/3smLmQg.png" 
                        alt="Icon" 
                        className="w-8 h-8 object-contain drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className={cn("w-11 h-11 rounded-2xl shadow-md", app.color)} />
                  )}
                  <span className={cn("text-[9px] font-medium text-white drop-shadow-md", app.isApp && "font-bold")}>
                    {app.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Dock */}
            <div className="absolute bottom-4 left-3 right-3 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-around px-2">
              <div className="w-10 h-10 rounded-full bg-brand" />
              <div className="w-10 h-10 rounded-full bg-blue-500" />
              <div className="w-10 h-10 rounded-full bg-slate-100" />
              <div className="w-10 h-10 rounded-full bg-slate-700" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Icon Details:</div>
            <ul className="text-[12px] text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">• Background: <span className="font-mono text-[10px] bg-slate-200 px-1 rounded">#2D5A5A</span> (Brand Green)</li>
              <li className="flex items-center gap-2">• Shape: Adaptive (Rounded Square)</li>
              <li className="flex items-center gap-2">• Logo: Centered White Transparent PNG</li>
            </ul>
          </div>
        </div>
      </Modal>
      <Modal 
        isOpen={modal === 'calendar'} 
        onClose={() => setModal(null)} 
        title="Availability"
      >
        <div className="space-y-4">
          {selectedPro?.slots?.map((sl, di) => (
            <div key={di}>
              <div className="flex gap-1.5 mb-2">
                <span className="text-[13px] font-bold text-slate-800">{sl.day}</span>
                <span className="text-[13px] text-slate-400">{sl.dt}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sl.times.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Fully Booked</span>
                ) : (
                  sl.times.map(tm => {
                    const slotId = `${sl.day} ${sl.dt} ${tm}`;
                    return (
                      <button
                        key={tm}
                        onClick={() => setSelSlot(slotId)}
                        className={cn(
                          "px-3 py-2 rounded-lg border-1.5 text-xs font-bold transition-all",
                          selSlot === slotId 
                            ? "bg-brand/5 border-brand text-brand" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-brand-light"
                        )}
                      >
                        {tm}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'hire'} 
        onClose={() => setModal(null)} 
        title={`Hire ${selectedPro?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Your Budget (£)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50"
              placeholder="e.g. 150"
              value={hirePrice}
              onChange={(e) => setHirePrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Job Description</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50 resize-none"
              placeholder="Describe what you need..."
              rows={3}
              value={hireDesc}
              onChange={(e) => setHireDesc(e.target.value)}
            />
          </div>
          <button 
            onClick={handleHire}
            disabled={!hirePrice}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg",
              hirePrice ? "bg-brand text-white shadow-brand/20" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <DollarSign className="w-4 h-4" /> Send Hire Request
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'chat'} 
        onClose={() => setModal(null)} 
        title={selectedPro?.name || 'Chat'}
        fullScreen
      >
        {(() => {
          const hasEmergencyJob = myJobs.some(j => 
            (j.pId === selectedPro?.id || j.cId === selectedPro?.id) && 
            j.isEmergency && 
            ['hired', 'active', 'finish_requested'].includes(j.status)
          );
          const themeClass = hasEmergencyJob ? "bg-orange-500" : "bg-brand";
          
          return (
            <div className="flex flex-col h-full bg-[#f8f9fa]">
              <div className={cn(themeClass, "p-3 px-5 flex items-center gap-3.5 shadow-lg relative z-10")}>
            <button onClick={() => setModal(null)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white active:scale-90 transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm overflow-hidden border-2 border-white/20 shrink-0"
              style={{ backgroundColor: AVC[allPros.indexOf(selectedPro!) % 8] || '#e2e8f0' }}
            >
              {selectedPro?.img ? (
                <img src={selectedPro.img} alt={selectedPro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                AVE[allPros.indexOf(selectedPro!) % 8] || '👤'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[15px] font-bold truncate tracking-tight">{selectedPro?.name}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <div className="text-white/70 text-[10px] uppercase font-bold tracking-widest leading-none">Online</div>
              </div>
            </div>

            <button 
              onClick={() => setModal('hire')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[12px] font-black transition-all active:scale-95 shadow-lg",
                hasEmergencyJob ? "bg-white text-orange-500 shadow-orange-900/20" : "bg-white text-brand shadow-brand/20"
              )}
            >
              HIRE NOW
            </button>

            <div className="flex items-center gap-1.5">
              {(() => {
                const hasActiveJob = myJobs.some(j => 
                  (j.pId === selectedPro?.id || j.cId === selectedPro?.id) && 
                  ['active', 'finish_requested'].includes(j.status)
                );
                
                return (
                  <>
                    <button 
                      onClick={() => hasActiveJob ? setIsCalling('voice') : setShowCallLimitInfo(true)}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90",
                        hasActiveJob ? "bg-white/20 text-white hover:bg-white/30" : "bg-white/10 text-white/40"
                      )}
                    >
                      <Phone className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => hasActiveJob ? setIsCalling('video') : setShowCallLimitInfo(true)}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90",
                        hasActiveJob ? "bg-white/20 text-white hover:bg-white/30" : "bg-white/10 text-white/40"
                      )}
                    >
                      <Video className="w-4.5 h-4.5" />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {currentConv.map(m => {
              const mine = m.from === user.id;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] p-3 px-4 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                    mine 
                      ? (m.isEmergency || hasEmergencyJob ? "bg-orange-500 text-white rounded-br-none" : "bg-brand text-white rounded-br-none")
                      : "bg-white text-slate-800 rounded-bl-none"
                  )}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3.5 px-4 bg-white border-t border-slate-200 flex gap-2">
            <input 
              className="flex-1 bg-slate-50 border-1.5 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand"
              placeholder="Type a message..."
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMsg()}
              onFocus={() => {
                setTimeout(() => {
                  chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
            />
            <button 
              onClick={handleSendMsg}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all",
                hasEmergencyJob ? "bg-orange-500 shadow-orange-200" : "bg-brand shadow-brand/20"
              )}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      );
    })()}
  </Modal>

      {/* Call Info Modal */}
      <Modal isOpen={showCallLimitInfo} onClose={() => setShowCallLimitInfo(false)} title="Security Check">
        <div className="p-2 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mx-auto mb-4 border border-orange-100">
             <Info className="w-8 h-8" />
          </div>
          <h3 className="text-[17px] font-black text-slate-900 mb-2">Calls Locked</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
            For your security, calling is only available after a <span className="text-brand font-bold">Hire request</span> is sent and <span className="text-brand font-bold">Accepted</span>.
            <br/><br/>
            This ensures all community members are genuine and helps us protect your privacy.
          </p>
          <button 
            onClick={() => setShowCallLimitInfo(false)}
            className="w-full py-4 rounded-xl bg-brand text-white font-bold text-[15px] shadow-lg shadow-brand/20 active:scale-[0.98] transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </Modal>

      {/* Call Screen Demo */}
      <Modal isOpen={!!isCalling} onClose={() => setIsCalling(false)} title="Call" fullScreen>
        <div className={cn(
          "flex flex-col h-full relative overflow-hidden transition-all duration-700",
          isCalling === 'video' ? "bg-black" : "bg-gradient-to-b from-[#1a4d4d] to-[#2d5a5a]"
        )}>
          {/* Background visuals for video */}
          {isCalling === 'video' && (
             <div className="absolute inset-0 opacity-40">
               <img src={selectedPro?.img || "https://picsum.photos/seed/call/800/1200"} alt="bg" className="w-full h-full object-cover blur-xl" referrerPolicy="no-referrer" />
             </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 p-1 mb-6 animate-pulse">
               <div 
                 className="w-full h-full rounded-full flex items-center justify-center text-5xl shadow-2xl overflow-hidden border-2 border-white/10"
                 style={{ backgroundColor: AVC[allPros.indexOf(selectedPro!) % 8] || '#e2e8f0' }}
               >
                 {selectedPro?.img ? (
                   <img src={selectedPro.img} alt={selectedPro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                   AVE[allPros.indexOf(selectedPro!) % 8] || '👤'
                 )}
               </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{selectedPro?.name}</h2>
            <p className="text-white/60 font-bold tracking-widest uppercase text-xs mb-8">
              {isCalling === 'video' ? 'Connecting Video Call...' : 'Calling via Voice...'}
            </p>
            
            {/* Small Self View for Video */}
            {isCalling === 'video' && (
              <div className="w-24 h-36 rounded-2xl bg-slate-900 absolute top-12 right-6 border-2 border-white/20 shadow-2xl overflow-hidden">
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl">👤</div>
              </div>
            )}
          </div>

          <div className="p-12 flex justify-center items-center gap-8 relative z-20">
            <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-90 transition-all">
              <Mic className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsCalling(false)}
              className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-900/40 active:scale-90 transition-all hover:bg-red-600"
            >
              <PhoneOff className="w-8 h-8 fill-white" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-90 transition-all">
              {isCalling === 'video' ? <VideoOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'notifications'} 
        onClose={() => setModal(null)} 
        title="Notifications"
      >
        <div className="space-y-4">
          {[
            { title: 'New Message', desc: 'Alex sent you a message about the plumbing job.', time: '2m ago', icon: MessageSquare, color: 'text-blue-500 bg-blue-50' },
            { title: 'Job Completed', desc: 'Your job "Garden Maintenance" has been marked as completed.', time: '1h ago', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
            { title: 'New Review', desc: 'You received a 5-star review from Sarah!', time: '5h ago', icon: Star, color: 'text-amber-500 bg-amber-50' },
          ].map((n, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.color)}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-[14px] font-bold text-slate-800">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))}
          <button className="w-full py-3 text-[13px] font-bold text-brand hover:bg-brand/5 rounded-xl transition-colors">
            Mark all as read
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'edit-profile'} 
        onClose={() => setModal(null)} 
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl border-4 border-white shadow-lg relative group overflow-hidden">
              {user.img ? (
                <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.type === 'customer' ? '👤' : '🛠️'
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <button className="mt-3 text-[12px] font-bold text-brand">Change Photo</button>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              // Logic to save profile
              setModal(null);
            }}
            className="w-full py-4 rounded-xl bg-brand text-white font-bold text-[15px] shadow-lg shadow-brand/20 active:scale-95 transition-all mt-4"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'privacy'} 
        onClose={() => setModal(null)} 
        title="Privacy & Security"
      >
        <div className="space-y-2">
          {[
            { label: 'Profile Visibility', desc: 'Control who can see your profile', icon: Eye },
            { label: 'Two-Factor Auth', desc: 'Secure your account with 2FA', icon: Lock },
            { label: 'Data Usage', desc: 'Manage how your data is used', icon: Shield },
            { label: 'Blocked Users', desc: 'Manage users you have blocked', icon: X },
          ].map((it, i) => (
            <button key={i} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <it.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-bold text-slate-800">{it.label}</div>
                <div className="text-[11px] text-slate-400 font-medium">{it.desc}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'help'} 
        onClose={() => setModal(null)} 
        title="Help & Support"
      >
        <div className="space-y-4">
          <div className="bg-brand/5 rounded-2xl p-6 text-center border border-brand/10">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-[16px] font-black text-slate-800 mb-1">How can we help?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">Our support team is available 24/7 to assist you with any issues.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
              <Globe className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-[13px] font-bold text-slate-800">Help Center</span>
            </button>
            <button className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
              <Send className="w-6 h-6 text-brand mb-2" />
              <span className="text-[13px] font-bold text-slate-800">Contact Us</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modal === 'review'} 
        onClose={() => setModal(null)} 
        title="Leave a Review"
      >
        <div className="space-y-5">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <button 
                key={i} 
                onClick={() => setReviewRating(i)}
                className="p-1 transition-transform active:scale-125"
              >
                <Star className={cn("w-8 h-8", i <= reviewRating ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200")} />
              </button>
            ))}
          </div>
          <textarea 
            className="w-full px-4 py-3 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none focus:border-brand bg-slate-50 resize-none"
            placeholder="Share your experience..."
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <button 
            onClick={handleSubmitReview}
            disabled={!reviewText.trim()}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-[15px] shadow-lg transition-all",
              reviewText.trim() ? "bg-amber-500 text-white shadow-amber-100" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            ⭐ Submit Review
          </button>
        </div>
      </Modal>
      {/* SOS Incoming Alert for Pro */}
      {showSOS && incomingSOS && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-orange-500/90 backdrop-blur-md animate-in fade-in duration-500" />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20" />
              <div className="relative w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-200">
                <Zap className="w-12 h-12 text-white fill-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2">EMERGENCY REQUEST!</h2>
            <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
              <span className="font-bold text-slate-900">{incomingSOS.cName}</span> needs a <span className="font-bold text-orange-500">{incomingSOS.pSub}</span> immediately!
              <br />
              <span className="text-[13px] italic mt-2 block">"{incomingSOS.desc}"</span>
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => {
                  handleJobAction(incomingSOS.id, 'decline');
                  setShowSOS(false);
                }}
                className="py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[15px] active:scale-95 transition-all"
              >
                DECLINE
              </button>
              <button 
                onClick={() => {
                  handleJobAction(incomingSOS.id, 'accept');
                  setShowSOS(false);
                  const pro = allPros.find(p => p.id === incomingSOS.pId);
                   if (pro) {
                     setSelectedPro(pro);
                     setModal('chat');
                   }
                }}
                className="py-4 rounded-2xl bg-orange-500 text-white font-black text-[15px] shadow-lg shadow-orange-200 active:scale-95 transition-all"
              >
                ACCEPT
              </button>
            </div>
          </div>
        </div>
      )}

      {showSurvey && surveySub && (
        <SearchSurvey 
          subcategory={surveySub} 
          onClose={() => setShowSurvey(false)} 
          onComplete={handleSurveyComplete} 
        />
      )}

      {step === 0 && !modal && (tab === 0 || tab === 1 || tab === 2 || tab === 3) && (
        <CloserChatBot currentTab={tab} />
      )}
    </AppContainer>
  );
}