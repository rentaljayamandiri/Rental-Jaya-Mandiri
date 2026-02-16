
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl relative z-10 fade-in">
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
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
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
        <main className="flex-1 ml-72 p-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{adminSubView}</h1>
              <p className="text-slate-400 font-medium">Panel Manajemen Konten RJM</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('HOME')} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">Lihat Web</button>
              {adminSubView === 'ARMADA' && <button onClick={() => setEditingCar({ brand: '', name: '', pricePerDay: 0, seats: 7, category: CarCategory.MPV, features: [], image: '', transmission: 'Automatic' })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"><Plus size={20}/> Unit</button>}
              {adminSubView === 'ARTIKEL' && <button onClick={() => setEditingArticle({ title: '', content: '', image: '', date: new Date().toLocaleDateString() })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"><Plus size={20}/> Artikel</button>}
              {adminSubView === 'KELOLA_ADMIN' && <button onClick={() => setEditingUser({ name: '', email: '', password: '', role: 'ADMIN' as any })} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"><Plus size={20}/> Admin</button>}
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
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className={`${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100`}><stat.icon size={32}/></div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminSubView === 'ARMADA' && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
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
              <button onClick={() => setEditingSlider({ title: '', subtitle: '', image: '', id: Date.now() })} className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] h-[300px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                <Plus size={32} />
                <span className="font-bold">Tambah Banner</span>
              </button>
            </div>
          )}

          {adminSubView === 'ARTIKEL' && (
            <div className="space-y-4">
              {articles.map(art => (
                <div key={art.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <img src={art.image} className="w-20 h-20 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900">{art.title}</h4>
                      <p className="text-slate-400 text-xs mt-1">{art.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingArticle(art)} className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => setArticles(articles.filter(a => a.id !== art.id))} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminSubView === 'KONTAK' && (
            <div className="max-w-2xl bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
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
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold">Team Management</h3>
               </div>
               <div className="divide-y divide-slate-50">
                  {users.map(u => (
                    <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">{u.name[0]}</div>
                        <div>
                          <p className="font-bold text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email} • <span className="text-indigo-600 font-bold">{u.role}</span></p>
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

          {/* --- MODALS --- */}

          {/* Modal Car */}
          {editingCar && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 fade-in shadow-2xl overflow-y-auto max-h-[90vh]">
                  <h2 className="text-2xl font-black mb-8">Informasi Unit</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Brand</label>
                      <input value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tipe</label>
                      <input value={editingCar.name} onChange={e => setEditingCar({...editingCar, name: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                      <select 
                        value={editingCar.category} 
                        onChange={e => setEditingCar({...editingCar, category: e.target.value as CarCategory})} 
                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100"
                      >
                        {Object.values(CarCategory).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Transmisi</label>
                      <select 
                        value={editingCar.transmission} 
                        onChange={e => setEditingCar({...editingCar, transmission: e.target.value as any})} 
                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                        <option value="Manual/Automatic">Manual/Automatic</option>
                      </select>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Harga Per Hari (Rp)</label>
                      <input type="number" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: parseInt(e.target.value)})} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Kursi</label>
                      <input type="number" value={editingCar.seats} onChange={e => setEditingCar({...editingCar, seats: parseInt(e.target.value)})} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">URL Gambar</label>
                      <input value={editingCar.image} onChange={e => setEditingCar({...editingCar, image: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { 
                      if(editingCar.id) setCars(cars.map(c => c.id === editingCar.id ? (editingCar as Car) : c));
                      else setCars([...cars, {...editingCar, id: Date.now().toString()} as Car]);
                      setEditingCar(null);
                    }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all">Simpan Unit</button>
                    <button onClick={() => setEditingCar(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold transition-all">Batal</button>
                  </div>
               </div>
            </div>
          )}

          {/* Modal Slider */}
          {editingSlider && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-xl rounded-[40px] p-10 fade-in shadow-2xl">
                  <h2 className="text-2xl font-black mb-8">Edit Banner Depan</h2>
                  <div className="space-y-4">
                    <input value={editingSlider.title} onChange={e => setEditingSlider({...editingSlider, title: e.target.value})} placeholder="Judul Banner" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    <input value={editingSlider.subtitle} onChange={e => setEditingSlider({...editingSlider, subtitle: e.target.value})} placeholder="Subtitle" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    <input value={editingSlider.image} onChange={e => setEditingSlider({...editingSlider, image: e.target.value})} placeholder="URL Gambar Background" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { 
                      if(sliders.find((sl:any) => sl.id === editingSlider.id)) {
                        setSliders(sliders.map((s:any) => s.id === editingSlider.id ? editingSlider : s));
                      } else {
                        setSliders([...sliders, editingSlider]);
                      }
                      setEditingSlider(null);
                    }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all">Simpan Banner</button>
                    <button onClick={() => setEditingSlider(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold transition-all">Batal</button>
                  </div>
               </div>
            </div>
          )}

          {/* Modal Artikel */}
          {editingArticle && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 fade-in shadow-2xl overflow-y-auto max-h-[90vh]">
                  <h2 className="text-2xl font-black mb-8">Tulis Artikel</h2>
                  <div className="space-y-4">
                    <input value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} placeholder="Judul Artikel" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold" />
                    <input value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} placeholder="URL Gambar Cover" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    <textarea value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} placeholder="Konten Artikel..." className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 h-64 resize-none" />
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { 
                      if(editingArticle.id) setArticles(articles.map(a => a.id === editingArticle.id ? (editingArticle as Article) : a));
                      else setArticles([{...editingArticle, id: Date.now().toString()} as Article, ...articles]);
                      setEditingArticle(null);
                    }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all">Terbitkan</button>
                    <button onClick={() => setEditingArticle(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold transition-all">Batal</button>
                  </div>
               </div>
            </div>
          )}

          {/* Modal User Admin */}
          {editingUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md rounded-[40px] p-10 fade-in shadow-2xl">
                  <h2 className="text-2xl font-black mb-8">{editingUser.id ? 'Edit Admin' : 'Admin Baru'}</h2>
                  <div className="space-y-4">
                    <input value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} placeholder="Nama Lengkap" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    <input value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} placeholder="Email Admin" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                    <input value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} placeholder="Password Baru" type="password" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100" />
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { 
                      if(editingUser.id) setUsers(users.map(u => u.id === editingUser.id ? (editingUser as User) : u));
                      else setUsers([...users, {...editingUser, id: Date.now().toString()} as User]);
                      setEditingUser(null);
                    }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all">Simpan</button>
                    <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold transition-all">Batal</button>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* AI Assistant */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
        {isAIChatOpen && (
          <div className="w-[350px] h-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><Sparkles size={20} /></div>
                <div><h4 className="font-bold leading-none">RJM AI</h4><span className="text-[10px] opacity-70">Online</span></div>
              </div>
              <button onClick={() => setIsAIChatOpen(false)}><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
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
        <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all"><MessageSquare size={28} /></button>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100"><CarFront size={24} /></div>
          <div>
            <span className="text-xl font-black text-slate-900 leading-none block">Rental Jaya Mandiri</span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Premium Service</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500">Armada</button>
          <button onClick={() => scrollToSection('layanan')} className="text-sm font-bold text-slate-500">Layanan</button>
          <button onClick={() => scrollToSection('artikel')} className="text-sm font-bold text-slate-500">Tips</button>
          <button onClick={() => setView(currentUser ? 'DASHBOARD' : 'LOGIN')} className="bg-indigo-600 text-white px-8 py-3 rounded-full text-xs font-black shadow-lg">
            {currentUser ? 'ADMIN PANEL' : 'LOGIN PORTAL'}
          </button>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative h-[85vh] overflow-hidden flex items-center">
          {sliders.map((s:any, i:number) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 hero-gradient" />
              <div className="absolute inset-0 flex items-center px-6">
                <div className="max-w-7xl mx-auto w-full">
                  <div className="max-w-2xl space-y-6 fade-in">
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-tight">{s.title}</h1>
                    <p className="text-xl text-slate-300 font-medium">{s.subtitle}</p>
                    <button onClick={() => scrollToSection('armada')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl">Lihat Armada <ArrowRight className="inline-block ml-2" size={20}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Keunggulan Layanan */}
        <section id="layanan" className="bg-slate-950 py-32 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="text-indigo-500 font-black text-xs uppercase tracking-widest">Why Choose Us</span>
                  <h2 className="text-5xl md:text-7xl font-black leading-tight">Keunggulan Layanan Rental Jaya Mandiri</h2>
                </div>
                <div className="space-y-8">
                  {[
                    { title: 'Asuransi Lengkap', desc: 'Keamanan ekstra untuk setiap perjalanan Anda.' },
                    { title: 'Driver Profesional', desc: 'Sopir berpengalaman yang ramah dan tepat waktu.' },
                    { title: 'Layanan 24/7', desc: 'Dukungan darurat kapan saja Anda membutuhkannya.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                        <ShieldCheck size={28}/>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
                        <p className="text-slate-400 leading-relaxed text-lg">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
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
        <section id="armada" className="max-w-7xl mx-auto px-6 py-32">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl font-black">Unit Mobil Terawat</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                <div className="h-64 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-indigo-600 border border-slate-100 flex items-center gap-1">
                    <Star size={12} fill="currentColor"/> 4.9 Rating
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-2xl font-black mb-1">{car.brand} {car.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{car.category} • {car.transmission}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-50 mb-6">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Users size={16} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-900">{car.seats} Kursi</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Shield size={16} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-900">Terproteksi</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-900">Siap 24 Jam</span>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Mulai Dari</p>
                      <p className="text-indigo-600 text-2xl font-black">{formatIDR(car.pricePerDay)}<span className="text-[10px] text-slate-400 font-medium">/hari</span></p>
                    </div>
                    <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}?text=Halo%20Admin%20RJM,%20saya%20mau%20sewa%20${car.brand}%20${car.name}`} target="_blank" className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-xl">
                      <ArrowRight size={24}/>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Tawaran */}
        <section id="kontak" className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-indigo-600 rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-12">
              <h2 className="text-5xl md:text-8xl font-black text-white leading-tight max-w-4xl mx-auto">
                Butuh Kendaraan untuk Besok? Hubungi Kami Sekarang
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                <a 
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`}
                  className="bg-white text-indigo-600 px-12 py-6 rounded-3xl font-black text-xl shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
                >
                  <Phone size={28} /> Chat WhatsApp
                </a>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="bg-white/10 text-white border border-white/30 px-12 py-6 rounded-3xl font-black text-xl backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  Kirim Email
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-indigo-100 font-bold">
                <MapPin size={20}/>
                <span className="text-lg">{contactInfo.address}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Artikel */}
        <section id="artikel" className="bg-slate-50 py-32">
          <div className="max-w-7xl mx-auto px-6">
             <h2 className="text-4xl font-black mb-16 text-center">Tips & Info Perjalanan</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {articles.map(art => (
                  <div key={art.id} className="bg-white p-4 rounded-[40px] flex gap-6 items-center shadow-sm hover:shadow-xl transition-all">
                    <img src={art.image} className="w-40 h-40 rounded-[32px] object-cover" />
                    <div className="flex-1 pr-6">
                      <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">{art.date}</p>
                      <h4 className="text-xl font-black leading-snug mb-3">{art.title}</h4>
                      <p className="text-slate-500 text-sm line-clamp-2">{art.content}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <footer className="bg-white py-20 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
            <h5 className="font-black text-2xl">Rental Jaya Mandiri</h5>
            <p className="text-slate-500 max-w-lg mx-auto">{contactInfo.address}</p>
            <div className="flex justify-center gap-4">
              <span className="bg-slate-100 px-6 py-2 rounded-full font-bold text-sm tracking-tight">{contactInfo.phone}</span>
              <span className="bg-slate-100 px-6 py-2 rounded-full font-bold text-sm tracking-tight">{contactInfo.email}</span>
            </div>
            <p className="pt-10 text-[10px] text-slate-400 font-black uppercase tracking-widest">© 2024 RJM • Premium Transportation Service</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
