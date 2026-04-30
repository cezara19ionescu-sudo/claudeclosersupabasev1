import { supabase } from './supabase';
import type { User, UserType, Professional, Job, Message, Review, PortfolioItem, Slot, ServiceRequest, Quote, Booking } from '../types';

// ============================================
// AUTH FUNCTIONS
// ============================================

export async function signUp(email: string, password: string, name: string, type: UserType) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, type }
    }
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Profile doesn't exist yet - try to create it from auth user data
    console.warn('Profile not found, attempting to create from auth data...');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || '';
        const type = authUser.user_metadata?.type || 'customer';
        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            email: authUser.email || '',
            name: name,
            type: type,
            img: ''
          })
          .select()
          .single();

        if (insertErr) {
          console.error('Error creating profile:', insertErr);
          return null;
        }
        if (newProfile) {
          return {
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            type: newProfile.type as UserType,
            img: newProfile.img || ''
          };
        }
      }
    } catch (e) {
      console.error('Error auto-creating profile:', e);
    }
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    type: data.type as UserType,
    img: data.img || ''
  };
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      img: updates.img,
      type: updates.type
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// PROFESSIONALS FUNCTIONS
// ============================================

export async function getAllProfessionals(): Promise<Professional[]> {
  const { data: pros, error } = await supabase
    .from('professionals')
    .select(`
      *,
      portfolio_items (*),
      reviews (*),
      slots (*),
      credentials (*),
      faqs (*)
    `);

  if (error) throw error;
  if (!pros) return [];

  const mapped = pros.map(mapDbProToProfessional);

  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('professional_categories')
      .select('*');

    if (!categoriesError && categories) {
      return mapped.map(pro => {
        const extraCategories = categories
          .filter((c: any) => c.user_id === pro.id || c.professional_id === (pro as any)._dbId)
          .map((c: any) => ({
            id: c.id,
            catId: c.cat_id,
            sub: c.sub,
            isPrimary: c.is_primary
          }));
        return {
          ...pro,
          categories: extraCategories.length > 0
            ? extraCategories
            : [{ catId: pro.catId, sub: pro.sub, isPrimary: true }]
        };
      });
    }
  } catch (e) {
    console.warn('professional_categories not available yet:', e);
  }

  return mapped;
}

