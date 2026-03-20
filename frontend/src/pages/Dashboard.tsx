import { useState, useEffect } from 'react';
import {
  Home, Calendar, Link as LinkIcon, Orbit, Settings, Search as SearchIcon, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getUserData() {
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      return JSON.parse(raw);
    }
  } catch {}
  return { displayName: '' };
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: <Home size={18} />,     label: 'Início'        },
  { icon: <Calendar size={18} />, label: 'Calendário'   },
  { icon: <LinkIcon size={18} />, label: 'Conexões'     },
  { icon: <Orbit size={18} />,    label: 'Meu Universo' },
  { icon: <Settings size={18} />, label: 'Configurações'},
];

const Sidebar = ({ active, onSelect }: { active: string; onSelect: (l: string) => void }) => (
  <aside className="sidebar">
    {/* Logo apenas a imagem — sem texto "UNIA" abaixo */}
    <div className="sidebar-logo">
      <img src="/assets/logo.png" alt="UNIA" />
      <span className="sidebar-logo-text">UNIA</span>
    </div>

    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Início');
  // NENHUM relacionamento fictício — sempre busca do banco
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loadingRel, setLoadingRel] = useState(true);

  const user = getUserData();
  // Proteção: se displayName for undefined/null/string vazia → string vazia
  const firstName = (user?.displayName ?? '').split(' ')[0] || '';

  useEffect(() => {
    axios.get('/api/dashboard/relationships')
      .then(r => setRelationships(Array.isArray(r.data) ? r.data : []))
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

        {/* ── Top Bar ── */}
        <motion.div
          className="topbar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="search-bar">
            <SearchIcon size={16} color="rgba(255,255,255,0.32)" />
            <input placeholder="Pesquisar..." />
          </div>

          <div className="topbar-right">
            {firstName && (
              <div className="user-pill" onClick={handleLogout} title="Clique para sair">
                <span>Olá, <strong>{firstName}!</strong></span>
                <div className="user-avatar">
                  <img src={`https://i.pravatar.cc/80?u=${firstName}`} alt="avatar" />
                </div>
              </div>
            )}
            <button className="notif-btn">
              <Bell size={18} />
            </button>
          </div>
        </motion.div>

        {/* ── Conteúdo principal ── */}
        {activeTab !== 'Início' ? (
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
                <button style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'color 0.2s'
                }}>
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
