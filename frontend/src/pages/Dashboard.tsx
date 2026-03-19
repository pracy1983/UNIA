import { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Link as LinkIcon, 
  Orbit, 
  Settings, 
  Search as SearchIcon,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Início');
  const [showSoon, setShowSoon] = useState(false);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const u = JSON.parse(storedUser);
        return u;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return { displayName: 'Beatriz' };
  };

  const user = getUserData();
  const firstName = (user?.displayName || 'Beatriz').split(' ')[0];

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const response = await axios.get('/api/dashboard/relationships');
        setRelationships(response.data);
      } catch (err) {
        console.error('Error fetching relationships:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelationships();
  }, []);

  const menuItems = [
    { icon: <Home size={22} />, label: 'Início' },
    { icon: <Calendar size={22} />, label: 'Calendário' },
    { icon: <LinkIcon size={22} />, label: 'Conexões' },
    { icon: <Orbit size={22} />, label: 'Meu Universo' },
    { icon: <Settings size={22} />, label: 'Configurações' }
  ];

  const handleMenuClick = (label: string) => {
    if (label === 'Início') {
      setActiveTab(label);
      setShowSoon(false);
    } else {
      setActiveTab(label);
      setShowSoon(true);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Sidebar */}
      <aside className="sidebar-desktop !rounded-[32px] !m-6 !h-[calc(100vh-48px)] glass !flex-shrink-0">
        <div className="flex flex-col items-center mb-16 select-none mt-4">
          <img src="/assets/logo.png" alt="UNIA" className="w-24 h-24 mb-4 object-contain" />
          <span className="text-3xl font-bold tracking-[0.2em] text-white">UNIA</span>
        </div>
        
        <nav className="flex flex-col gap-4 px-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button 
              key={item.label}
              onClick={() => handleMenuClick(item.label)}
              className={`nav-link w-full border-none bg-transparent cursor-pointer ${activeTab === item.label ? 'active' : ''}`}
            >
              {item.icon}
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 flex flex-col gap-10 overflow-y-auto">
        <header className="flex items-center justify-between gap-12">
          <div className="flex-1 max-w-[650px]">
            <div className="glass flex items-center gap-4 px-6 py-4 rounded-full border border-white/10 bg-white/5">
              <SearchIcon size={22} className="text-white/30" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/30 text-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="glass flex items-center gap-4 px-6 py-2 rounded-2xl border border-white/10">
              <span className="text-white/80 font-medium text-lg whitespace-nowrap">Olá, <span className="text-white font-bold">{firstName}!</span></span>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <img src={`https://i.pravatar.cc/150?u=${firstName}`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <button className="glass w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0">
              <Bell size={24} className="text-white/80" />
            </button>
          </div>
        </header>

        {showSoon ? (
          <div className="flex-1 glass rounded-[40px] flex items-center justify-center border border-white/10 min-h-[400px]">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Em Breve</h1>
              <p className="text-white/50 text-xl">Esta página ({activeTab}) ainda está em construção.</p>
              <button 
                onClick={() => { setActiveTab('Início'); setShowSoon(false); }}
                className="mt-8 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all cursor-pointer"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Relationships Section */}
            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-bold text-white">Relacionamentos Ativos</h2>
                <button className="text-white/40 hover:text-white text-lg font-medium transition-all bg-transparent border-none cursor-pointer">Ver todos</button>
              </div>
              
              {!loading && relationships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relationships.map((rel, i) => (
                    <RelationshipCard key={i} {...rel} />
                  ))}
                </div>
              ) : (
                <div className="glass p-12 rounded-3xl text-center border border-white/10 border-dashed">
                  <p className="text-white/30 text-lg">Sem relacionamentos ativos cadastrados ainda.</p>
                </div>
              )}
            </section>

            {/* Bottom Widgets Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <PillWidget />
              <AlertWidget />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
