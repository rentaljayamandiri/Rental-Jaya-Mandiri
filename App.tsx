
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
  HardDrive
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
  const [importString, setImportString] = useState('');

  // Global Modal States
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
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
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setEditingCar(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full"><X size={20}/></button>
            <h3 className="text-3xl font-black mb-8 text-slate-900">{editingCar.id ? 'Edit Unit Mobil' : 'Tambah Mobil Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} placeholder="Brand" className="bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100" />
              <input value={editingCar.name} onChange={e => setEditingCar({...editingCar, name: e.target.value})} placeholder="Model" className="bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100" />
              <input type="number" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: parseInt(e.target.value)})} placeholder="Harga" className="bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100" />
              <input value={editingCar.image} onChange={e => setEditingCar({...editingCar, image: e.target.value})} placeholder="URL Gambar" className="bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100" />
            </div>
            <button onClick={() => {
              if(editingCar.id) setCars(cars.map(c => c.id === editingCar.id ? editingCar as Car : c));
              else setCars([...cars, { ...editingCar, id: Date.now().toString(), rating: 4.8 } as Car]);
              setEditingCar(null);
            }} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black mt-10">Simpan Armada</button>
          </div>
        </div>
      )}
    </>
  );

  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl"><CarFront size={40} /></div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">RJM Admin</h1>
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
            <input name="email" type="email" placeholder="Email Admin" className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 font-bold outline-none" required />
            <input name="password" type="password" placeholder="Password" className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 font-bold outline-none" required />
            <button className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black shadow-xl hover:bg-indigo-700 transition-all">Buka Dashboard</button>
          </form>
          <button onClick={() => setView('HOME')} className="w-full mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Batal</button>
        </div>
      </div>
    );
  }

  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {renderModals()}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-[100]">
          <div className="p-8 border-b border-slate-100 flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl text-white"><CarFront size={22} /></div>
            <span className="font-black text-slate-900 text-xl tracking-tighter">RJM Portal</span>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 mt-6 overflow-y-auto custom-scrollbar">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
              { id: 'ARMADA', label: 'Unit Mobil', icon: CarIcon },
              { id: 'ARTIKEL', label: 'Artikel Blog', icon: FileText },
              { id: 'KONTAK', label: 'Info Kontak', icon: Settings },
              { id: 'DATABASE', label: 'Sinkron Data', icon: Database },
            ].map(item => (
              <button key={item.id} onClick={() => setAdminSubView(item.id as AdminSubView)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${adminSubView === item.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={22} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-100">
             <button onClick={() => { setCurrentUser(null); setView('HOME'); }} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-red-500 font-black text-xs uppercase bg-red-50">
               <LogOut size={18} /> Keluar
             </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-72 p-6 md:p-12">
          <header className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{adminSubView}</h1>
            {adminSubView === 'ARMADA' && <button onClick={() => setEditingCar({ brand: '', name: '', pricePerDay: 0, image: '' })} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl"><Plus size={20}/> Unit Baru</button>}
          </header>

          {adminSubView === 'ARMADA' && (
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                         <th className="p-8 text-[10px] font-black uppercase text-slate-400">Unit</th>
                         <th className="p-8 text-[10px] font-black uppercase text-slate-400">Harga</th>
                         <th className="p-8 text-[10px] font-black uppercase text-slate-400 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {cars.map(car => (
                         <tr key={car.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-8 flex items-center gap-6">
                               <img src={car.image} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                               <span className="font-black text-slate-900 text-lg">{car.brand} {car.name}</span>
                            </td>
                            <td className="p-8 font-black text-indigo-600">{formatIDR(car.pricePerDay)}</td>
                            <td className="p-8 text-right">
                               <div className="inline-flex gap-2">
                                  <button onClick={() => setEditingCar(car)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit size={18}/></button>
                                  <button onClick={() => { if(confirm('Hapus?')) setCars(cars.filter(c => c.id !== car.id)); }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {adminSubView === 'DATABASE' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                   <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4"><Download size={32}/></div>
                   <h3 className="text-2xl font-black text-slate-900">Ekspor Data (Backup)</h3>
                   <p className="text-slate-500 text-sm">Gunakan fitur ini di web lama untuk menyalin semua armada dan artikel.</p>
                   <button onClick={() => {
                     const backup = dbService.exportAllData();
                     navigator.clipboard.writeText(backup);
                     alert("Kode backup sudah disalin ke clipboard! Sekarang buka web baru dan tempel di bagian Impor.");
                   }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3">
                     <Save size={20}/> Salin Kode Backup
                   </button>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                   <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4"><Upload size={32}/></div>
                   <h3 className="text-2xl font-black text-slate-900">Impor Data (Restore)</h3>
                   <p className="text-slate-500 text-sm">Tempel kode backup dari web lama di sini untuk memindahkan data secara instan.</p>
                   <textarea value={importString} onChange={e => setImportString(e.target.value)} placeholder="Tempel kode di sini..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-600" />
                   <button onClick={handleImport} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3">
                     <RefreshCw size={20}/> Jalankan Sinkronisasi
                   </button>
                </div>

                <div className="md:col-span-2 bg-red-50 p-10 rounded-[40px] border border-red-100 space-y-4">
                   <h4 className="font-black text-red-600 uppercase flex items-center gap-2"><HardDrive size={18}/> Zona Berbahaya</h4>
                   <p className="text-red-400 text-sm font-medium">Fitur ini akan menghapus semua data yang ada dan mengembalikan web ke pengaturan awal.</p>
                   <button onClick={() => { if(confirm("Hapus semua data permanen?")) dbService.resetToDefault(); }} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase">Reset Semua Data</button>
                </div>
             </div>
          )}

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
                   <div className="bg-amber-50 text-amber-600 w-20 h-20 rounded-3xl flex items-center justify-center"><Database size={32}/></div>
                   <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status Data</p><p className="text-xl font-black text-emerald-600">Terhubung</p></div>
                </div>
             </div>
          )}
        </main>
      </div>
    );
  }

  // --- PUBLIC FRONTEND (Tetap Premium) ---
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-[2000] bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('HOME'); window.scrollTo({top:0, behavior:'smooth'}); }}>
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-xl shadow-indigo-100"><CarFront size={26} /></div>
          <div>
            <span className="text-xl font-black text-slate-900 block leading-none tracking-tighter">Rental Jaya Mandiri</span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Premium Service</span>
          </div>
        </div>
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Layanan</button>
          <button onClick={() => setView('LOGIN')} className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black hover:bg-indigo-600 transition-all uppercase tracking-widest">Login Admin</button>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative h-[85vh] overflow-hidden">
          {sliders.map((s:any, i:number) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/60" />
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

        <section id="layanan" className="bg-slate-950 py-24 md:py-40 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-16">
                <div className="space-y-4">
                  <span className="text-indigo-500 font-black text-xs uppercase tracking-[0.4em]">Premium Choice</span>
                  <h2 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">Kenapa RJM?</h2>
                </div>
                <div className="space-y-12">
                  {[
                    { title: 'Asuransi Penuh', desc: 'Perjalanan aman dengan perlindungan asuransi All-Risk.', icon: ShieldCheck },
                    { title: 'Driver Profesional', desc: 'Sopir handal yang paham rute dan sangat sopan.', icon: UserIcon },
                    { title: 'Armada Terbaru', desc: 'Unit selalu diperbarui setiap 2 tahun sekali.', icon: Clock }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-10 items-start group">
                      <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-2xl group-hover:scale-110 transition-transform"><item.icon size={40}/></div>
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

        <section id="armada" className="max-w-7xl mx-auto px-6 py-24 md:py-40">
          <h2 className="text-6xl md:text-8xl font-black mb-20 tracking-tighter text-slate-900">Armada Pilihan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-[50px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                <div className="h-72 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[24px] text-[10px] font-black text-indigo-600 flex items-center gap-2 shadow-xl">
                    <Star size={16} fill="currentColor" /> {car.rating} VIP
                  </div>
                </div>
                <div className="p-12 flex flex-col flex-1">
                  <h3 className="text-4xl font-black mb-2 leading-none text-slate-900">{car.brand} {car.name}</h3>
                  <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">{car.category}</p>
                  <div className="flex justify-between items-center mt-auto pt-8 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Starting Price</span>
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

        <footer className="bg-white py-24 border-t border-slate-100 text-center">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col items-center gap-8 mb-16">
                 <div className="bg-indigo-600 p-5 rounded-3xl text-white"><CarFront size={48} /></div>
                 <div>
                    <h5 className="font-black text-4xl md:text-6xl text-slate-900 leading-none tracking-tighter">Rental Jaya Mandiri</h5>
                    <p className="text-xs text-indigo-600 font-black uppercase tracking-[0.5em] mt-4">Premium Transportation Partner</p>
                 </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                 <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`} className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black flex items-center gap-4 shadow-2xl text-xl hover:scale-105 transition-all"><MessageSquare size={32}/> Chat WhatsApp</a>
              </div>
              <p className="mt-32 text-[10px] text-slate-300 font-black uppercase tracking-[0.6em]">© 2024-2025 RJM GROUP • PREMIUM SERVICES</p>
           </div>
        </footer>
      </main>

      <div className="fixed bottom-10 right-10 z-[3000] flex flex-col items-end gap-6">
        {isAIChatOpen && (
          <div className="w-[350px] md:w-[450px] h-[600px] bg-white rounded-[50px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                 <div className="bg-white/20 p-2.5 rounded-2xl"><Sparkles size={24} /></div>
                 <div><h4 className="font-black text-xl leading-none">RJM AI</h4><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Assistant</span></div>
              </div>
              <button onClick={() => setIsAIChatOpen(false)}><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 custom-scrollbar">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[28px] text-base font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Berpikir...</div>}
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Cari mobil apa Bosku?" className="flex-1 bg-slate-50 border-none rounded-[24px] px-6 py-4 text-base font-medium outline-none" />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-[20px] shadow-xl"><Send size={24}/></button>
            </div>
          </div>
        )}
        <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="bg-indigo-600 w-20 h-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group">
           <MessageSquare size={36} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
}
