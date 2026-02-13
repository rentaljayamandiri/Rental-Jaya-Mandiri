
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
  ChevronLeft,
  ImageIcon,
  X,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  ArrowRight
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data States
  const [cars, setCars] = useState<Car[]>(() => safeJSONParse('rjm_cars', INITIAL_CARS));
  const [users, setUsers] = useState<User[]>(() => safeJSONParse('rjm_users', INITIAL_USERS));
  const [sliders, setSliders] = useState(() => safeJSONParse('rjm_sliders', SLIDER_DATA));
  const [services, setServices] = useState(() => safeJSONParse('rjm_services', [
    { id: '1', title: 'Asuransi Lengkap', desc: 'Keamanan ekstra untuk setiap perjalanan Anda.' },
    { id: '2', title: 'Driver Profesional', desc: 'Sopir berpengalaman yang ramah dan tepat waktu.' },
    { id: '3', title: 'Layanan 24/7', desc: 'Dukungan darurat kapan saja Anda membutuhkannya.' }
  ]));
  const [contactInfo, setContactInfo] = useState(() => safeJSONParse('rjm_contact', {
    phone: '+62 812-1093-2808',
    email: 'csrentaljayamandiri@gmail.com',
    address: 'Pondok Pinang VI No. 64, Jakarta, Indonesia'
  }));
  const [articles, setArticles] = useState<Article[]>(() => safeJSONParse('rjm_articles', [
    { id: '1', title: 'Tips Sewa Mobil Liburan', content: 'Pastikan Anda memilih armada yang sesuai...', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', date: '12 Feb 2024' }
  ]));

  // AI Assistant States
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya asisten AI RJM. Ada yang bisa saya bantu cari mobil hari ini?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    localStorage.setItem('rjm_cars', JSON.stringify(cars));
    localStorage.setItem('rjm_users', JSON.stringify(users));
    localStorage.setItem('rjm_sliders', JSON.stringify(sliders));
    localStorage.setItem('rjm_services', JSON.stringify(services));
    localStorage.setItem('rjm_contact', JSON.stringify(contactInfo));
    localStorage.setItem('rjm_articles', JSON.stringify(articles));
  }, [cars, users, sliders, services, contactInfo, articles]);

  useEffect(() => {
    if (view === 'HOME') {
      const interval = setInterval(() => setCurrentSlide(p => (p + 1) % sliders.length), 5000);
      return () => clearInterval(interval);
    }
  }, [view, sliders.length]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Auth & Admin Views Simplified ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-slate-200 fade-in">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"><CarFront size={32} /></div>
            <h1 className="text-3xl font-black text-slate-900">Portal RJM</h1>
            <p className="text-slate-400 mt-2">Masuk untuk mengelola sistem</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
            if(user) { setCurrentUser(user); setView('DASHBOARD'); } else { alert('Gagal Masuk'); }
          }} className="space-y-4">
            <input placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" required />
            <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" required />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">Masuk</button>
          </form>
          <button onClick={() => setView('HOME')} className="w-full mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors">Batal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
        {isAIChatOpen && (
          <div className="w-[350px] h-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><Sparkles size={20} /></div>
                <div>
                  <h4 className="font-bold leading-none">RJM AI Assistant</h4>
                  <span className="text-[10px] opacity-70">Online • Siap membantu</span>
                </div>
              </div>
              <button onClick={() => setIsAIChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tanya rekomendasi mobil..." 
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"><Send size={18}/></button>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          {isAIChatOpen ? <X size={28} /> : <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />}
          {!isAIChatOpen && <span className="absolute right-20 bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-xl border border-slate-100 whitespace-nowrap animate-bounce">Butuh rekomendasi?</span>}
        </button>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100"><CarFront size={24} /></div>
            <div>
              <span className="text-xl font-black text-slate-900 block leading-none tracking-tight">Rental Jaya Mandiri</span>
              <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest">Premium Service</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('armada')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Armada</button>
            <button onClick={() => scrollToSection('layanan')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Layanan</button>
            <button onClick={() => scrollToSection('kontak')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Kontak</button>
            <button 
              onClick={() => currentUser ? setView('DASHBOARD') : setView('LOGIN')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
            >
              {currentUser ? 'DASHBOARD' : 'LOGIN PORTAL'}
            </button>
          </div>
          <button className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0">
            {sliders.map((s:any, i:number) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
                <img src={s.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 hero-gradient" />
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
            <div className="max-w-3xl space-y-8 fade-in">
              <span className="inline-block bg-indigo-600/20 border border-indigo-400/30 text-indigo-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md">Terpercaya Sejak 2020</span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-none">
                {sliders[currentSlide].title}
              </h1>
              <p className="text-lg md:text-2xl text-slate-300 font-medium max-w-xl">
                {sliders[currentSlide].subtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={() => scrollToSection('armada')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-3">Pesan Sekarang <ArrowRight size={20}/></button>
                <button onClick={() => setIsAIChatOpen(true)} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">Tanya AI</button>
              </div>
            </div>
          </div>
        </section>

        {/* Armada Section */}
        <section id="armada" className="max-w-7xl mx-auto px-4 py-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">Armada Premium Kami</h2>
              <p className="text-slate-500 text-lg max-w-xl">Kami hanya menyediakan unit terbaru dengan kondisi prima untuk menjamin kepuasan perjalanan Anda.</p>
            </div>
            <div className="flex gap-2">
              {['All', 'MPV', 'Luxury', 'SUV'].map(cat => (
                <button key={cat} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${cat === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {cars.map(car => (
              <div key={car.id} className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="h-72 overflow-hidden relative">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-indigo-600 border border-slate-100 flex items-center gap-1"><Star size={12} fill="currentColor"/> 4.9 Rating</div>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{car.brand} {car.name}</h3>
                    <p className="text-slate-400 text-sm font-medium">{car.category} • {car.transmission}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-50">
                    <div className="text-center"><Users size={16} className="mx-auto text-slate-400 mb-1"/><span className="text-[10px] font-bold text-slate-900">{car.seats} Kursi</span></div>
                    <div className="text-center"><ShieldCheck size={16} className="mx-auto text-slate-400 mb-1"/><span className="text-[10px] font-bold text-slate-900">Terproteksi</span></div>
                    <div className="text-center"><Clock size={16} className="mx-auto text-slate-400 mb-1"/><span className="text-[10px] font-bold text-slate-900">Siap 24 Jam</span></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mulai Dari</p>
                      <p className="text-indigo-600 text-2xl font-black">{formatIDR(car.pricePerDay)}<span className="text-xs text-slate-400 font-medium">/hari</span></p>
                    </div>
                    <a 
                      href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}?text=Halo%20RJM,%20saya%20tertarik%20dengan%20${car.brand}%20${car.name}`}
                      target="_blank"
                      className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-xl"
                    >
                      <ArrowRight size={24} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Layanan Section */}
        <section id="layanan" className="bg-slate-900 py-32 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">Why Choose Us</span>
                <h2 className="text-5xl md:text-6xl font-black leading-tight">Keunggulan Layanan Rental Jaya Mandiri</h2>
                <div className="grid grid-cols-1 gap-8">
                  {services.map(s => (
                    <div key={s.id} className="flex gap-6 items-start group">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0"><ShieldCheck size={28}/></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                        <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[60px] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl border-8 border-white/5">
                  <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-indigo-600 p-10 rounded-[40px] shadow-2xl animate-bounce duration-[3000ms]">
                   <p className="text-4xl font-black text-white">4.9/5</p>
                   <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Contact Section */}
        <section id="kontak" className="max-w-7xl mx-auto px-4 py-32">
          <div className="bg-indigo-600 rounded-[60px] p-10 md:p-20 text-center relative overflow-hidden shadow-3xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-7xl font-black text-white leading-tight max-w-4xl mx-auto">Butuh Kendaraan untuk Besok? Hubungi Kami Sekarang</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <a 
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g,'')}`}
                  className="bg-white text-indigo-600 px-12 py-6 rounded-3xl font-black text-xl shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
                >
                  <Phone size={28} /> Chat WhatsApp
                </a>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="bg-indigo-500/50 text-white border border-indigo-400 px-12 py-6 rounded-3xl font-black text-xl backdrop-blur-md hover:bg-indigo-500/70 transition-all"
                >
                  Kirim Email
                </a>
              </div>
              <p className="text-indigo-100 font-medium flex items-center justify-center gap-2"><MapPin size={20}/> {contactInfo.address}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white"><CarFront size={24} /></div>
              <span className="text-2xl font-black text-slate-900">Rental Jaya Mandiri</span>
            </div>
            <p className="text-slate-500 max-w-md leading-relaxed">Penyedia jasa transportasi terkemuka di Jakarta. Kami mengutamakan kenyamanan, keamanan, dan ketepatan waktu untuk setiap pelanggan kami.</p>
          </div>
          <div>
            <h5 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Navigasi</h5>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><button onClick={() => scrollToSection('armada')} className="hover:text-indigo-600 transition-colors">Armada</button></li>
              <li><button onClick={() => scrollToSection('layanan')} className="hover:text-indigo-600 transition-colors">Layanan</button></li>
              <li><button onClick={() => scrollToSection('kontak')} className="hover:text-indigo-600 transition-colors">Kontak Kami</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Hubungi Kami</h5>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li className="flex items-center gap-2"><Phone size={16}/> {contactInfo.phone}</li>
              <li className="flex items-center gap-2 text-xs"><Mail size={16}/> {contactInfo.email}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-20 mt-20 border-t border-slate-50 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          © 2024 Rental Jaya Mandiri. All Rights Reserved. Designed for Excellence.
        </div>
      </footer>
    </div>
  );
}
