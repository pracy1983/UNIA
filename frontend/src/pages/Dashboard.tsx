import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Play, User, LogOut, ChartNoAxesColumn as ChartColumn } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-dark)', color: 'white' }}>
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <Heart className="text-primary" size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UNIA</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user.displayName || 'Explorador'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-8 p-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Bem-vindo ao início da sua jornada</h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Vamos começar mapeando o seu universo relacional. O Quiz do "Mapa do Amor" ajudará você a entender melhor suas conexões.
            </p>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Play size={18} fill="currentColor" />
              Começar Mapa do Amor
            </button>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-white/5 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <ChartColumn size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Nível do Relacionamento</h3>
                <p className="text-xs text-muted-foreground">Em breve</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-white/5 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Perfil Conjunto</h3>
                <p className="text-xs text-muted-foreground">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