export async function getProfessionalByUserId(userId: string): Promise<Professional | null> {
  const { data, error } = await supabase
    .from('professionals')
    .select(`
      *,
      portfolio_items (*),
      reviews (*),
      slots (*),
      credentials (*),
      faqs (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return mapDbProToProfessional(data);
}

export async function createProfessional(pro: Partial<Professional> & { user_id: string }) {
  const { data, error } = await supabase
    .from('professionals')
    .insert({
      user_id: pro.user_id,
      name: pro.name || '',
      email: pro.email || '',
      img: pro.img || '',
      cat_id: pro.catId || 'home',
      sub: pro.sub || 'Handyman',
      rating: pro.rating || 5.0,
      review_count: pro.rc || 0,
      jobs_completed: pro.jobs || 0,
      location: pro.loc || 'Local',
      price: pro.price || 25,
      unit: pro.unit || '/hr',
      verified_id: pro.v?.id || 0,
      verified_dbs: pro.v?.dbs || 0,
      verified_ins: pro.v?.ins || 0,
      about: pro.about || '',
      services: pro.svcs || ['General Service'],
      is_emergency_available: pro.isEmergencyAvailable || false,
      cover_img: pro.coverImg || '',
      hired_count: pro.hiredCount || 0,
      response_time: pro.responseTime || '',
      year_started: pro.yearStarted,
      team_size: pro.teamSize || '',
      description: pro.description || '',
      experience_years: pro.experienceYears || 0,
      fixed_prices: pro.fixedPrices || [],
      coverage_radius_km: pro.coverageRadiusKm || 10,
      availability: pro.availability || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfessional(proDbId: string, updates: Partial<Professional>) {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.img !== undefined) updateData.img = updates.img;
  if (updates.catId !== undefined) updateData.cat_id = updates.catId;
  if (updates.sub !== undefined) updateData.sub = updates.sub;
  if (updates.rating !== undefined) updateData.rating = updates.rating;
  if (updates.rc !== undefined) updateData.review_count = updates.rc;
  if (updates.jobs !== undefined) updateData.jobs_completed = updates.jobs;
  if (updates.loc !== undefined) updateData.location = updates.loc;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.unit !== undefined) updateData.unit = updates.unit;
  if (updates.about !== undefined) updateData.about = updates.about;
  if (updates.svcs !== undefined) updateData.services = updates.svcs;
  if (updates.isEmergencyAvailable !== undefined) updateData.is_emergency_available = updates.isEmergencyAvailable;
  if (updates.coverImg !== undefined) updateData.cover_img = updates.coverImg;
  if (updates.hiredCount !== undefined) updateData.hired_count = updates.hiredCount;
  if (updates.responseTime !== undefined) updateData.response_time = updates.responseTime;
  if (updates.yearStarted !== undefined) updateData.year_started = updates.yearStarted;
  if (updates.teamSize !== undefined) updateData.team_size = updates.teamSize;
  if (updates.v !== undefined) {
    updateData.verified_id = updates.v.id;
    updateData.verified_dbs = updates.v.dbs;
    updateData.verified_ins = updates.v.ins;
  }
  // Current Supabase schema stores storefront copy in `about` and does not
  // include the newer optional dashboard columns yet.
  if ((updates as any).description !== undefined && updates.about === undefined) updateData.about = (updates as any).description;
  if ((updates as any).experienceYears !== undefined) updateData.year_started = new Date().getFullYear() - Number((updates as any).experienceYears || 0);

  if (Object.keys(updateData).length === 0) return null;

  const { data, error } = await supabase
    .from('professionals')
    .update(updateData)
    .eq('id', proDbId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// JOBS FUNCTIONS
// ============================================

export async function getMyJobs(userId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer_review:job_reviews!job_id(*)
    `)
    .or(`customer_id.eq.${userId},pro_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(mapDbJobToJob);
}

export async function createJob(job: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  professionalId: string;
  proUserId: string;
  proName: string;
  proEmail: string;
  proSub: string;
  price: string;
  description: string;
  slot: string;
  isEmergency?: boolean;
}): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      customer_id: job.customerId,
      customer_name: job.customerName,
      customer_email: job.customerEmail,
      professional_id: job.professionalId,
      pro_user_id: job.proUserId,
      pro_name: job.proName,
      pro_email: job.proEmail,
      pro_sub: job.proSub,
      price: job.price,
      description: job.description,
      slot: job.slot,
      status: 'hired',
      is_emergency: job.isEmergency || false
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbJobToJob(data);
}

export async function updateJobStatus(jobId: string, status: string, extras?: {
  customerFinished?: boolean;
  proFinished?: boolean;
  isDisputed?: boolean;
  photos?: string[];
}) {
  const updateData: any = { status };
  if (extras?.customerFinished !== undefined) updateData.customer_finished = extras.customerFinished;
  if (extras?.proFinished !== undefined) updateData.pro_finished = extras.proFinished;
  if (extras?.isDisputed !== undefined) updateData.is_disputed = extras.isDisputed;
  if (extras?.photos !== undefined) updateData.photos = extras.photos;

  const { data, error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return mapDbJobToJob(data);
}

// ============================================
// JOB REVIEWS
// ============================================

export async function createJobReview(review: {
  jobId: string;
  authorId: string;
  authorType: 'customer' | 'professional';
  rating: number;
  text: string;
  photos?: string[];
  onTime?: boolean | null;
  recommend?: boolean | null;
}) {
  const { data, error } = await supabase
    .from('job_reviews')
    .insert({
      job_id: review.jobId,
      author_id: review.authorId,
      author_type: review.authorType,
      rating: review.rating,
      text: review.text,
      photos: review.photos || [],
      on_time: review.onTime ?? null,
      recommend: review.recommend ?? null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// MESSAGES FUNCTIONS
// ============================================

export async function getMyMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`from_id.eq.${userId},to_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map(mapDbMsgToMessage);
}

export async function uploadChatImage(file: File, conversationId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('chat-media')
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from('chat-media')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function uploadProfessionalImage(file: File, proId: string, kind: 'avatar' | 'cover' | 'portfolio'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const safeKind = kind || 'portfolio';
  const fileName = `professionals/${proId}/${safeKind}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('chat-media')
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from('chat-media')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function sendMessage(msg: {
  conversationId: string;
  fromId: string;
  fromName: string;
  toId: string;
  text: string;
  isEmergency?: boolean;
  imageUrl?: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: msg.conversationId,
      from_id: msg.fromId,
      from_name: msg.fromName,
      to_id: msg.toId,
      text: msg.text,
      is_emergency: msg.isEmergency || false,
      image_url: msg.imageUrl || null,
      read: false
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbMsgToMessage(data);
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('to_id', userId)
    .eq('read', false);

  if (error) throw error;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToMessages(userId: string, callback: (msg: Message) => void) {
  // Subscribe to messages sent TO this user
  const chRecv = supabase
    .channel(`messages-recv-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_id=eq.${userId}`
    }, (payload) => {
      callback(mapDbMsgToMessage(payload.new));
    })
    .subscribe();

  // Also subscribe to messages sent BY this user (so sent messages appear in real-time on other devices)
  const chSent = supabase
    .channel(`messages-sent-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `from_id=eq.${userId}`
    }, (payload) => {
      callback(mapDbMsgToMessage(payload.new));
    })
    .subscribe();

  // Return an object that can remove both channels
  return { chRecv, chSent };
}

