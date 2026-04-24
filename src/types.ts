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
}
