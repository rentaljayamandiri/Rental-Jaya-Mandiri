
import { Car, CarCategory, User } from './types';

export const INITIAL_CARS: Car[] = [
  {
    id: 'zenix-1',
    brand: 'Toyota',
    name: 'Innova Zenix V',
    category: CarCategory.MPV_PREMIUM,
    pricePerDay: 950000,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1200',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 7,
    rating: 5.0,
    description: 'Unit paling favorit. Sangat nyaman, irit bensin, dan interior mewah.',
    features: ['Panoramic Roof', 'Captain Seat', 'Full Entertainment']
  },
  {
    id: 'alphard-1',
    brand: 'Toyota',
    name: 'Alphard Transformer',
    category: CarCategory.LUXURY,
    pricePerDay: 2800000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    seats: 7,
    rating: 5.0,
    description: 'Pilihan utama pejabat dan eksekutif. Kenyamanan nomor satu.',
    features: ['Electric Door', 'Pilot Seat', 'Cool Box']
  },
  {
    id: 'premio-1',
    brand: 'Toyota',
    name: 'HiAce Premio',
    category: CarCategory.VAN,
    pricePerDay: 1400000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
    transmission: 'Manual',
    fuelType: 'Diesel',
    seats: 14,
    rating: 4.9,
    description: 'Unit travel mewah untuk keluarga besar atau rombongan kantor.',
    features: ['Luxury Interior', 'Reclining Seats', 'AC Dingin']
  },
  {
    id: 'avanza-1',
    brand: 'Toyota',
    name: 'New Avanza',
    category: CarCategory.MPV,
    pricePerDay: 450000,
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=1200',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    seats: 7,
    rating: 4.8,
    description: 'Irit, handal, dan cocok untuk keliling Jakarta seharian.',
    features: ['Unit Bersih', 'Double Blower', 'Audio Bluetooth']
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
    title: "Luxury Mobility",
    subtitle: "Innova Zenix Hybrid - Masa Depan Berkendara Keluarga",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1600",
    cta: "Pesan Unit"
  },
  {
    id: 2,
    title: "VIP Executive",
    subtitle: "Alphard Transformer - Perjalanan Bintang Lima",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600",
    cta: "Sewa Sekarang"
  }
];