export function subscribeToJobs(userId: string, callback: (job: Job) => void) {
  const channel = supabase
    .channel(`jobs-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'jobs'
    }, (payload) => {
      if (payload.new) {
        const job = payload.new as any;
        // Only process jobs that belong to this user
        if (job.customer_id === userId || job.pro_user_id === userId) {
          callback(mapDbJobToJob(job));
        }
      }
    })
    .subscribe();
  return channel;
}

// ============================================
// PORTFOLIO FUNCTIONS
// ============================================

export async function addPortfolioItem(professionalId: string, item: PortfolioItem) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      professional_id: professionalId,
      image: item.image,
      title: item.title || '',
      type: item.type || 'work'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePortfolioItem(itemId: string) {
  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function replaceProfessionalCategories(
  professionalId: string,
  userId: string,
  categories: Array<{ catId: string; sub: string; isPrimary?: boolean }>
) {
  const { error: deleteError } = await supabase
    .from('professional_categories')
    .delete()
    .eq('professional_id', professionalId);

  if (deleteError) throw deleteError;

  if (categories.length === 0) return [];

  const { data, error } = await supabase
    .from('professional_categories')
    .insert(categories.map(cat => ({
      professional_id: professionalId,
      user_id: userId,
      cat_id: cat.catId,
      sub: cat.sub,
      is_primary: !!cat.isPrimary
    })))
    .select();

  if (error) throw error;
  return data;
}

// ============================================
// MAPPER FUNCTIONS (DB → App types)
// ============================================

function mapDbMsgToMessage(db: any): Message {
  return {
    id: db.id,
    cid: db.conversation_id,
    from: db.from_id,
    fn: db.from_name,
    to: db.to_id,
    text: db.text || '',
    time: db.created_at,
    read: db.read ?? false,
    isEmergency: db.is_emergency ?? false,
    imageUrl: db.image_url || undefined,
  };
}

function mapDbProToProfessional(dbPro: any): Professional {
  return {
    id: dbPro.user_id || dbPro.id, // use user_id as the app-level ID for consistency
    name: dbPro.name,
    email: dbPro.email,
    img: dbPro.img || '',
    catId: dbPro.cat_id,
    sub: dbPro.sub,
    rating: parseFloat(dbPro.rating) || 5.0,
    rc: dbPro.review_count || 0,
    jobs: dbPro.jobs_completed || 0,
    loc: dbPro.location || 'Local',
    price: parseFloat(dbPro.price) || 25,
    unit: dbPro.unit || '/hr',
    v: {
      id: dbPro.verified_id || 0,
      dbs: dbPro.verified_dbs || 0,
      ins: dbPro.verified_ins || 0,
    },
    about: dbPro.about || '',
    svcs: dbPro.services || [],
    port: (dbPro.portfolio_items || []).map((p: any) => ({
      id: p.id,
      image: p.image,
      title: p.title || '',
      type: p.type || 'work'
    })),
    revs: (dbPro.reviews || []).map((r: any) => ({
      by: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      photos: r.photos || []
    })),
    slots: (dbPro.slots || []).map((s: any) => ({
      day: s.day,
      dt: s.dt,
      times: s.times || []
    })),
    isEmergencyAvailable: dbPro.is_emergency_available || false,
    coverImg: dbPro.cover_img || '',
    hiredCount: dbPro.hired_count || 0,
    responseTime: dbPro.response_time || '',
    yearStarted: dbPro.year_started,
    teamSize: dbPro.team_size || '',
    verifiedCredentials: (dbPro.credentials || []).map((c: any) => ({
      type: c.type,
      label: c.label
    })),
    faqs: (dbPro.faqs || []).map((f: any) => ({
      q: f.question,
      a: f.answer
    })),
    description: dbPro.description || '',
    experienceYears: dbPro.experience_years || 0,
    fixedPrices: dbPro.fixed_prices || [],
    packages: dbPro.packages || [],
    coverageRadiusKm: dbPro.coverage_radius_km || 10,
    availability: dbPro.availability || {},
    categories: [{ catId: dbPro.cat_id, sub: dbPro.sub, isPrimary: true }],
    _dbId: dbPro.id,
    monthlyGoal: dbPro.monthly_goal || 1500,
    address: dbPro.address || '',
    lat: dbPro.lat ?? undefined,
    lng: dbPro.lng ?? undefined,
    badge: dbPro.badge ?? null,
  } as Professional;
}

function mapDbJobToJob(dbJob: any): Job {
  // Extract reviews from the joined data
  const reviews = dbJob.customer_review || [];
  const customerReview = reviews.find((r: any) => r.author_type === 'customer');
  const proReview = reviews.find((r: any) => r.author_type === 'professional');

  return {
    id: dbJob.id,
    cId: dbJob.customer_id,
    cName: dbJob.customer_name,
    cEmail: dbJob.customer_email || '',
    pId: dbJob.pro_user_id,
    pEmail: dbJob.pro_email || '',
    pName: dbJob.pro_name,
    pSub: dbJob.pro_sub || '',
    price: dbJob.price || '0',
    desc: dbJob.description || '',
    slot: dbJob.slot || '',
    status: dbJob.status,
    cFin: dbJob.customer_finished || false,
    pFin: dbJob.pro_finished || false,
    rev: customerReview ? {
      rating: customerReview.rating,
      text: customerReview.text,
      date: new Date(customerReview.created_at).toLocaleDateString(),
      photos: customerReview.photos || []
    } : null,
    pRev: proReview ? {
      rating: proReview.rating,
      text: proReview.text,
      date: new Date(proReview.created_at).toLocaleDateString(),
      photos: proReview.photos || []
    } : null,
    disputed: dbJob.is_disputed || false,
    isEmergency: dbJob.is_emergency || false,
    created: dbJob.created_at,
    photos: dbJob.photos || []
  };
}

// ============================================
// REVIEW STATS & PRO REVIEWS
// ============================================

export async function getProReviews(proUserId: string): Promise<Review[]> {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, customer_name')
    .eq('pro_user_id', proUserId);

  if (!jobs || jobs.length === 0) return [];

  const jobIds = jobs.map(j => j.id);
  const jobNameMap = new Map(jobs.map(j => [j.id, j.customer_name]));

  const { data: reviews, error } = await supabase
    .from('job_reviews')
    .select('*')
    .eq('author_type', 'customer')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false });

  if (error || !reviews) return [];

  return reviews.map(r => ({
    by: jobNameMap.get(r.job_id) || 'Customer',
    rating: r.rating,
    text: r.text,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
    photos: r.photos || []
  }));
}

export async function getProReviewStats(proUserId: string): Promise<{
  avgRating: number;
  reviewCount: number;
  onTimePct: number | null;
  recommendPct: number | null;
}> {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('pro_user_id', proUserId);

  if (!jobs || jobs.length === 0) return { avgRating: 5.0, reviewCount: 0, onTimePct: null, recommendPct: null };

  const jobIds = jobs.map(j => j.id);
  const { data: reviews } = await supabase
    .from('job_reviews')
    .select('rating, on_time, recommend')
    .eq('author_type', 'customer')
    .in('job_id', jobIds);

  if (!reviews || reviews.length === 0) return { avgRating: 5.0, reviewCount: 0, onTimePct: null, recommendPct: null };

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const onTimeAnswered = reviews.filter(r => r.on_time !== null);
  const onTimePct = onTimeAnswered.length > 0
    ? Math.round(100 * onTimeAnswered.filter(r => r.on_time === true).length / onTimeAnswered.length)
    : null;

  const recommendAnswered = reviews.filter(r => r.recommend !== null);
  const recommendPct = recommendAnswered.length > 0
    ? Math.round(100 * recommendAnswered.filter(r => r.recommend === true).length / recommendAnswered.length)
    : null;

  return {
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
    onTimePct,
    recommendPct
  };
}

// ============================================
// SERVICE REQUESTS & QUOTES
// ============================================

export async function createServiceRequest(req: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  catId: string;
  sub: string;
  description: string;
  budgetMax?: number;
  slotPreference?: string;
}): Promise<ServiceRequest> {
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      customer_id: req.customerId,
      customer_name: req.customerName,
      customer_email: req.customerEmail,
      cat_id: req.catId,
      sub: req.sub,
      description: req.description,
      budget_max: req.budgetMax || null,
      slot_preference: req.slotPreference || null,
      status: 'open'
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbRequest(data);
}

export async function getServiceRequestsForPro(catId: string, sub: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('cat_id', catId)
    .eq('sub', sub)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []).map(mapDbRequest);
}

export async function getMyServiceRequests(customerId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, quotes(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    ...mapDbRequest(r),
    quotes: (r.quotes || []).map(mapDbQuote)
  }));
}

export async function submitQuote(q: {
  requestId: string;
  proId: string;
  proDbId: string;
  proName: string;
  proEmail: string;
  proImg?: string;
  price: number;
  unit: string;
  message: string;
}): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      request_id: q.requestId,
      pro_id: q.proId,
      pro_db_id: q.proDbId,
      pro_name: q.proName,
      pro_email: q.proEmail,
      pro_img: q.proImg || null,
      price: q.price,
      unit: q.unit,
      message: q.message,
      status: 'pending'
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbQuote(data);
}

export async function acceptQuote(quoteId: string, requestId: string): Promise<void> {
  // Mark quote as accepted
  await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
  // Decline all other quotes for this request
  await supabase.from('quotes').update({ status: 'declined' }).eq('request_id', requestId).neq('id', quoteId);
  // Close the request
  await supabase.from('service_requests').update({ status: 'closed' }).eq('id', requestId);
}

export function subscribeToQuotes(requestId: string, callback: (q: Quote) => void) {
  return supabase
    .channel(`quotes-${requestId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quotes', filter: `request_id=eq.${requestId}` },
      payload => callback(mapDbQuote(payload.new)))
    .subscribe();
}

function mapDbRequest(db: any): ServiceRequest {
  return {
    id: db.id,
    customerId: db.customer_id,
    customerName: db.customer_name,
    customerEmail: db.customer_email,
    catId: db.cat_id,
    sub: db.sub,
    description: db.description || '',
    budgetMax: db.budget_max || undefined,
    slotPreference: db.slot_preference || undefined,
    status: db.status || 'open',
    created: db.created_at,
    quotes: []
  };
}

function mapDbQuote(db: any): Quote {
  return {
    id: db.id,
    requestId: db.request_id,
    proId: db.pro_id,
    proDbId: db.pro_db_id,
    proName: db.pro_name,
    proEmail: db.pro_email,
    proImg: db.pro_img,
    price: db.price,
    unit: db.unit || '/job',
    message: db.message || '',
    status: db.status || 'pending',
    created: db.created_at
  };
}

// ============================================
// EMERGENCY REQUESTS FUNCTIONS
// ============================================

export interface EmergencyRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  categoryId: string;
  categoryName: string;
  description: string;
  locationCity: string;
  locationPostcode: string;
  priorityFee: number;
  surgeMultiplier: number;
  surgeLabel: string;
  status: 'pending' | 'matched' | 'hired' | 'cancelled';
  resultingJobId?: string;
  hiredProId?: string;
  hiredProName?: string;
  createdAt: string;
  matchedAt?: string;
  hiredAt?: string;
}

