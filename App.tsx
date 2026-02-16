
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
  ChevronRight,
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  CloudCheck,
  Search,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_CARS, INITIAL_USERS, SLIDER_DATA } from './constants';
import { Car, CarCategory, ViewState, User, AdminSubView, Article, ChatMessage } from './types';
import { getCarRecommendation } from './geminiService';
import { dbService } from './dbService';

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
    const logged = safeJSONParse('rjm_logged_user', null);
    return logged ? 'DASHBOARD' : 'HOME';
  });
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('OVERVIEW');
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
  const [importString, setImportString] = useState('');

  // Global Modal States
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);

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
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
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

  const handleImport = () => {
    if(!importString) return alert("Masukkan kode backup dulu, Bosku!");
    const success = dbService.importAllData(importString);
    if(success) {
      alert("Data berhasil dipindahkan! Halaman akan dimuat ulang.");
      window.location.reload();
    } else {
      alert("Kode backup tidak valid!");
    }
  };

  const renderModals = () => (
    <>
      {editingCar && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setEditingCar(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
            <h3 className="text-3xl font-black mb-8 text-slate-900 tracking-tighter">Unit Mobil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Brand</label>
                <input value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} placeholder="Toyota / Mitsubishi" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-600 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Model</label>
                <input value={editingCar.name} onChange={e => setEditingCar({...editingCar, name: e.target.value})} placeholder="Innova Zenix / Alphard" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-600 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Harga Harian</label>
                <input type="number" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: parseInt(e.target.value)})} placeholder="950000" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-600 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">URL Gambar</label>
                <input value={editingCar.image} onChange={e => setEditingCar({...editingCar, image: e.target.value})} placeholder="https://images.unsplash..." className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-600 transition-all font-bold" />
              </div>
            </div>
            <button onClick={() => {
              if(editingCar.id) setCars(cars.map(c => c.id === editingCar.id ? editingCar as Car : c));
              else setCars([...cars, { ...editingCar, id: Date.now().toString(), rating: 4.8 } as Car]);
              setEditingCar(null);
            }} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black mt-10 shadow-xl hover:bg-indigo-700 transition-all">Simpan Armada</button>
          </div>
        </div>
      )}
    </>
  );

  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 animate-slide-up">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-600/20"><CarFront size={40} /></div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">RJM Admin</h1>
            <p className="text-slate-400 font-medium">Portal Manajemen Web</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            const email = target.email.value;
            const password = target.password.value;
            const user = users.find(u => u.email === email && u.password === password);
            if(user) { setCurrentUser(user); setView('DASHBOARD'); } else { alert('Akses Ditolak!'); }
          }} className="space-y-4">
            <input name="email" type="email" placeholder="Email Admin" className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" required />
            <input name="password" type="password" placeholder="Password" className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" required />
            <button className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Buka Dashboard</button>
          </form>
          <button onClick={() => setView('HOME')} className="w-full mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-indigo-600 transition-colors">Batal</button>
        </div>
      </div>
    );
  }

  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {renderModals()}
        <aside className="hidden lg:flex w-72 bg-slate-900 flex-col fixed inset-y-0 z-[100] text-white">
          <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl"><CarFront size={22} /></div>
            <span className="font-black text-xl tracking-tighter">RJM Cloud</span>
          </div>
          <nav className="flex-1 p-6 space-y-1.5 mt-4">
            {[
              { id: 'OVERVIEW', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'ARMADA', label: 'Unit Mobil', icon: CarIcon },
              { id: 'DATABASE', label: 'Sinkron Data', icon: Database },
              { id: 'KONTAK', label: 'Pengaturan', icon: Settings },
            ].map(item => (
              <button key={item.id} onClick={() => setAdminSubView(item.id as AdminSubView)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${adminSubView === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-white/5">
             <button onClick={() => { setCurrentUser(null); setView('HOME'); }} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all">
               <LogOut size={18} /> Keluar
             </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-72 p-6 md:p-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{adminSubView}</h1>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                <CheckCircle2 size={12}/> Virtual Database Active
              </div>
            </div>
            {adminSubView === 'ARMADA' && <button onClick={() => setEditingCar({ brand: '', name: '', pricePerDay: 0, image: '' })} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all"><Plus size={20}/> Tambah Unit</button>}
          </header>

          {adminSubView === 'ARMADA' && (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {cars.map(car => (
                   <div key={car.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl transition-all">
                      <div className="h-48 rounded-3xl overflow-hidden mb-6 relative">
                        <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active</div>
                      </div>
                      <h4 className="font-black text-xl text-slate-900 tracking-tighter">{car.brand} {car.name}</h4>
                      <p className="text-indigo-600 font-black text-lg mb-6">{formatIDR(car.pricePerDay)}<span className="text-xs text-slate-400">/day</span></p>
                      <div className="mt-auto pt-6 border-t border-slate-50 flex gap-2">
                         <button onClick={() => setEditingCar(car)} className="flex-1 bg-slate-50 text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 tracking-widest">Edit</button>
                         <button onClick={() => { if(confirm('Hapus unit ini?')) setCars(cars.filter(c => c.id !== car.id)); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {adminSubView === 'DATABASE' && (
             <div className="max-w-4xl space-y-10">
                <div className="bg-slate-900 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                     <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase">Sync Cloud Engine</h3>
                     <p className="text-slate-400 font-medium mb-12 max-w-lg">Gunakan fitur ini untuk memindahkan data antar domain. Tanpa perlu server backend, data Bosku tetap aman dalam bentuk kode terenkripsi.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <button onClick={() => {
                          const backup = dbService.exportAllData();
                          navigator.clipboard.writeText(backup);
                          alert("SUCCESS: Database string copied to clipboard! Paste it on your other site.");
                       }} className="bg-indigo-600 text-white px-8 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">
                         <Download size={20}/> Generate Sync Key
                       </button>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
                         <CloudCheck className="text-emerald-400" />
                         <div><p className="text-[10px] font-black text-slate-500 uppercase">Local Storage</p><p className="text-xs font-bold">Synchronized</p></div>
                       </div>
                     </div>
                   </div>
                   <Database className="absolute -bottom-20 -right-20 text-white/5 w-96 h-96" />
                </div>

                <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                   <div className="flex items-center gap-4">
                     <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><Upload size={24}/></div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Restore / Cloud Import</h3>
                   </div>
                   <textarea value={importString} onChange={e => setImportString(e.target.value)} placeholder="Paste your RJM Sync Key here..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 h-48 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-600 transition-all" />
                   <button onClick={handleImport} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-700 transition-all">
                     <RefreshCw size={20}/> Run Database Sync
                   </button>
                </div>
             </div>
          )}

          {adminSubView === 'OVERVIEW' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                   <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mb-6"><CarIcon size={28}/></div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Armada Unit</p>
                   <p className="text-5xl font-black text-slate-900 tracking-tighter mt-2">{cars.length}</p>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                   <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-3xl flex items-center justify-center mb-6"><CloudCheck size={28}/></div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status Engine</p>
                   <p className="text-5xl font-black text-emerald-600 tracking-tighter mt-2">Ready</p>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                   <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-3xl flex items-center justify-center mb-6"><HardDrive size={28}/></div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Storage Type</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tighter mt-4">Local/Cloud</p>
                </div>
             </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-[2000] bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('HOME'); window.scrollTo({top:0, behavior:'smooth'}); }}>
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-xl shadow-indigo-100"><CarFront size={26} /></div>
          <div>
            <span className="text-xl font-black text-slate-900 block leading-none tracking-tighter">Rental Jaya Mandiri</span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Professional Rental</span>
          </div>
        </div>
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Armada Kami</button>
          <button onClick={() => setView('LOGIN')} className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black hover:bg-indigo-600 transition-all uppercase tracking-widest">Admin</button>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-900 p-2"><Menu size={28}/></button>
      </nav>

      <main className="pt-20">
        <section className="relative h-[85vh] overflow-hidden">
          {sliders.map((s:any, i:number) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="absolute inset-0 flex items-center px-6 md:px-24">
                <div className="max-w-4xl space-y-8 animate-slide-up text-center md:text-left mx-auto md:mx-0">
                  <h1 className="text-6xl md:text-9xl font-black text-white leading-tight tracking-tighter uppercase">{s.title}</h1>
                  <p className="text-xl md:text-3xl text-slate-200 font-medium">{s.subtitle}</p>
                  <button onClick={() => scrollToSection('armada')} className="bg-indigo-600 text-white px-12 py-5 rounded-[32px] font-black text-xl md:text-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 mx-auto md:mx-0">Sewa Sekarang <ArrowRight size={32}/></button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section id="armada" className="max-w-7xl mx-auto px-6 py-24 md:py-40">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase">Premium Fleet</h2>
            <p className="text-slate-400 font-medium max-w-sm">Daftar unit mobil terbaru kami yang selalu siap menemani perjalanan Bosku.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-[50px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                <div className="h-72 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[24px] text-[10px] font-black text-indigo-600 flex items-center gap-2 shadow-xl uppercase">
                    <Star size={16} fill="currentColor" /> {car.rating} VIP
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <h3 className="text-4xl font-black mb-2 leading-none text-slate-900 tracking-tighter">{car.brand} {car.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-10">{car.category}</p>
                  <div className="flex justify-between items-center mt-auto pt-8 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sewa Mulai</span>
                      <p className="text-indigo-600 text-3xl font-black leading-none mt-1">{formatIDR(car.pricePerDay)}<span className="text-[10px] text-slate-400">/hr</span></p>
                    </div>
                    <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}?text=Halo%20Admin%20RJM,%20saya%20ingin%20sewa%20${car.brand}%20${car.name}`} target="_blank" className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 text-white rounded-[28px] md:rounded-[32px] flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl active:scale-90">
                      <ArrowRight size={32} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="bg-slate-950 py-32 text-center text-white relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col items-center gap-8 mb-16">
                 <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-600/30"><CarFront size={48} /></div>
                 <div>
                    <h5 className="font-black text-4xl md:text-7xl leading-none tracking-tighter uppercase">Rental Jaya Mandiri</h5>
                    <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.6em] mt-6">Premium Transportation Partner</p>
                 </div>
              </div>
              <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto mb-20 leading-relaxed italic">"Perjalanan Anda, Prioritas Utama Kami."</p>
              <div className="flex flex-wrap justify-center gap-8">
                 <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`} className="bg-indigo-600 text-white px-12 py-6 rounded-[40px] font-black flex items-center gap-4 shadow-2xl text-xl hover:scale-105 transition-all"><MessageSquare size={28}/> Booking Via WhatsApp</a>
              </div>
              <div className="mt-40 pt-16 border-t border-white/5 flex flex-col items-center gap-4">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.8em]">© 2024-2025 RJM GROUP • PRO SERVICES</p>
              </div>
           </div>
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent"></div>
        </footer>
      </main>

      {/* AI CHAT */}
      <div className="fixed bottom-10 right-10 z-[3000] flex flex-col items-end gap-6">
        {isAIChatOpen && (
          <div className="w-[350px] md:w-[450px] h-[600px] bg-white rounded-[50px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-slide-up">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                 <div className="bg-white/20 p-2.5 rounded-2xl animate-pulse"><Sparkles size={24} /></div>
                 <div><h4 className="font-black text-xl leading-none tracking-tighter">RJM AI</h4><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Concierge</span></div>
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
              {isTyping && <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse pl-2">AI sedang mencari armada...</div>}
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Tanya tentang unit..." className="flex-1 bg-slate-50 border-none rounded-[24px] px-6 py-4 text-base font-medium outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-[20px] shadow-xl hover:scale-105 active:scale-95 transition-all"><Send size={24}/></button>
            </div>
          </div>
        )}
        <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="bg-indigo-600 w-20 h-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group relative">
           <MessageSquare size={36} className="group-hover:rotate-12 transition-transform" />
           <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white"></div>
        </button>
      </div>
    </div>
  );
}
