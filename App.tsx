
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
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('ARMADA');
  const [currentUser, setCurrentUser] = useState<User | null>(() => safeJSONParse('rjm_logged_user', null));
  
  // Data States
  const [cars, setCars] = useState<Car[]>(() => safeJSONParse('rjm_cars', INITIAL_CARS));
  const [users, setUsers] = useState<User[]>(() => safeJSONParse('rjm_users', INITIAL_USERS));
  const [sliders, setSliders] = useState(() => safeJSONParse('rjm_sliders', SLIDER_DATA));
  const [articles, setArticles] = useState<Article[]>(() => safeJSONParse('rjm_articles', [
    { id: '1', title: 'Kenapa Harus Rental di RJM?', content: 'Kami menjamin unit selalu bersih, wangi, dan mesin terawat. Setiap mobil melewati protokol pengecekan ketat sebelum diserahkan ke pelanggan.', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', date: '12 Feb 2024' }
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

  // Modal / Form States
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
  const [editingSlider, setEditingSlider] = useState<any | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

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
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
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

  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 md:p-10 shadow-2xl fade-in">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"><CarFront size={32} /></div>
            <h1 className="text-3xl font-black text-slate-900">Portal RJM</h1>
            <p className="text-slate-400 mt-2">Login Admin Panel</p>
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
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200">Masuk Sekarang</button>
          </form>
          <button onClick={() => setView('HOME')} className="w-full mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">Kembali Ke Beranda</button>
        </div>
      </div>
    );
  }

  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-[100]">
          <div className="p-8 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white"><CarFront size={20} /></div>
            <span className="font-black text-slate-900 tracking-tight">RJM Admin</span>
          </div>
          <nav className="flex-1 p-4 space-y-1 mt-4">
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
        <main className="flex-1 lg:ml-72 p-4 md:p-10">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{adminSubView}</h1>
            <div className="flex gap-3">
              <button onClick={() => setView('HOME')} className="hidden md:flex bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold text-sm">Lihat Web</button>
              {adminSubView === 'ARMADA' && <button onClick={() => setEditingCar({ brand: '', name: '', pricePerDay: 0, seats: 7, category: CarCategory.MPV, features: [], image: '', transmission: 'Automatic' })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"><Plus size={20}/> Tambah Mobil</button>}
              {adminSubView === 'ARTIKEL' && <button onClick={() => setEditingArticle({ title: '', content: '', image: '', date: new Date().toLocaleDateString() })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"><Plus size={20}/> Tambah Artikel</button>}
              {adminSubView === 'SLIDER' && <button onClick={() => setEditingSlider({ title: '', subtitle: '', image: '', id: Date.now() })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"><Plus size={20}/> Tambah Banner</button>}
            </div>
          </header>

          {/* Table / List View */}
          {adminSubView === 'ARMADA' && (
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th className="p-6 text-xs font-black uppercase text-slate-400">Unit</th>
                            <th className="p-6 text-xs font-black uppercase text-slate-400">Harga</th>
                            <th className="p-6 text-xs font-black uppercase text-slate-400">Aksi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {cars.map(car => (
                            <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                               <td className="p-6 flex items-center gap-4">
                                  <img src={car.image} className="w-14 h-14 rounded-xl object-cover" />
                                  <span className="font-bold text-slate-900">{car.brand} {car.name}</span>
                               </td>
                               <td className="p-6 font-bold text-indigo-600">{formatIDR(car.pricePerDay)}</td>
                               <td className="p-6">
                                  <div className="flex gap-3">
                                     <button onClick={() => setEditingCar(car)} className="p-2 bg-slate-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Edit size={18}/></button>
                                     <button onClick={() => setCars(cars.filter(c => c.id !== car.id))} className="p-2 bg-slate-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {adminSubView === 'ARTIKEL' && (
            <div className="space-y-4">
               {articles.map(art => (
                  <div key={art.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between gap-6 group hover:shadow-md transition-all">
                     <div className="flex items-center gap-6">
                        <img src={art.image} className="w-20 h-20 rounded-2xl object-cover" />
                        <div>
                           <h4 className="font-bold text-lg text-slate-900">{art.title}</h4>
                           <p className="text-slate-400 text-sm">{art.date}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setEditingArticle(art)} className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit size={20}/></button>
                        <button onClick={() => setArticles(articles.filter(a => a.id !== art.id))} className="p-3 bg-slate-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                     </div>
                  </div>
               ))}
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
            </div>
          )}

          {/* Form Modal: EDIT MOBIL */}
          {editingCar && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button onClick={() => setEditingCar(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                  <h3 className="text-3xl font-black mb-8">{editingCar.id ? 'Edit Unit Mobil' : 'Tambah Mobil Baru'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Brand Mobil</label>
                        <input value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} placeholder="Cth: Toyota" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Model</label>
                        <input value={editingCar.name} onChange={e => setEditingCar({...editingCar, name: e.target.value})} placeholder="Cth: Innova Zenix" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Harga / Hari</label>
                        <input type="number" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: parseInt(e.target.value)})} placeholder="850000" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tautan Gambar</label>
                        <input value={editingCar.image} onChange={e => setEditingCar({...editingCar, image: e.target.value})} placeholder="URL Unsplash/Image" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600" />
                     </div>
                  </div>
                  <button onClick={() => {
                    if(!editingCar.brand || !editingCar.name) return alert('Lengkapi data!');
                    if(editingCar.id) setCars(cars.map(c => c.id === editingCar.id ? editingCar as Car : c));
                    else setCars([...cars, { ...editingCar, id: Date.now().toString(), rating: 4.8, features: ['AC', 'Leather Seats'] } as Car]);
                    setEditingCar(null);
                  }} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black mt-10 hover:bg-indigo-700 shadow-xl shadow-indigo-200">Simpan Perubahan Armada</button>
               </div>
            </div>
          )}

          {/* Form Modal: EDIT ARTIKEL */}
          {editingArticle && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 md:p-10 shadow-2xl relative">
                  <button onClick={() => setEditingArticle(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                  <h3 className="text-3xl font-black mb-8">Kelola Artikel</h3>
                  <div className="space-y-6">
                     <input value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} placeholder="Judul Artikel" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600" />
                     <textarea value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} placeholder="Isi Konten" className="w-full bg-slate-50 p-4 rounded-2xl outline-none h-40 resize-none focus:ring-2 focus:ring-indigo-600" />
                     <input value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} placeholder="URL Gambar" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <button onClick={() => {
                    if(editingArticle.id) setArticles(articles.map(a => a.id === editingArticle.id ? editingArticle as Article : a));
                    else setArticles([...articles, { ...editingArticle, id: Date.now().toString(), date: new Date().toLocaleDateString() } as Article]);
                    setEditingArticle(null);
                  }} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black mt-10">Update Artikel Blog</button>
               </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  // --- PUBLIC FRONTEND VIEW ---
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-[1000] bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('HOME'); window.scrollTo({top:0, behavior:'smooth'}); }}>
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100"><CarFront size={26} /></div>
          <div className="hidden sm:block">
            <span className="text-xl font-black text-slate-900 block leading-none">Rental Jaya Mandiri</span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Premium Service</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500 hover:text-indigo-600">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-sm font-bold text-slate-500 hover:text-indigo-600">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-sm font-bold text-slate-500 hover:text-indigo-600">Tips</button>
          <button onClick={() => setView('LOGIN')} className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black hover:bg-indigo-600 transition-all uppercase tracking-widest">Login Admin</button>
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 bg-slate-50 rounded-2xl">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 top-20 bg-white z-[999] transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="p-8 flex flex-col gap-6">
          <button onClick={() => scrollToSection('armada')} className="text-4xl font-black text-slate-900 text-left">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-4xl font-black text-slate-900 text-left">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-4xl font-black text-slate-900 text-left">Tips Perjalanan</button>
          <button onClick={() => setView('LOGIN')} className="bg-indigo-600 text-white py-6 rounded-[32px] font-black text-2xl mt-4">Login Admin</button>
        </div>
      </div>

      <main className="pt-20">
        {/* Hero Slider */}
        <section className="relative h-[80vh] overflow-hidden">
          {sliders.map((s:any, i:number) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/40" />
              <div className="absolute inset-0 flex items-center px-6 md:px-20">
                <div className="max-w-4xl space-y-6 fade-in text-center md:text-left mx-auto md:mx-0">
                  <h1 className="text-5xl md:text-8xl font-black text-white leading-tight">{s.title}</h1>
                  <p className="text-xl text-slate-200 font-medium">{s.subtitle}</p>
                  <button onClick={() => scrollToSection('armada')} className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 mx-auto md:mx-0">Pesan Sekarang <ArrowRight size={24}/></button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* LAYANAN SECTION (Kembali Menampilkan Detail) */}
        <section id="layanan" className="bg-slate-950 py-24 md:py-32 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <span className="text-indigo-500 font-black text-xs uppercase tracking-widest">Premium Transportation</span>
                  <h2 className="text-5xl md:text-7xl font-black leading-tight">Keunggulan RJM</h2>
                </div>
                <div className="space-y-10">
                  {[
                    { title: 'Asuransi Penuh', desc: 'Perjalanan aman dengan perlindungan asuransi di setiap unit.', icon: ShieldCheck },
                    { title: 'Driver Berlisensi', desc: 'Sopir handal yang ramah dan paham rute wisata & bisnis.', icon: UserIcon },
                    { title: 'Layanan 24/7', desc: 'Bantuan darurat dan booking kapanpun Bosku butuh.', icon: Clock }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-8 items-start group">
                      <div className="bg-indigo-600 p-5 rounded-[28px] text-white shadow-xl shadow-indigo-900/40 group-hover:scale-110 transition-transform"><item.icon size={32}/></div>
                      <div>
                        <h4 className="text-2xl font-black mb-2">{item.title}</h4>
                        <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block relative">
                 <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" className="rounded-[60px] shadow-2xl border-4 border-white/5 relative z-10" />
                 <div className="absolute -inset-10 bg-indigo-600/20 blur-3xl rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ARMADA SECTION */}
        <section id="armada" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <h2 className="text-5xl md:text-7xl font-black mb-16 tracking-tight">Armada Terawat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                <div className="h-64 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-indigo-600 border border-slate-100 flex items-center gap-1.5 shadow-sm">
                    <Star size={14} fill="currentColor" /> {car.rating} TERBAIK
                  </div>
                </div>
                <div className="p-10 flex flex-col">
                  <h3 className="text-3xl font-black mb-2 leading-none">{car.brand} {car.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">{car.category} • {car.transmission}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Mulai Dari</span>
                      <p className="text-indigo-600 text-3xl font-black">{formatIDR(car.pricePerDay)}<span className="text-[10px] text-slate-400">/hari</span></p>
                    </div>
                    <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}?text=Halo%20Admin%20RJM,%20saya%20mau%20sewa%20${car.brand}%20${car.name}`} target="_blank" className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-xl">
                      <ArrowRight size={28} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ARTIKEL SECTION (Kembali Tampil) */}
        <section id="artikel" className="bg-slate-50 py-24 md:py-32">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                 <h2 className="text-5xl md:text-7xl font-black mb-6">Tips Wisata</h2>
                 <p className="text-slate-500 text-xl max-w-2xl mx-auto">Panduan perjalanan terbaik untuk kenyamanan Bosku selama di jalan.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {articles.map(art => (
                    <div key={art.id} className="bg-white p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row gap-8 items-center group">
                       <div className="w-full sm:w-48 h-48 rounded-[32px] overflow-hidden shrink-0">
                          <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       </div>
                       <div>
                          <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3">{art.date}</p>
                          <h4 className="text-2xl font-black mb-4 leading-tight">{art.title}</h4>
                          <p className="text-slate-500 text-sm line-clamp-2">{art.content}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-20 border-t border-slate-100">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-10">
                 <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl"><CarFront size={32} /></div>
                 <div className="text-left">
                    <h5 className="font-black text-3xl text-slate-900 leading-none">Rental Jaya Mandiri</h5>
                    <p className="text-xs text-indigo-600 font-black uppercase tracking-[0.3em] mt-2">Premium Service Jakarta</p>
                 </div>
              </div>
              <p className="text-slate-500 text-xl font-medium max-w-xl mx-auto mb-12">{contactInfo.address}</p>
              <div className="flex flex-wrap justify-center gap-4">
                 <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`} className="bg-indigo-600 text-white px-10 py-5 rounded-[28px] font-black flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"><MessageSquare size={24}/> {contactInfo.phone}</a>
                 <a href={`mailto:${contactInfo.email}`} className="bg-slate-50 text-slate-900 px-10 py-5 rounded-[28px] font-black flex items-center gap-3 hover:bg-slate-100 transition-all border border-slate-100"><Mail size={24}/> Kirim Email</a>
              </div>
              <p className="mt-16 text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">© 2024-2025 RJM • PREMIUM TRANSPORTATION SERVICES</p>
           </div>
        </footer>
      </main>

      {/* AI Button */}
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end gap-4">
        {isAIChatOpen && (
          <div className="w-[320px] md:w-[400px] h-[500px] bg-white rounded-[40px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3"><Sparkles size={20} /><h4 className="font-bold">RJM AI</h4></div>
              <button onClick={() => setIsAIChatOpen(false)}><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Tanya admin RJM..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm outline-none" />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-3 rounded-xl"><Send size={18}/></button>
            </div>
          </div>
        )}
        <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"><MessageSquare size={28} /></button>
      </div>
    </div>
  );
}
