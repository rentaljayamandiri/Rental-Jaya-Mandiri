
import { Car, CarCategory, User } from './types';

export const INITIAL_CARS: Car[] = [
  {
    id: '1',
    brand: 'Toyota',
    name: 'Innova Zenix',
    category: CarCategory.MPV_PREMIUM,
    pricePerDay: 850000,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Bensin/Hybrid',
    seats: 7,
    rating: 4.9,
    description: 'Generasi terbaru Innova dengan kenyamanan premium dan teknologi hybrid.',
    features: ['AC', 'Audio Premium', 'Leather Seats', 'Kamera Parkir']
  },
  {
    id: '2',
    brand: 'Toyota',
    name: 'Alphard',
    category: CarCategory.LUXURY,
    pricePerDay: 2500000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    seats: 7,
    rating: 5.0,
    description: 'Standar kemewahan untuk perjalanan bisnis dan tamu VIP.',
    features: ['Pilot Seats', 'Sunroof', 'Cool Box', 'Surround Sound']
  },
  {
    id: '3',
    brand: 'Toyota',
    name: 'HiAce Premio',
    category: CarCategory.VAN,
    pricePerDay: 1200000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Diesel',
    seats: 15,
    rating: 4.8,
    description: 'Pilihan terbaik untuk rombongan besar dengan kabin luas.',
    features: ['AC Double', 'Audio System', 'Bagasi Luas', 'Comfortable Seats']
  },
  {
    id: '4',
    brand: 'Toyota',
    name: 'Avanza',
    category: CarCategory.MPV,
    pricePerDay: 400000,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual/Automatic',
    fuelType: 'Bensin',
    seats: 7,
    rating: 4.6,
    description: 'Mobil keluarga sejuta umat yang handal dan irit.',
    features: ['AC', 'Power Steering', 'Safety Feature']
  },
  {
    id: '5',
    brand: 'Suzuki',
    name: 'XL 7',
    category: CarCategory.MPV,
    pricePerDay: 500000,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    seats: 7,
    rating: 4.7,
    description: 'The New Extraordinary SUV untuk petualangan keluarga.',
    features: ['Smart E-Mirror', 'Ground Clearance Tinggi', 'LED Headlamp']
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'root-1',
    email: 'ucu.suratman.mpd@gmail.com',
    name: 'Ucu Suratman (Master)',
    password: 'admin123',
    role: 'MASTER_ADMIN'
  }
];

export const SLIDER_DATA = [
  {
    id: 1,
    title: "Toyota Innova Zenix",
    subtitle: "Teknologi Hybrid Terbaru untuk Keluarga",
    image: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=1600",
    cta: "Pesan Sekarang"
  },
  {
    id: 2,
    title: "Executive Alphard",
    subtitle: "Kemewahan Tanpa Kompromi",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600",
    cta: "Sewa Premium"
  },
  {
    id: 3,
    title: "Suzuki XL7",
    subtitle: "SUV Tangguh untuk Petualangan Anda",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1600",
    cta: "Lihat Detail"
  }
];
