
import { INITIAL_CARS, INITIAL_USERS, SLIDER_DATA } from './constants';
import { Car, Article, User } from './types';

const KEYS = {
  CARS: 'rjm_cars',
  USERS: 'rjm_users',
  SLIDERS: 'rjm_sliders',
  ARTICLES: 'rjm_articles',
  CONTACT: 'rjm_contact',
  USER_SESSION: 'rjm_logged_user'
};

export const dbService = {
  // Ambil semua data untuk backup
  exportAllData: () => {
    const data = {
      cars: JSON.parse(localStorage.getItem(KEYS.CARS) || '[]'),
      articles: JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]'),
      sliders: JSON.parse(localStorage.getItem(KEYS.SLIDERS) || '[]'),
      contact: JSON.parse(localStorage.getItem(KEYS.CONTACT) || '{}'),
      users: JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
      timestamp: new Date().toISOString()
    };
    // Encode ke base64 agar aman dicopy sebagai "Sync Key"
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  },

  // Masukkan data dari backup
  importAllData: (syncKey: string) => {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(syncKey))));
      if (decoded.cars) localStorage.setItem(KEYS.CARS, JSON.stringify(decoded.cars));
      if (decoded.articles) localStorage.setItem(KEYS.ARTICLES, JSON.stringify(decoded.articles));
      if (decoded.sliders) localStorage.setItem(KEYS.SLIDERS, JSON.stringify(decoded.sliders));
      if (decoded.contact) localStorage.setItem(KEYS.CONTACT, JSON.stringify(decoded.contact));
      if (decoded.users) localStorage.setItem(KEYS.USERS, JSON.stringify(decoded.users));
      return true;
    } catch (e) {
      console.error("Database Sync Failed", e);
      return false;
    }
  },

  resetToDefault: () => {
    localStorage.clear();
    window.location.reload();
  }
};
