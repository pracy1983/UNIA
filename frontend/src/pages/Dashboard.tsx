import { useState, useEffect } from 'react';
import {
  Home, Calendar, Link as LinkIcon, Orbit, Settings, Search as SearchIcon, Bell, Plus, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';
import { createRelationship, CreateRelationshipData } from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getUserData() {
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      return JSON.parse(raw);
    }
  } catch { }
  return { displayName: '' };
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: <Home size={18} />, label: 'Início' },
  { icon: <Calendar size={18} />, label: 'Calendário' },
  { icon: <LinkIcon size={18} />, label: 'Conexões' },
  { icon: <Orbit size={18} />, label: 'Meu Universo' },
  { icon: <Settings size={18} />, label: 'Configurações' },
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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateRelationshipData>({
    title: '',
    type: 'dating'
  });
  const [creating, setCreating] = useState(false);

  const user = getUserData();
  // Proteção: se displayName for undefined/null/string vazia → string vazia
  const firstName = (user?.displayName ?? '').split(' ')[0] || '';

  const fetchRelationships = () => {
    setLoadingRel(true);
    axios.get('/api/dashboard/relationships')
      .then(r => setRelationships(Array.isArray(r.data) ? r.data : []))
      .catch(() => setRelationships([]))
      .finally(() => setLoadingRel(false));
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createRelationship(formData);
      setShowModal(false);
      setFormData({ title: '', type: 'dating' });
      fetchRelationships();
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
      alert('Erro ao criar relacionamento. Tente novamente.');
    } finally {
      setCreating(false);
    }
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
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.85rem',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  }}
                >
                  <Plus size={16} />
                  Adicionar
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
              <AlertWidget relationshipsCount={relationships.length} />
            </div>
          </>
        )}
      </div>

      {/* Modal de Criação de Relacionamento */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Novo Relacionamento</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                disabled={creating}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRelationship}>
              <div className="form-group">
                <label htmlFor="title">Título (opcional)</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ex: Meu relacionamento especial"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={creating}
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Tipo de Relacionamento *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                  disabled={creating}
                >
                  <option value="dating">Namoro</option>
                  <option value="marriage">Casamento</option>
                  <option value="friendship">Amizade</option>
                  <option value="family">Família</option>
                  <option value="professional">Profissional</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Criando...' : 'Criar Relacionamento'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