export async function createEmergencyRequest(req: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  categoryId: string;
  categoryName: string;
  description: string;
  locationCity: string;
  locationPostcode: string;
  priorityFee: number;
  surgeMultiplier: number;
  surgeLabel: string;
}): Promise<EmergencyRequest> {
  const { data, error } = await supabase
    .from('emergency_requests')
    .insert({
      customer_id: req.customerId,
      customer_name: req.customerName,
      customer_email: req.customerEmail,
      category_id: req.categoryId,
      category_name: req.categoryName,
      description: req.description,
      location_city: req.locationCity,
      location_postcode: req.locationPostcode,
      priority_fee: req.priorityFee,
      surge_multiplier: req.surgeMultiplier,
      surge_label: req.surgeLabel,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbEmergencyRequest(data);
}

export async function getMyEmergencyRequests(customerId: string): Promise<EmergencyRequest[]> {
  const { data, error } = await supabase
    .from('emergency_requests')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(mapDbEmergencyRequest);
}

export async function getPendingEmergencyRequests(): Promise<EmergencyRequest[]> {
  const { data, error } = await supabase
    .from('emergency_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(mapDbEmergencyRequest);
}

export async function updateEmergencyRequestStatus(
  requestId: string,
  status: 'matched' | 'hired' | 'cancelled',
  extras?: {
    resultingJobId?: string;
    hiredProId?: string;
    hiredProName?: string;
  }
): Promise<EmergencyRequest> {
  const updateData: any = { status };

  if (status === 'matched') updateData.matched_at = new Date().toISOString();
  if (status === 'hired') updateData.hired_at = new Date().toISOString();
  if (extras?.resultingJobId) updateData.resulting_job_id = extras.resultingJobId;
  if (extras?.hiredProId) updateData.hired_pro_id = extras.hiredProId;
  if (extras?.hiredProName) updateData.hired_pro_name = extras.hiredProName;

  const { data, error } = await supabase
    .from('emergency_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return mapDbEmergencyRequest(data);
}

export function subscribeToEmergencyRequests(callback: (req: EmergencyRequest) => void) {
  const channel = supabase
    .channel('emergency-requests-feed')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'emergency_requests'
    }, (payload) => {
      callback(mapDbEmergencyRequest(payload.new));
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'emergency_requests'
    }, (payload) => {
      callback(mapDbEmergencyRequest(payload.new));
    })
    .subscribe();
  return channel;
}

function mapDbEmergencyRequest(db: any): EmergencyRequest {
  return {
    id: db.id,
    customerId: db.customer_id,
    customerName: db.customer_name,
    customerEmail: db.customer_email || '',
    categoryId: db.category_id,
    categoryName: db.category_name,
    description: db.description || '',
    locationCity: db.location_city || '',
    locationPostcode: db.location_postcode || '',
    priorityFee: parseFloat(db.priority_fee) || 10,
    surgeMultiplier: parseFloat(db.surge_multiplier) || 1.0,
    surgeLabel: db.surge_label || 'Standard',
    status: db.status,
    resultingJobId: db.resulting_job_id,
    hiredProId: db.hired_pro_id,
    hiredProName: db.hired_pro_name || '',
    createdAt: db.created_at,
    matchedAt: db.matched_at,
    hiredAt: db.hired_at
  };
}

// ============================================
// PRICING & AVAILABILITY FUNCTIONS
// ============================================

export async function updatePackages(proDbId: string, packages: Array<{ name: string, price: number, unit: string, description: string, features: string[] }>) {
  const { error } = await supabase
    .from('professionals')
    .update({ packages })
    .eq('id', proDbId);
  if (error) throw error;
}

export async function replaceFaqs(proDbId: string, faqs: Array<{ q: string; a: string }>) {
  // Delete existing FAQs for this pro then re-insert
  await supabase.from('faqs').delete().eq('professional_id', proDbId);
  if (faqs.length === 0) return;
  const { error } = await supabase.from('faqs').insert(
    faqs.map(f => ({ professional_id: proDbId, question: f.q, answer: f.a }))
  );
  if (error) throw error;
}

export async function updateFixedPrices(proDbId: string, fixedPrices: Array<{ service: string, price: number, unit: string }>) {
  const { data, error } = await supabase
    .from('professionals')
    .update({ fixed_prices: fixedPrices })
    .eq('id', proDbId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAvailability(proDbId: string, availability: Record<string, string[]>) {
  const { data, error } = await supabase
    .from('professionals')
    .update({ availability })
    .eq('id', proDbId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// BOOKING FUNCTIONS
// ============================================

function mapDbBooking(row: any): Booking {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name || '',
    clientEmail: row.client_email || '',
    proId: row.pro_id,
    proDbId: row.pro_db_id,
    proName: row.pro_name || '',
    date: row.date,
    timeSlot: row.time_slot,
    description: row.description || '',
    status: row.status,
    created: row.created_at,
  };
}

export async function createBooking(booking: {
  clientId: string;
  clientName: string;
  clientEmail: string;
  proId: string;
  proDbId?: string;
  proName: string;
  date: string;
  timeSlot: string;
  description: string;
}): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: booking.clientId,
      client_name: booking.clientName,
      client_email: booking.clientEmail,
      pro_id: booking.proId,
      pro_db_id: booking.proDbId,
      pro_name: booking.proName,
      date: booking.date,
      time_slot: booking.timeSlot,
      description: booking.description,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbBooking(data);
}

export async function getMyBookings(clientId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapDbBooking);
}

export async function getProBookings(proId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('pro_id', proId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapDbBooking);
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'declined' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
  if (error) throw error;
}

export async function updateMonthlyGoal(proDbId: string, goal: number): Promise<void> {
  const { error } = await supabase
    .from('professionals')
    .update({ monthly_goal: goal })
    .eq('id', proDbId);
  if (error) throw error;
}

// ─── Location ────────────────────────────────────────────────────────────────

/** Geocode a street name in Ploiești via Nominatim (OSM). Returns null if not found. */
export async function geocodeStreet(street: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${street}, Ploiesti, Romania`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ro`,
      { headers: { 'User-Agent': 'CloserApp/1.0 (contact@closer.ro)' } }
    );
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

/** Haversine distance in km between two points */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export const PLOIESTI_CENTER = { lat: 44.9369, lng: 26.0224 };
export const PLOIESTI_RADIUS_KM = 20;

export async function updateProLocation(
  proDbId: string,
  address: string,
  lat: number | null,
  lng: number | null
): Promise<void> {
  const { error } = await supabase
    .from('professionals')
    .update({ address, lat, lng })
    .eq('id', proDbId);
  if (error) throw error;
}

// ─── Favorites ─────────────────────────────────────────────────────────────

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('professional_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(r => r.professional_id);
}

export async function addFavorite(userId: string, proId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, professional_id: proId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function removeFavorite(userId: string, proId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('professional_id', proId);
  if (error) throw error;
}

// ============================================
// VERIFICATION FUNCTIONS
// ============================================

export async function submitVerificationRequest(
  userId: string,
  proId: string,
  idFrontUrl: string,
  idBackUrl: string,
  selfieUrl: string
): Promise<void> {
  // Upsert — replace any existing pending request
  const { error } = await supabase
    .from('verification_requests')
    .upsert({
      user_id: userId,
      professional_id: proId,
      id_front_url: idFrontUrl,
      id_back_url: idBackUrl,
      selfie_url: selfieUrl,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getVerificationStatus(userId: string): Promise<'none' | 'pending' | 'approved' | 'rejected'> {
  const { data, error } = await supabase
    .from('verification_requests')
    .select('status')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return 'none';
  return data.status as 'pending' | 'approved' | 'rejected';
}

export async function uploadVerificationDoc(
  userId: string,
  file: File,
  docType: 'id_front' | 'id_back' | 'selfie'
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${docType}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('verifications')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  // Return the path (not public URL — bucket is private)
  return path;
}

export async function updatePhone(userId: string, phone: string, verified: boolean = false): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ phone, phone_verified: verified })
    .eq('id', userId);
  if (error) throw error;
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<boolean> {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) return false;
  return true;
}
