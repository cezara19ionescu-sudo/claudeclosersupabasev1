export type UserType = 'customer' | 'professional';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  img?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  subs: string[];
  aliases?: string[];
}

export interface Review {
  n?: string;
  by?: string;
  r?: number;
  rating: number;
  tx?: string;
  text: string;
  d?: string;
  date: string;
  photos?: string[];
}

export interface PortfolioItem {
  id?: string;
  image: string;
  title?: string;
  type?: 'before' | 'after' | 'work';
}

export interface Slot {
  day: string;
  dt: string;
  times: string[];
}

export interface ServicePackage {
  name: 'Basic' | 'Standard' | 'Premium';
  price: number;
  unit: string;       // e.g. '/hr', '/job', '/day'
  description: string;
  features: string[];
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  img?: string;
  catId: string;
  sub: string;
  rating: number;
  rc: number;
  jobs: number;
  loc: string;
  price: number;
  unit: string;
  v: {
    id: number;
    dbs: number;
    ins: number;
  };
  about: string;
  svcs: string[];
  port: PortfolioItem[];
  revs: Review[];
  slots: Slot[];
  isEmergencyAvailable?: boolean;
  coverImg?: string;
  hiredCount?: number;
  responseTime?: string;
  yearStarted?: number;
  teamSize?: string;
  verifiedCredentials?: { type: string, label: string }[];
  faqs?: { q: string, a: string }[];
  description?: string;
  experienceYears?: number;
  fixedPrices?: { service: string, price: number, unit: string }[];
  packages?: ServicePackage[];
  coverageRadiusKm?: number;
  availability?: Record<string, string[]>;
  categories?: { id?: string; catId: string; sub: string; isPrimary?: boolean }[];
  _dbId?: string;
  lat?: number;
  lng?: number;
  address?: string;
  badge?: 'rising_star' | 'top_rated' | null;
  monthlyGoal?: number;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  catId: string;
  sub: string;
  description: string;
  budgetMax?: number;
  slotPreference?: string;
  status: 'open' | 'closed';
  created: string;
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  requestId: string;
  proId: string;
  proDbId?: string;
  proName: string;
  proEmail: string;
  proImg?: string;
  price: number;
  unit: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created: string;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  proId: string;
  proDbId?: string;
  proName: string;
  date: string;       // ISO date string YYYY-MM-DD
  timeSlot: string;   // e.g. "10:00"
  description: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
  created: string;
}

export type JobStatus = 'hired' | 'active' | 'finish_requested' | 'completed' | 'cancelled' | 'declined';

export interface Job {
  id: string;
  cId: string;
  cName: string;
  cEmail: string;
  pId: string;
  pEmail: string;
  pName: string;
  pSub: string;
  price: string;
  desc: string;
  slot: string;
  status: JobStatus;
  cFin: boolean;
  pFin: boolean;
  rev: Review | null;
  pRev: Review | null;
  disputed?: boolean;
  isEmergency?: boolean;
  created: string;
  photos?: string[];
}

export interface Message {
  id: string;
  cid: string;
  from: string;
  fn: string;
  to: string;
  text: string;
  time: string;
  read?: boolean;
  isEmergency?: boolean;
  imageUrl?: string;
}
