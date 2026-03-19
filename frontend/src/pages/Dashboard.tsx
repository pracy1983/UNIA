import React from 'react';
import { 
  Home, 
  Calendar, 
  Link as LinkIcon, 
  Orbit, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  Sparkles,
  Search as SearchIcon,
  LogOut,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UniaLogo = () => (
  <div className="logo-rings mb-12 px-4 select-none">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="20" r="10" stroke="url(#logo_grad)" strokeWidth="3" />
      <circle cx="25" cy="20" r="10" stroke="url(#logo_grad)" strokeWidth="3" />
      <defs>
        <linearGradient id="logo_grad" x1="5" y1="10" x2="35" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBB2D" />
          <stop offset="1" stopColor="#FF7E5F" />
        </linearGradient>
      </defs>
    </svg>
    <span style={{ color: '#F3F4F6' }}>UNIA</span>
  </div>
);

const RelationshipCard = ({ name, level, percentage, secondaryAvatar = null }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass glass-hover p-6 rounded-[24px] min-w-[280px] flex flex-col gap-4"
  >
    <div className="flex items-center gap-4">
      <div className="relative flex -space-x-2">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-surface-light flex items-center justify-center text-xs">
          {name.charAt(0)}
        </div>
        {secondaryAvatar && (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-surface-light flex items-center justify-center text-xs">
            {secondaryAvatar.charAt(0)}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">Nível {level} - {percentage}%</p>
      </div>
    </div>
    <div className="progress-container mt-2">
      <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar Sidebar */}
      <aside className="sidebar border-r border-white/5">
        <UniaLogo />
        
        <nav className="flex flex-col gap-2">
          <a href="#" className="nav-item active">
            <Home size={22} />
            <span>Início</span>
          </a>
          <a href="#" className="nav-item">
            <Calendar size={22} />
            <span>Calendário</span>
          </a>
          <a href="#" className="nav-item">
            <LinkIcon size={22} />
            <span>Conexões</span>
          </a>
          <a href="#" className="nav-item">
            <Orbit size={22} />
            <span>Meu Universo</span>
          </a>
          <a href="#" className="nav-item">
            <Settings size={22} />
            <span>Configurações</span>
          </a>
        </nav>

        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            className="nav-item w-full bg-transparent border-none cursor-pointer"
          >
            <LogOut size={22} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Main */}
      <main className="main-content">
        {/* Header Header */}
        <header className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl px-4">
            <div className="glass flex items-center gap-3 px-6 py-3 rounded-full border border-white/10">
              <SearchIcon size={20} className="text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="glass flex items-center gap-3 px-4 py-2 rounded-full border border-white/10">
              <span className="text-sm font-medium">Olá, <span className="font-bold">{user.displayName || 'Beatriz'}</span>!</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-white/20">
                <User size={16} />
              </div>
            </div>
            <button className="glass w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 transition-all">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Relacionamentos section Relacionamentos section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Relacionamentos Ativos</h2>
            <button className="text-sm text-primary font-medium hover:underline">Ver todos</button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 mask-fade">
            <RelationshipCard name="Pedro" level="8" percentage={32} />
            <RelationshipCard name="Sofia & Ana" level="3" percentage={47} secondaryAvatar="A" />
            <RelationshipCard name="Lucas" level="7" percentage={50} />
          </div>
        </section>

        {/* Widgets Grid section Widgets Grid section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Pílula do Dia Widget Pílula do Dia Widget */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-[32px] border border-white/10"
          >
            <h3 className="text-lg font-semibold mb-6">Pílula do Dia</h3>
            <p className="text-muted-foreground mb-8 text-center px-4">Como foi sua conexão com Sofia hoje?</p>
            
            <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
              <button 
                onClick={() => navigate('/onboarding')}
                className="btn-pill w-full bg-white/5 border-white/20 hover:bg-white/10 py-3 text-center"
              >
                Excelente
              </button>
              <button className="btn-pill w-full border-white/10 hover:bg-white/5 py-3 text-center">
                Normal
              </button>
              <button className="btn-pill w-full border-white/10 hover:bg-white/5 py-3 text-center">
                Melhorável
              </button>
            </div>
          </motion.div>

          {/* AI Insight Widget AI Insight Widget */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass p-8 rounded-[32px] border border-white/10 relative overflow-hidden group shadow-[0_0_50px_rgba(255,126,95,0.05)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center border border-primary/20">
                <Sparkles size={24} className="text-primary" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">Alerta UNIA: Previsão de Conexão Profunda!</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Sugerimos um encontro com Pedro neste fim de semana.
                </p>
              </div>

              <button className="btn-pill bg-white/5 border-white/20 hover:bg-white/10 px-8 py-3 font-semibold mt-4">
                Ver Detalhes
              </button>
            </div>
          </motion.div>

        </section>

        {/* Floating Action Button (FAB) Floating Action Button (FAB) */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 z-50 text-white cursor-pointer"
        >
          <Plus size={32} />
        </motion.button>
      </main>

      {/* Styled JSX for utility grid from old CSS */}
      <style>{`
        .mask-fade {
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .text-2xl { font-size: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .font-bold { font-weight: 700; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .flex-1 { flex: 1 1 0%; }
        .flex-col { flex-direction: column; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .rounded-full { border-radius: 9999px; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-12 { margin-bottom: 3rem; }
        .max-w-xs { max-width: 20rem; }
        .max-w-2xl { max-width: 42rem; }
        .min-w-\\[280px\\] { min-width: 280px; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .w-12 { width: 3rem; }
        .h-12 { height: 3rem; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-32 { width: 8rem; }
        .h-32 { height: 8rem; }
        .h-64 { height: 16rem; }
        .z-50 { z-index: 50; }
        .relative { position: relative; }
        .fixed { position: fixed; }
        .absolute { position: absolute; }
        .top-0 { top: 0; }
        .right-0 { right: 0; }
        .bottom-10 { bottom: 2.5rem; }
        .right-10 { right: 2.5rem; }
        .bg-transparent { background-color: transparent; }
        .outline-none { outline: 2px solid transparent; outline-offset: 2px; }
        .select-none { user-select: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;
