import { supabase } from './supabase';
import type { User, UserType, Professional, Job, Message, Review, PortfolioItem, Slot } from '../types';

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

  return pros.map(mapDbProToProfessional);
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
      team_size: pro.teamSize || ''
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
}) {
  const { data, error } = await supabase
    .from('job_reviews')
    .insert({
      job_id: review.jobId,
      author_id: review.authorId,
      author_type: review.authorType,
      rating: review.rating,
      text: review.text,
      photos: review.photos || []
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

export async function sendMessage(msg: {
  conversationId: string;
  fromId: string;
  fromName: string;
  toId: string;
  text: string;
  isEmergency?: boolean;
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
  const channel = supabase
    .channel(`messages-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_id=eq.${userId}`
    }, (payload) => {
      callback(mapDbMsgToMessage(payload.new));
    })
    .subscribe();
  return channel;
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

// ============================================
// MAPPER FUNCTIONS (DB → App types)
// ============================================

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
    // Store the DB id for updates
    _dbId: dbPro.id
  } as Professional & { _dbId: string };
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

function mapDbMsgToMessage(dbMsg: any): Message {
  return {
    id: dbMsg.id,
    cid: dbMsg.conversation_id,
    from: dbMsg.from_id,
    fn: dbMsg.from_name,
    to: dbMsg.to_id,
    text: dbMsg.text,
    time: dbMsg.created_at,
    read: dbMsg.read || false,
    isEmergency: dbMsg.is_emergency || false
  };
}
