import { 
  Home, 
  Calendar, 
  Link as LinkIcon, 
  Orbit, 
  Settings, 
  Search as SearchIcon,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';

const Sidebar = () => (
  <aside className="sidebar-desktop">
    <div className="flex flex-col items-center mb-16 select-none cursor-pointer">
      <img src="/assets/logo.png" alt="UNIA" className="w-24 h-24 mb-4 object-contain" />
      <span className="text-3xl font-bold tracking-[0.2em] text-white">UNIA</span>
    </div>
    
    <nav className="flex flex-col gap-4">
      {[
        { icon: <Home size={22} />, label: 'Início', active: true },
        { icon: <Calendar size={22} />, label: 'Calendário' },
        { icon: <LinkIcon size={22} />, label: 'Conexões' },
        { icon: <Orbit size={22} />, label: 'Meu Universo' },
        { icon: <Settings size={22} />, label: 'Configurações' }
      ].map((item, index) => (
        <a 
          key={index} 
          href="#" 
          className={`nav-link ${item.active ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  </aside>
);

const Dashboard = () => {
  const navigate = useNavigate();
  
  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return { displayName: 'Usuário' };
  };

  const user = getUserData();
  const firstName = (user?.displayName || 'Usuário').split(' ')[0] || 'Usuário';

  const relationships = [
    { name: 'Dateina Fanna', type: 'Relacionamento', level: '21%', percentage: 80 },
    { name: 'Adria Ranar', type: 'Relationships', level: '31%', percentage: 85, color: '#fca5a5' },
    { name: 'Branna Noma', type: 'Relationships', level: '31%', percentage: 75, color: '#c084fc' },
    { name: 'Danie Malron', type: 'Relacionamento', level: '21%', percentage: 60 }
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-layout">
        {/* Left Column: Feed & Search */}
        <section className="flex flex-col gap-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 max-w-[500px] glass flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/5 bg-white/5">
              <SearchIcon size={20} className="text-white/30" />
              <input 
                type="text" 
                placeholder="Eaman..." 
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/30"
              />
            </div>

            <div 
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <div className="text-right">
                <p className="text-white/80 font-medium text-sm">Bom dia,</p>
                <p className="text-white font-bold">{firstName}!</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all">
                <img src="https://i.pravatar.cc/150?u=jay" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <ChevronDown size={18} className="text-white/40 group-hover:text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-8 text-white">Relacionamentos Ativos</h2>
            <div className="flex flex-col gap-4">
              {relationships.map((rel, i) => (
                <RelationshipCard key={i} {...rel} />
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Widgets */}
        <aside className="flex flex-col gap-12 pt-24 sticky top-0">
          <PillWidget />
          <AlertWidget />
        </aside>
      </main>

      <style>{`
        .mask-fade {
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
