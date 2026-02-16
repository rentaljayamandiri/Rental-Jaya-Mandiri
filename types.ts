
export enum CarCategory {
  MPV_PREMIUM = 'MPV Premium',
  VAN = 'Van',
  MPV = 'MPV',
  LUXURY = 'Luxury',
  ECONOMY = 'Economy'
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  category: CarCategory;
  pricePerDay: number;
  image: string;
  transmission: 'Automatic' | 'Manual' | 'Manual/Automatic';
  fuelType: string;
  seats: number;
  rating: number;
  description: string;
  features: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'MASTER_ADMIN' | 'ADMIN' | 'MEMBER';
}

export interface Article {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'HOME' | 'LOGIN' | 'DASHBOARD';
export type AdminSubView = 'OVERVIEW' | 'ARMADA' | 'LAYANAN' | 'KONTAK' | 'SLIDER' | 'ARTIKEL' | 'KELOLA_ADMIN' | 'DATABASE';
