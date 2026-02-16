
import React, { useState, useEffect } from 'react';
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
  Monitor,
  ChevronRight
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
  const [view, setView] = useState<ViewState>(() => {
    // Jika sudah login sebelumnya, langsung ke Dashboard
    const logged = safeJSONParse('rjm_logged_user', null);
    return logged ? 'DASHBOARD' : 'HOME';
  });
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

  // Global Modal States (Pastikan ini di luar subview agar tidak ter-unmount)
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
  const [editingSlider, setEditingSlider] = useState<any | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

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

  // --- MODAL COMPONENTS (DIRENDER PALING ATAS) ---
  const renderModals = () => (
    <>
      {editingCar && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setEditingCar(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
            <h3 className="text-3xl font-black mb-8 text-slate-900">{editingCar.id ? 'Edit Unit Mobil' : 'Tambah Mobil Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Brand Mobil</label>
                <input value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} placeholder="Cth: Toyota" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Model</label>
                <input value={editingCar.name} onChange={e => setEditingCar({...editingCar, name: e.target.value})} placeholder="Cth: Innova Zenix" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Harga Per Hari</label>
                <input type="number" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: parseInt(e.target.value)})} placeholder="850000" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Gambar (Link Foto)</label>
                <input value={editingCar.image} onChange={e => setEditingCar({...editingCar, image: e.target.value})} placeholder="https://..." className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
              </div>
            </div>
            <button onClick={() => {
              if(!editingCar.brand || !editingCar.name) return alert('Data tidak boleh kosong!');
              if(editingCar.id) setCars(cars.map(c => c.id === editingCar.id ? editingCar as Car : c));
              else setCars([...cars, { ...editingCar, id: Date.now().toString(), rating: 4.8, features: ['AC', 'Lengkap'] } as Car]);
              setEditingCar(null);
            }} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black mt-10 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Simpan Armada</button>
          </div>
        </div>
      )}

      {editingArticle && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl relative">
            <button onClick={() => setEditingArticle(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full"><X size={20}/></button>
            <h3 className="text-3xl font-black mb-8 text-slate-900">Kelola Artikel Blog</h3>
            <div className="space-y-6">
              <input value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} placeholder="Judul Artikel" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
              <textarea value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} placeholder="Isi Artikel..." className="w-full bg-slate-50 p-4 rounded-2xl outline-none h-48 resize-none focus:ring-2 focus:ring-indigo-600 border border-slate-100" />
              <input value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} placeholder="Link Gambar Artikel" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100" />
            </div>
            <button onClick={() => {
              if(editingArticle.id) setArticles(articles.map(a => a.id === editingArticle.id ? editingArticle as Article : a));
              else setArticles([...articles, { ...editingArticle, id: Date.now().toString(), date: new Date().toLocaleDateString() } as Article]);
              setEditingArticle(null);
            }} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black mt-10 shadow-xl transition-all">Update Artikel</button>
          </div>
        </div>
      )}
    </>
  );

  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl fade-in border border-slate-100">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200"><CarFront size={40} /></div>
            <h1 className="text-3xl font-black text-slate-900">Portal RJM</h1>
            <p className="text-slate-400 mt-2 font-medium">Layanan Dashboard Admin</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            const email = target.email.value;
            const password = target.password.value;
            const user = users.find(u => u.email === email && u.password === password);
            if(user) { setCurrentUser(user); setView('DASHBOARD'); } else { alert('Maaf, Email atau Password Salah!'); }
          }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Email Address</label>
              <input name="email" type="email" placeholder="admin@rjm.com" className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-600 font-bold" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Password</label>
              <input name="password" type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-600 font-bold" required />
            </div>
            <button className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 mt-4 transition-all">Masuk Dashboard</button>
          </form>
          <button onClick={() => setView('HOME')} className="w-full mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors">Kembali ke Website</button>
        </div>
      </div>
    );
  }

  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {renderModals()}
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-[100]">
          <div className="p-8 border-b border-slate-100 flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg"><CarFront size={22} /></div>
            <span className="font-black text-slate-900 text-xl tracking-tight">RJM Admin</span>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 mt-6">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
              { id: 'ARMADA', label: 'Unit Mobil', icon: CarIcon },
              { id: 'SLIDER', label: 'Banner Depan', icon: Monitor },
              { id: 'ARTIKEL', label: 'Artikel Blog', icon: FileText },
              { id: 'KONTAK', label: 'Info Kontak', icon: Settings },
              { id: 'KELOLA_ADMIN', label: 'User Admin', icon: UserIcon },
            ].map(item => (
              <button key={item.id} onClick={() => setAdminSubView(item.id as AdminSubView)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${adminSubView === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={22} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-100 flex flex-col gap-4">
             <button onClick={() => { if(confirm('Reset Data ke Awal?')) { localStorage.clear(); window.location.reload(); } }} className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center hover:text-red-500">Reset Local Data</button>
             <button onClick={() => { setCurrentUser(null); setView('HOME'); }} className="w-full flex items-center justify-center gap-3 py-4 rounded-[20px] text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest bg-white border border-red-100">
               <LogOut size={18} /> Keluar
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:ml-72 p-6 md:p-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{adminSubView}</h1>
            <div className="flex gap-4 w-full md:w-auto">
              <button onClick={() => setView('HOME')} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Lihat Web</button>
              {adminSubView === 'ARMADA' && <button onClick={() => setEditingCar({ brand: '', name: '', pricePerDay: 0, seats: 7, category: CarCategory.MPV, features: [], image: '', transmission: 'Automatic' })} className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"><Plus size={20}/> Tambah Mobil</button>}
              {adminSubView === 'ARTIKEL' && <button onClick={() => setEditingArticle({ title: '', content: '', image: '', date: new Date().toLocaleDateString() })} className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"><Plus size={20}/> Tambah Artikel</button>}
            </div>
          </header>

          {/* TABLE VIEW ARMADA */}
          {adminSubView === 'ARMADA' && (
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                         <tr>
                            <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Unit Mobil</th>
                            <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Harga / Hari</th>
                            <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Aksi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {cars.map(car => (
                            <tr key={car.id} className="hover:bg-slate-50/80 transition-all">
                               <td className="p-8 flex items-center gap-6">
                                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                     <img src={car.image} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-black text-slate-900 text-lg leading-tight">{car.brand} {car.name}</span>
                                     <span className="text-[10px] font-black text-indigo-600 uppercase mt-1">{car.category}</span>
                                  </div>
                               </td>
                               <td className="p-8">
                                  <span className="font-black text-indigo-600 text-lg">{formatIDR(car.pricePerDay)}</span>
                               </td>
                               <td className="p-8 text-right">
                                  <div className="inline-flex gap-2">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingCar(car); }} 
                                        className="p-4 bg-slate-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                                     >
                                        <Edit size={22} className="group-hover:scale-110 transition-transform" />
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); if(confirm('Hapus mobil ini?')) setCars(cars.filter(c => c.id !== car.id)); }} 
                                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                                     >
                                        <Trash2 size={22} className="group-hover:scale-110 transition-transform" />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* OVERVIEW SUBVIEW */}
          {adminSubView === 'OVERVIEW' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8">
                   <div className="bg-indigo-50 text-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center"><CarIcon size={32}/></div>
                   <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Unit</p><p className="text-4xl font-black text-slate-900">{cars.length}</p></div>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8">
                   <div className="bg-emerald-50 text-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center"><FileText size={32}/></div>
                   <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Artikel</p><p className="text-4xl font-black text-slate-900">{articles.length}</p></div>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8">
                   <div className="bg-amber-50 text-amber-600 w-20 h-20 rounded-3xl flex items-center justify-center"><UserIcon size={32}/></div>
                   <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pengguna</p><p className="text-4xl font-black text-slate-900">{users.length}</p></div>
                </div>
             </div>
          )}

          {adminSubView === 'ARTIKEL' && (
             <div className="space-y-6">
                {articles.map(art => (
                   <div key={art.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-center justify-between gap-8 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-8">
                         <img src={art.image} className="w-24 h-24 rounded-3xl object-cover shadow-sm" />
                         <div>
                            <h4 className="font-black text-xl text-slate-900 mb-1">{art.title}</h4>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{art.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => setEditingArticle(art)} className="p-4 bg-slate-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Edit size={22}/></button>
                         <button onClick={() => setArticles(articles.filter(a => a.id !== art.id))} className="p-4 bg-slate-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={22}/></button>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[2000] bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('HOME'); window.scrollTo({top:0, behavior:'smooth'}); }}>
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-xl shadow-indigo-100"><CarFront size={26} /></div>
          <div className="hidden sm:block">
            <span className="text-xl font-black text-slate-900 block leading-none">Rental Jaya Mandiri</span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Premium Service</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Tips Perjalanan</button>
          <button onClick={() => setView('LOGIN')} className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black hover:bg-indigo-600 transition-all uppercase tracking-[0.2em]">Login Admin</button>
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 bg-slate-50 rounded-2xl active:scale-95 transition-all text-slate-900">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 top-20 bg-white z-[1999] transition-all duration-500 origin-top ${isMobileMenuOpen ? 'translate-y-0 opacity-100 scale-y-100' : '-translate-y-full opacity-0 scale-y-0 pointer-events-none'}`}>
        <div className="p-8 flex flex-col gap-8 h-full">
          <button onClick={() => scrollToSection('armada')} className="text-5xl font-black text-slate-900 text-left tracking-tighter">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-5xl font-black text-slate-900 text-left tracking-tighter">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-5xl font-black text-slate-900 text-left tracking-tighter">Tips Info</button>
          <div className="mt-auto pb-10">
            <button onClick={() => setView('LOGIN')} className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all"><UserIcon size={28}/> Login Admin</button>
          </div>
        </div>
      </div>

      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="relative h-[85vh] overflow-hidden">
          {sliders.map((s:any, i:number) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/50" />
              <div className="absolute inset-0 flex items-center px-6 md:px-24">
                <div className="max-w-4xl space-y-8 fade-in text-center md:text-left mx-auto md:mx-0">
                  <h1 className="text-6xl md:text-9xl font-black text-white leading-tight tracking-tighter">{s.title}</h1>
                  <p className="text-xl md:text-3xl text-slate-200 font-medium">{s.subtitle}</p>
                  <button onClick={() => scrollToSection('armada')} className="bg-indigo-600 text-white px-14 py-6 rounded-[32px] font-black text-xl md:text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto md:mx-0">Mulai Sewa <ArrowRight size={32}/></button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* LAYANAN SECTION */}
        <section id="layanan" className="bg-slate-950 py-24 md:py-40 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-16">
                <div className="space-y-4">
                  <span className="text-indigo-500 font-black text-xs uppercase tracking-[0.4em]">The Best Choice</span>
                  <h2 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">Mengapa RJM?</h2>
                </div>
                <div className="space-y-12">
                  {[
                    { title: 'Full Insurance', desc: 'Setiap perjalanan Bosku dilindungi asuransi All-Risk demi ketenangan hati.', icon: ShieldCheck },
                    { title: 'VVIP Driver', desc: 'Driver terlatih, bersertifikat, dan paham rute Jabodetabek - Jawa.', icon: UserIcon },
                    { title: 'Always Ready', desc: 'Unit selalu dipanaskan dan dibersihkan 2 jam sebelum serah terima.', icon: Clock }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-10 items-start group">
                      <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-2xl shadow-indigo-900/50 group-hover:scale-110 transition-transform duration-500"><item.icon size={40}/></div>
                      <div className="flex-1">
                        <h4 className="text-3xl font-black mb-3">{item.title}</h4>
                        <p className="text-slate-400 text-xl leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block relative">
                 <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200" className="rounded-[80px] shadow-2xl border-4 border-white/5 relative z-10" />
                 <div className="absolute -inset-20 bg-indigo-600/20 blur-[100px] rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ARMADA SECTION */}
        <section id="armada" className="max-w-7xl mx-auto px-6 py-24 md:py-40">
          <h2 className="text-6xl md:text-8xl font-black mb-20 tracking-tighter text-slate-900">Armada Pilihan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-[50px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                <div className="h-72 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[24px] text-[10px] font-black uppercase text-indigo-600 border border-slate-100 flex items-center gap-2 shadow-xl">
                    <Star size={16} fill="currentColor" /> {car.rating} VIP
                  </div>
                </div>
                <div className="p-12 flex flex-col flex-1">
                  <h3 className="text-4xl font-black mb-2 leading-none text-slate-900">{car.brand} {car.name}</h3>
                  <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">{car.category} • {car.transmission}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-8 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting Price</span>
                      <p className="text-indigo-600 text-3xl font-black leading-none mt-1">{formatIDR(car.pricePerDay)}<span className="text-[10px] text-slate-400">/day</span></p>
                    </div>
                    <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}?text=Halo%20Admin%20RJM,%20saya%20ingin%20sewa%20${car.brand}%20${car.name}`} target="_blank" className="w-20 h-20 bg-slate-900 text-white rounded-[32px] flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl active:scale-90">
                      <ArrowRight size={36} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ARTIKEL SECTION */}
        <section id="artikel" className="bg-slate-50 py-24 md:py-40">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-24">
                 <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">Travel Guides</h2>
                 <p className="text-slate-500 text-2xl max-w-2xl mx-auto font-medium">Tips dan panduan perjalanan eksklusif untuk pengalaman berkendara terbaik.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {articles.map(art => (
                    <div key={art.id} className="bg-white p-10 rounded-[60px] shadow-sm hover:shadow-2xl transition-all flex flex-col xl:flex-row gap-10 items-center group">
                       <div className="w-full xl:w-64 h-64 rounded-[40px] overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                          <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                       </div>
                       <div className="flex-1">
                          <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-4">{art.date}</p>
                          <h4 className="text-3xl font-black mb-5 leading-tight text-slate-900">{art.title}</h4>
                          <p className="text-slate-500 text-lg line-clamp-2 leading-relaxed font-medium">{art.content}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white py-24 md:py-32 border-t border-slate-100">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="flex flex-col items-center gap-8 mb-16">
                 <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-2xl shadow-indigo-100"><CarFront size={48} /></div>
                 <div>
                    <h5 className="font-black text-4xl md:text-6xl text-slate-900 leading-none tracking-tighter">Rental Jaya Mandiri</h5>
                    <p className="text-xs md:text-sm text-indigo-600 font-black uppercase tracking-[0.5em] mt-4">The Premium Transportation Partner</p>
                 </div>
              </div>
              <p className="text-slate-500 text-2xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed px-4">{contactInfo.address}</p>
              <div className="flex flex-wrap justify-center gap-6">
                 <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`} className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl"><MessageSquare size={32}/> WhatsApp Admin</a>
                 <a href={`mailto:${contactInfo.email}`} className="bg-slate-50 text-slate-900 px-12 py-6 rounded-[32px] font-black flex items-center gap-4 hover:bg-slate-100 transition-all border border-slate-100 text-xl"><Mail size={32}/> Kirim Email</a>
              </div>
              <div className="mt-32 pt-16 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
                 <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.6em]">© 2024-2025 RJM GROUP • PREMIUM TRANSPORTATION SERVICES</p>
                 <div className="flex gap-12">
                    <button onClick={() => scrollToSection('armada')} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors">Fleet</button>
                    <button onClick={() => scrollToSection('layanan')} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors">Services</button>
                    <button onClick={() => scrollToSection('artikel')} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors">Guides</button>
                 </div>
              </div>
           </div>
        </footer>
      </main>

      {/* AI BUTTON & CHAT */}
      <div className="fixed bottom-10 right-10 z-[3000] flex flex-col items-end gap-6">
        {isAIChatOpen && (
          <div className="w-[350px] md:w-[450px] h-[600px] bg-white rounded-[50px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                 <div className="bg-white/20 p-2.5 rounded-2xl"><Sparkles size={24} /></div>
                 <div><h4 className="font-black text-xl leading-none">RJM AI</h4><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Assistant</span></div>
              </div>
              <button onClick={() => setIsAIChatOpen(false)} className="hover:rotate-90 transition-transform"><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 custom-scrollbar">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[28px] text-base font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">AI sedang mengetik...</div>}
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Tanya admin RJM..." className="flex-1 bg-slate-50 border-none rounded-[24px] px-6 py-4 text-base font-medium outline-none focus:ring-2 focus:ring-indigo-600" />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-[20px] shadow-xl hover:scale-105 active:scale-95 transition-all"><Send size={24}/></button>
            </div>
          </div>
        )}
        <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="bg-indigo-600 w-20 h-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group relative">
           <MessageSquare size={36} className="group-hover:rotate-12 transition-transform" />
           <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white animate-ping"></div>
        </button>
      </div>
    </div>
  );
}
