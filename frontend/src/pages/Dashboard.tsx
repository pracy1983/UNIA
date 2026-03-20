import { useState, useEffect } from 'react';
import { 
  Home, Calendar, Link as LinkIcon, Orbit, Settings, Search as SearchIcon, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';

// ─── helpers ────────────────────────────────────────────────────────────────
function getUserData() {
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      return JSON.parse(raw);
    }
  } catch {}
  return { displayName: '' };
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: <Home size={20} />, label: 'Início' },
  { icon: <Calendar size={20} />, label: 'Calendário' },
  { icon: <LinkIcon size={20} />, label: 'Conexões' },
  { icon: <Orbit size={20} />, label: 'Meu Universo' },
  { icon: <Settings size={20} />, label: 'Configurações' },
];

const Sidebar = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (label: string) => void;
}) => (
  <aside className="sidebar">
    {/* Logo + nome inline, igual ao mockup */}
    <div className="sidebar-logo">
      <img src="/assets/logo.png" alt="UNIA" />
      <span>UNIA</span>
    </div>

    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {menuItems.map(({ icon, label }) => (
        <button
          key={label}
          className={`nav-item${active === label ? ' active' : ''}`}
          onClick={() => onSelect(label)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  </aside>
);

// ─── Dashboard page ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Início');
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loadingRel, setLoadingRel] = useState(true);

  const user = getUserData();
  // Apenas pega o primeiro nome — se não existir exibe nada (sem fictício)
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : '';

  useEffect(() => {
    axios
      .get('/api/dashboard/relationships')
      .then((r) => setRelationships(r.data))
      .catch(() => setRelationships([]))
      .finally(() => setLoadingRel(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar active={activeTab} onSelect={setActiveTab} />

      <div className="content-area">
        {/* ── Top bar ── */}
        <div className="topbar">
          <div className="search-bar">
            <SearchIcon size={18} color="rgba(255,255,255,0.35)" />
            <input placeholder="Pesquisar..." />
          </div>

          <div className="topbar-right">
            <div className="user-pill" onClick={handleLogout} title="Sair">
              <span>
                Olá, <strong>{firstName || 'usuário'}!</strong>
              </span>
              <div className="user-avatar">
                <img
                  src={`https://i.pravatar.cc/80?u=${firstName || 'unia'}`}
                  alt="avatar"
                />
              </div>
            </div>
            <button className="notif-btn">
              <Bell size={20} />
            </button>
          </div>
        </div>

        {/* ── Conteúdo principal ── */}
        {activeTab !== 'Início' ? (
          // Página "Em breve"
          <div className="coming-soon">
            <h1>Em Breve</h1>
            <p>A página <strong>{activeTab}</strong> ainda está em construção.</p>
            <button className="back-btn" onClick={() => setActiveTab('Início')}>
              Voltar ao Início
            </button>
          </div>
        ) : (
          <>
            {/* Relacionamentos Ativos */}
            <section>
              <div className="section-header">
                <h2>Relacionamentos Ativos</h2>
                <button
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  Ver todos
                </button>
              </div>

              {loadingRel ? null : relationships.length === 0 ? (
                <div className="empty-state">
                  Sem relacionamentos ativos cadastrados ainda.
                </div>
              ) : (
                <div className="relationships-row">
                  {relationships.map((rel, i) => (
                    <RelationshipCard key={i} {...rel} />
                  ))}
                </div>
              )}
            </section>

            {/* Widgets inferiores */}
            <div className="bottom-row">
              <PillWidget />
              <AlertWidget />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
