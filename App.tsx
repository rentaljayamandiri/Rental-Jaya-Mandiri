
import React, { useState, useEffect, useRef } from 'react';
import { 
  CarFront, 
  Menu, 
  Star, 
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  LayoutDashboard,
  Car as CarIcon,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Edit,
  User as UserIcon,
  X,
  MessageSquare,
  Send,
  Sparkles,
  ArrowRight,
  Settings,
  FileText,
  Save,
  Image as PhotoIcon,
  ChevronRight,
  Monitor,
  Shield
} from 'lucide-react';
import { INITIAL_CARS, INITIAL_USERS, SLIDER_DATA } from './constants';
import { Car, CarCategory, ViewState, User, AdminSubView, Article, ChatMessage } from './types';
import { getCarRecommendation } from './geminiService';

const safeJSONParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('OVERVIEW');
  const [currentUser, setCurrentUser] = useState<User | null>(() => safeJSONParse('rjm_logged_user', null));
  
  // Data States
  const [cars, setCars] = useState<Car[]>(() => safeJSONParse('rjm_cars', INITIAL_CARS));
  const [users, setUsers] = useState<User[]>(() => safeJSONParse('rjm_users', INITIAL_USERS));
  const [sliders, setSliders] = useState(() => safeJSONParse('rjm_sliders', SLIDER_DATA));
  const [articles, setArticles] = useState<Article[]>(() => safeJSONParse('rjm_articles', [
    { id: '1', title: 'Kenapa Harus Rental di RJM?', content: 'Kami menjamin unit selalu bersih, wangi, dan mesin terawat...', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', date: '12 Feb 2024' }
  ]));
  const [contactInfo, setContactInfo] = useState(() => safeJSONParse('rjm_contact', {
    phone: '+62 812-1093-2808',
    email: 'csrentaljayamandiri@gmail.com',
    address: 'Pondok Pinang VI No. 64, Jakarta, Indonesia'
  }));

  // UI States
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Halo Bosku! Ada yang bisa saya bantu carikan mobil?' }]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('rjm_cars', JSON.stringify(cars));
    localStorage.setItem('rjm_users', JSON.stringify(users));
    localStorage.setItem('rjm_sliders', JSON.stringify(sliders));
    localStorage.setItem('rjm_articles', JSON.stringify(articles));
    localStorage.setItem('rjm_contact', JSON.stringify(contactInfo));
    localStorage.setItem('rjm_logged_user', JSON.stringify(currentUser));
  }, [cars, users, sliders, articles, contactInfo, currentUser]);

  useEffect(() => {
    if (view === 'HOME') {
      const interval = setInterval(() => setCurrentSlide(p => (p + 1) % sliders.length), 6000);
      return () => clearInterval(interval);
    }
  }, [view, sliders.length]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    const aiResponse = await getCarRecommendation(msg);
    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    setIsTyping(false);
  };

  // Forms Management
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
  const [editingSlider, setEditingSlider] = useState<any | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 md:p-10 shadow-2xl relative z-10 fade-in">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"><CarFront size={32} /></div>
            <h1 className="text-3xl font-black text-slate-900">Portal RJM</h1>
            <p className="text-slate-400 mt-2">Gunakan akun Master atau Admin</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            const email = target.email.value;
            const password = target.password.value;
            const user = users.find(u => u.email === email && u.password === password);
            if(user) { setCurrentUser(user); setView('DASHBOARD'); } else { alert('Email/Password Salah!'); }
          }} className="space-y-4">
            <input name="email" type="email" placeholder="Email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600" required />
            <input name="password" type="password" placeholder="Password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600" required />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200">Masuk Dashboard</button>
          </form>
          <button onClick={() => setView('HOME')} className="w-full mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">Beranda</button>
        </div>
      </div>
    );
  }

  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-50">
          <div className="p-8 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white"><CarFront size={20} /></div>
            <span className="font-black text-slate-900 tracking-tight">RJM Admin</span>
          </div>
          <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
              { id: 'ARMADA', label: 'Unit Mobil', icon: CarIcon },
              { id: 'SLIDER', label: 'Banner Depan', icon: Monitor },
              { id: 'ARTIKEL', label: 'Artikel Blog', icon: FileText },
              { id: 'KONTAK', label: 'Info Kontak', icon: Settings },
              { id: 'KELOLA_ADMIN', label: 'User Admin', icon: UserIcon },
            ].map(item => (
              <button key={item.id} onClick={() => setAdminSubView(item.id as AdminSubView)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${adminSubView === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => { setCurrentUser(null); setView('HOME'); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:ml-72 p-6 md:p-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{adminSubView}</h1>
              <p className="text-slate-400 font-medium">Panel Manajemen Konten RJM</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setView('HOME')} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all text-sm">Lihat Web</button>
              {adminSubView === 'ARMADA' && <button onClick={() => setEditingCar({ brand: '', name: '', pricePerDay: 0, seats: 7, category: CarCategory.MPV, features: [], image: '', transmission: 'Automatic' })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 text-sm"><Plus size={20}/> Unit</button>}
              {adminSubView === 'ARTIKEL' && <button onClick={() => setEditingArticle({ title: '', content: '', image: '', date: new Date().toLocaleDateString() })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 text-sm"><Plus size={20}/> Artikel</button>}
              {adminSubView === 'KELOLA_ADMIN' && <button onClick={() => setEditingUser({ name: '', email: '', password: '', role: 'ADMIN' as any })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 text-sm"><Plus size={20}/> Admin</button>}
            </div>
          </header>

          {/* Views Mapping */}
          {adminSubView === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Armada', value: cars.length, icon: CarIcon, color: 'bg-indigo-600' },
                { label: 'Total Artikel', value: articles.length, icon: FileText, color: 'bg-emerald-500' },
                { label: 'User Terdaftar', value: users.length, icon: UserIcon, color: 'bg-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className={`${stat.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100`}><stat.icon size={28}/></div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminSubView === 'ARMADA' && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Unit</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Harga</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cars.map(car => (
                    <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6 flex items-center gap-4">
                        <img src={car.image} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <span className="font-bold text-slate-900 block">{car.brand} {car.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{car.category} • {car.transmission}</span>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-indigo-600">{formatIDR(car.pricePerDay)}</td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingCar(car)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit size={18}/></button>
                          <button onClick={() => setCars(cars.filter(c => c.id !== car.id))} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminSubView === 'SLIDER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sliders.map((s:any) => (
                <div key={s.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm group">
                  <div className="h-48 relative">
                    <img src={s.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={() => setEditingSlider(s)} className="bg-white p-3 rounded-full text-slate-900 shadow-xl"><Edit size={20}/></button>
                      <button onClick={() => setSliders(sliders.filter((sl:any) => sl.id !== s.id))} className="bg-white p-3 rounded-full text-red-500 shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-black text-slate-900 text-lg">{s.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">{s.subtitle}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setEditingSlider({ title: '', subtitle: '', image: '', id: Date.now() })} className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] h-[250px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                <Plus size={32} />
                <span className="font-bold">Tambah Banner</span>
              </button>
            </div>
          )}

          {adminSubView === 'ARTIKEL' && (
            <div className="space-y-4">
              {articles.map(art => (
                <div key={art.id} className="bg-white p-4 md:p-6 rounded-[32px] border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 md:gap-6">
                    <img src={art.image} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">{art.title}</h4>
                      <p className="text-slate-400 text-[10px] md:text-xs mt-1">{art.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setEditingArticle(art)} className="flex-1 md:flex-none p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all flex justify-center"><Edit size={18}/></button>
                    <button onClick={() => setArticles(articles.filter(a => a.id !== art.id))} className="flex-1 md:flex-none p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all flex justify-center"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminSubView === 'KONTAK' && (
            <div className="max-w-2xl bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-8">Informasi Publik</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">WhatsApp Admin</label>
                  <input type="text" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email CS</label>
                  <input type="email" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Alamat Kantor</label>
                  <textarea value={contactInfo.address} onChange={e => setContactInfo({...contactInfo, address: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 h-32 border border-slate-100 resize-none" />
                </div>
                <button onClick={() => { localStorage.setItem('rjm_contact', JSON.stringify(contactInfo)); alert('Berhasil!'); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Save size={20}/> Simpan Perubahan</button>
              </div>
            </div>
          )}

          {adminSubView === 'KELOLA_ADMIN' && (
            <div className="max-w-2xl bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold">Team Management</h3>
               </div>
               <div className="divide-y divide-slate-50">
                  {users.map(u => (
                    <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">{u.name[0]}</div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate">{u.name}</p>
                          <p className="text-[10px] md:text-xs text-slate-400 truncate">{u.email} • <span className="text-indigo-600 font-bold">{u.role}</span></p>
                        </div>
                      </div>
                      {u.role !== 'MASTER_ADMIN' && (
                        <div className="flex gap-2">
                          <button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit size={16}/></button>
                          <button onClick={() => setUsers(users.filter(usr => usr.id !== u.id))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* AI Assistant FAB */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
        {isAIChatOpen && (
          <div className="w-[300px] md:w-[350px] h-[450px] md:h-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><Sparkles size={20} /></div>
                <div><h4 className="font-bold leading-none">RJM AI</h4><span className="text-[10px] opacity-70">Online</span></div>
              </div>
              <button onClick={() => setIsAIChatOpen(false)}><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-50/50">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Tanya admin RJM..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm outline-none" />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-transform"><Send size={18}/></button>
            </div>
          </div>
        )}
        <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="bg-indigo-600 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"><MessageSquare size={24} className="md:w-7 md:h-7" /></button>
      </div>

      {/* Navbar with FIXED Mobile Hamburger */}
      <nav className="fixed top-0 w-full z-[2000] bg-white/90 backdrop-blur-lg border-b border-slate-100 h-20 flex items-center justify-between px-4 md:px-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('HOME'); setIsMobileMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100 shrink-0"><CarFront size={22} /></div>
          <div className="overflow-hidden">
            <span className="text-base md:text-xl font-black text-slate-900 leading-tight block truncate">Rental Jaya Mandiri</span>
            <span className="text-[8px] md:text-[10px] text-indigo-600 font-black uppercase tracking-widest block">Premium Service</span>
          </div>
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Tips</button>
          <button onClick={() => setView(currentUser ? 'DASHBOARD' : 'LOGIN')} className="bg-indigo-600 text-white px-8 py-3 rounded-full text-xs font-black shadow-lg hover:bg-indigo-700 transition-all">
            {currentUser ? 'ADMIN PANEL' : 'LOGIN PORTAL'}
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-900 bg-slate-50 rounded-xl active:bg-slate-100 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay - FIXED LAYOUT */}
        <div className={`fixed inset-0 top-20 bg-white z-[1999] p-8 flex flex-col gap-6 md:hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
          <button onClick={() => scrollToSection('armada')} className="text-3xl font-black text-slate-900 border-b border-slate-50 pb-4 text-left">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-3xl font-black text-slate-900 border-b border-slate-50 pb-4 text-left">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-3xl font-black text-slate-900 border-b border-slate-50 pb-4 text-left">Tips Perjalanan</button>
          <button onClick={() => { setView(currentUser ? 'DASHBOARD' : 'LOGIN'); setIsMobileMenuOpen(false); }} className="bg-indigo-600 text-white w-full py-6 rounded-3xl font-black text-xl shadow-2xl mt-4 flex items-center justify-center gap-3">
             <LayoutDashboard size={24} /> {currentUser ? 'Buka Admin' : 'Login Portal'}
          </button>
          <div className="mt-auto pt-8 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Konten Premium RJM</p>
             <div className="flex justify-center gap-4 text-slate-400">
                <Phone size={18} /> <Mail size={18} /> <MapPin size={18} />
             </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative h-[80vh] md:h-[85vh] overflow-hidden flex items-center">
          {sliders.map((s:any, i:number) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 hero-gradient" />
              <div className="absolute inset-0 flex items-center px-6 md:px-12">
                <div className="max-w-7xl mx-auto w-full">
                  <div className="max-w-3xl space-y-4 md:space-y-6 fade-in">
                    <h1 className="text-4xl md:text-8xl font-black text-white leading-tight">{s.title}</h1>
                    <p className="text-lg md:text-2xl text-slate-300 font-medium">{s.subtitle}</p>
                    <button onClick={() => scrollToSection('armada')} className="bg-indigo-600 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-[28px] font-black text-base md:text-xl shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-3">Lihat Armada <ArrowRight size={22}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Keunggulan Layanan */}
        <section id="layanan" className="bg-slate-950 py-20 md:py-32 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="text-indigo-500 font-black text-xs uppercase tracking-widest">Why Choose Us</span>
                  <h2 className="text-4xl md:text-7xl font-black leading-tight">Keunggulan Layanan RJM</h2>
                </div>
                <div className="space-y-8">
                  {[
                    { title: 'Asuransi Lengkap', desc: 'Keamanan ekstra untuk setiap perjalanan Anda.' },
                    { title: 'Driver Profesional', desc: 'Sopir berpengalaman yang ramah dan tepat waktu.' },
                    { title: 'Layanan 24/7', desc: 'Dukungan darurat kapan saja Anda membutuhkannya.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 md:gap-6 items-start group">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                        <ShieldCheck size={24} className="md:w-7 md:h-7"/>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{item.title}</h4>
                        <p className="text-slate-400 leading-relaxed text-base md:text-lg">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-[4/5] rounded-[60px] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl border-8 border-white/5">
                  <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-10 right-10 bg-indigo-600 p-8 rounded-[40px] shadow-2xl text-center">
                   <p className="text-4xl font-black text-white">4.9/5</p>
                   <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Armada */}
        <section id="armada" className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="flex justify-between items-end mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black">Unit Mobil Terawat</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                <div className="h-56 md:h-72 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-indigo-600 border border-slate-100 flex items-center gap-1 shadow-sm">
                    <Star size={12} fill="currentColor"/> {car.rating} Rating
                  </div>
                </div>
                <div className="p-6 md:p-10 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black mb-1">{car.brand} {car.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{car.category} • {car.transmission}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-50 mb-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Users size={16} className="text-indigo-600" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">{car.seats} Kursi</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Shield size={16} className="text-indigo-600" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">Aman</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Clock size={16} className="text-indigo-600" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">24 Jam</span>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Mulai Dari</p>
                      <p className="text-indigo-600 text-2xl md:text-3xl font-black">{formatIDR(car.pricePerDay)}<span className="text-[10px] text-slate-400 font-medium">/hari</span></p>
                    </div>
                    <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}?text=Halo%20Admin%20RJM,%20saya%20mau%20sewa%20${car.brand}%20${car.name}`} target="_blank" className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 text-white rounded-[20px] flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-2xl">
                      <ArrowRight size={24} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Tawaran - FIXED MOBILE LAYOUT */}
        <section id="kontak" className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-20">
          <div className="bg-indigo-600 rounded-[40px] md:rounded-[80px] p-8 md:p-32 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-8 md:space-y-16">
              <h2 className="text-3xl md:text-8xl font-black text-white leading-tight max-w-5xl mx-auto">
                Sewa Kendaraan Sekarang & Dapatkan Harga Terbaik
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                <a 
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`}
                  className="bg-white text-indigo-600 px-6 py-6 md:py-8 rounded-3xl font-black text-lg md:text-2xl shadow-2xl flex items-center justify-center gap-4 hover:scale-105 transition-all"
                >
                  <Phone size={28} /> WhatsApp Admin
                </a>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="bg-indigo-500/20 text-white border-2 border-white/20 px-6 py-6 md:py-8 rounded-3xl font-black text-lg md:text-2xl backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                >
                  <Mail size={28} /> Kirim Email
                </a>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-indigo-100 font-bold px-4">
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10 w-full md:w-auto justify-center">
                  <MapPin size={22} className="shrink-0 text-white" />
                  <span className="text-sm md:text-lg">{contactInfo.address}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10 w-full md:w-auto justify-center">
                   <Clock size={22} className="shrink-0 text-white" />
                   <span className="text-sm md:text-lg">Buka 24 Jam Setiap Hari</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artikel */}
        <section id="artikel" className="bg-slate-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
             <h2 className="text-4xl md:text-6xl font-black mb-12 md:mb-20 text-center">Info & Tips Perjalanan</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                {articles.map(art => (
                  <div key={art.id} className="bg-white p-5 rounded-[40px] flex flex-col sm:flex-row gap-8 items-center shadow-sm hover:shadow-2xl transition-all group">
                    <div className="w-full sm:w-48 h-56 sm:h-48 rounded-[32px] overflow-hidden shrink-0">
                       <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 sm:pr-8 text-center sm:text-left py-2">
                      <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3">{art.date}</p>
                      <h4 className="text-xl md:text-2xl font-black leading-tight mb-4">{art.title}</h4>
                      <p className="text-slate-500 text-sm md:text-base line-clamp-3 leading-relaxed">{art.content}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* FOOTER - RE-STRUCTURED FOR MOBILE */}
        <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center space-y-10">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><CarFront size={28} /></div>
                <div>
                   <h5 className="font-black text-2xl md:text-3xl text-slate-900 leading-none">Rental Jaya Mandiri</h5>
                   <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">Premium Transport</p>
                </div>
              </div>

              {/* Address */}
              <div className="max-w-md">
                 <div className="inline-flex items-center gap-2 text-indigo-600 mb-4 px-4 py-1.5 bg-indigo-50 rounded-full text-xs font-black uppercase tracking-wider">
                    <MapPin size={14} /> Jakarta Selatan
                 </div>
                 <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                   {contactInfo.address}
                 </p>
              </div>

              {/* Contacts Stacking Properly */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-2xl">
                <a href={`tel:${contactInfo.phone}`} className="flex-1 bg-slate-50 hover:bg-slate-100 p-5 rounded-3xl font-bold text-slate-700 flex items-center justify-center gap-3 border border-slate-100 transition-all active:scale-95 overflow-hidden">
                  <Phone size={20} className="text-indigo-600 shrink-0" /> 
                  <span className="truncate">{contactInfo.phone}</span>
                </a>
                <a href={`mailto:${contactInfo.email}`} className="flex-1 bg-slate-50 hover:bg-slate-100 p-5 rounded-3xl font-bold text-slate-700 flex items-center justify-center gap-3 border border-slate-100 transition-all active:scale-95 overflow-hidden">
                  <Mail size={20} className="text-indigo-600 shrink-0" /> 
                  <span className="truncate">{contactInfo.email}</span>
                </a>
              </div>

              {/* Bottom Nav & Copyright */}
              <div className="w-full pt-16 mt-10 border-t border-slate-50 space-y-6">
                 <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                    <button onClick={() => scrollToSection('armada')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Armada</button>
                    <button onClick={() => scrollToSection('layanan')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Layanan</button>
                    <button onClick={() => setView('LOGIN')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Portal Admin</button>
                 </div>
                 <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
                   © 2024-2025 RJM • Premium Transportation Service
                 </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
