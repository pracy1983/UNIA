import { useState, useEffect } from 'react';
import {
  Home, Calendar, Link as LinkIcon, Orbit, Settings, Search as SearchIcon, Bell, Plus, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';
import { SOSButton } from '../components/dashboard/SOSButton';
import { createRelationship, getRelationships, getProfile, CreateRelationshipData, Profile, WishlistItem, getPersonalWishlist, addWishlistItem, deleteWishlistItem, PersonalityQuestion, getUnansweredQuestions, submitPersonalityAnswer, getDiscoveries, PersonalityDiscovery } from '../services/api';
import { LogOut, User, Gift, Trash2, ChevronRight, Sparkles } from 'lucide-react';

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
  { icon: <Gift size={18} />, label: 'Minha Wishlist' },
  { icon: <Sparkles size={18} />, label: 'Meu Perfil Psicológico' },
  { icon: <Settings size={18} />, label: 'Configurações' },
];

const Sidebar = ({ active, onSelect }: { active: string; onSelect: (l: string) => void }) => (
  <aside className="sidebar">
    {/* Logo apenas a imagem — sem texto "UNIA" abaixo */}
    <div className="sidebar-logo">
      <img src="/assets/logo.png" alt="UNIA" />
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [personalWishlist, setPersonalWishlist] = useState<WishlistItem[]>([]);
  const [discoveries, setDiscoveries] = useState<PersonalityDiscovery[]>([]);
  const [loadingRel, setLoadingRel] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateRelationshipData>({
    type: 'dating',
    startedAt: new Date().toISOString().split('T')[0]
  });
  const [creating, setCreating] = useState(false);

  const user = getUserData();
  // Proteção: se displayName for undefined/null/string vazia → string vazia
  const firstName = (user?.displayName ?? '').split(' ')[0] || '';

  const fetchData = async () => {
    setLoadingRel(true);
    try {
      const [rels, prof, wish, discov] = await Promise.all([
        getRelationships(),
        getProfile().catch(() => null), // Catch profile error to not block relationships
        getPersonalWishlist().catch(() => []),
        getDiscoveries().catch(() => [])
      ]);
      setRelationships(rels);
      if (prof) setProfile(prof);
      setPersonalWishlist(wish);
      setDiscoveries(discov);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRelationships([]); // Ensure relationships is an empty array on error
    } finally {
      setLoadingRel(false);
    }
  };

  // ─── Personality Popup State ───
  const [personalityQuestions, setPersonalityQuestions] = useState<PersonalityQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [personalityAnswer, setPersonalityAnswer] = useState('');
  const [showPersonalityPopup, setShowPersonalityPopup] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);

  const fetchPersonalityQuestions = async () => {
    try {
      const questions = await getUnansweredQuestions();
      if (questions && questions.length > 0) {
        setPersonalityQuestions(questions);
        setShowPersonalityPopup(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitCurrentAnswer = async () => {
    if (!personalityAnswer.trim()) return;
    setSavingAnswer(true);
    try {
      const question = personalityQuestions[currentQuestionIndex];
      await submitPersonalityAnswer(question.id, personalityAnswer);
      setPersonalityAnswer('');
      
      if (currentQuestionIndex < personalityQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowPersonalityPopup(false);
      }
      
      // Refresh discoveries in background
      getDiscoveries().then(setDiscoveries).catch(() => {});
    } catch (e) {
      console.error('Failed to save answer', e);
    } finally {
      setSavingAnswer(false);
    }
  };

  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistLink, setWishlistLink] = useState('');
  const [savingWishlist, setSavingWishlist] = useState(false);

  const handleAddWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWishlist(true);
    try {
      await addWishlistItem({ title: wishlistTitle, link_url: wishlistLink });
      const updatedWishlist = await getPersonalWishlist();
      setPersonalWishlist(updatedWishlist);
      setShowWishlistModal(false);
      setWishlistTitle('');
      setWishlistLink('');
    } catch (error) {
      console.error('Erro ao adicionar desejo:', error);
      alert('Erro ao adicionar desejo.');
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    try {
      await deleteWishlistItem(id);
      setPersonalWishlist(personalWishlist.filter(w => w.id !== id));
    } catch (error) {
      console.error('Erro ao deletar desejo:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPersonalityQuestions();
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
      setFormData({ 
        type: 'dating',
        startedAt: new Date().toISOString().split('T')[0]
      });
      fetchData(); // Re-fetch all data after creating a relationship
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
      alert('Erro ao criar relacionamento. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
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
            <div className="user-pill" onClick={() => navigate('/profile')} title="Meu Perfil">
              <span>Olá, <strong>{profile?.display_name || firstName}!</strong></span>
              <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)' }}>
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <User size={20} color="var(--text-muted)" />
                )}
              </div>
            </div>
            
            <button className="notif-btn" onClick={handleLogout} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </motion.div>

        {/* ── Conteúdo principal ── */}
        {activeTab === 'Minha Wishlist' ? (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '12px' }}>
               <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Minha Wishlist Pessoal</h2>
               <button onClick={() => setShowWishlistModal(true)} className="btn-add-glass">
                 <Plus size={16} /> Novo Desejo
               </button>
             </div>

             {personalWishlist.length === 0 ? (
                <div className="empty-state-premium">
                  <h3>Sua lista de desejos</h3>
                  <p>Adicione o que você quer ganhar ou conquistar. Útil para compartilhar ideias com quem você ama!</p>
                  <button onClick={() => setShowWishlistModal(true)} className="btn-primary-glow">Meu Primeiro Desejo</button>
                </div>
             ) : (
               <div className="wishlist-grid">
                 {personalWishlist.map(item => (
                   <div key={item.id} className="wishlist-card">
                     <div className="wishlist-img">
                       {item.image_url ? <img src={item.image_url} alt="" /> : <Gift size={32} style={{ opacity: 0.1 }} />}
                     </div>
                     <div className="wishlist-info">
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <h4>{item.title}</h4>
                         <button onClick={() => handleDeleteWishlist(item.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                           <Trash2 size={14} />
                         </button>
                       </div>
                       {item.description && <p>{item.description}</p>}
                       {item.link_url && (
                         <a href={item.link_url} target="_blank" rel="noreferrer" className="wishlist-link">
                           Ver item
                         </a>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </motion.div>
        ) : activeTab === 'Meu Perfil Psicológico' ? (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '12px' }}>
               <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Meu Perfil Psicológico</h2>
             </div>

             {discoveries.length === 0 ? (
                <div className="empty-state-premium">
                  <h3>Sua Jornada de Autoconhecimento</h3>
                  <p>As perguntas aparecerão automaticamente quando você entrar no app para montar o seu perfil de conexões.</p>
                </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {discoveries.map((item, i) => (
                   <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                     <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,126,95,0.1)', color: '#FF7E5F', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '12px' }}>
                       {item.category}
                     </div>
                     <h4 style={{ fontSize: '1.05rem', marginBottom: '12px', lineHeight: 1.4 }}>{item.question_text}</h4>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                       {item.answer_content}
                     </p>
                   </div>
                 ))}
               </div>
             )}
           </motion.div>
        ) : activeTab !== 'Início' ? (
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
                  className="btn-add-glass"
                >
                  <Plus size={16} />
                  Adicionar Relacionamento
                </button>
              </div>

              {loadingRel ? null : relationships.length === 0 ? (
                <motion.div 
                  className="empty-state-premium"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="empty-icon-glow">
                    <Orbit size={48} color="rgba(255,255,255,0.2)" />
                  </div>
                  <h3>Seu Universo está começando...</h3>
                  <p>Você ainda não tem relacionamentos ativos. Que tal começar a cultivar uma nova conexão?</p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="btn-primary-glow"
                  >
                    <Plus size={18} />
                    Cultivar Primeiro Relacionamento
                  </button>
                </motion.div>
              ) : (
                <div className="relationships-row">
                  {relationships.map((rel, i) => (
                    <RelationshipCard
                      key={i}
                      {...rel}
                      avatars={
                        rel.settings?.custom_photo 
                          ? [rel.settings.custom_photo] 
                          : rel.partner_node?.photo_url 
                            ? [rel.partner_node.photo_url] 
                            : []
                      }
                      onClick={() => navigate(`/relationship/${rel.id}`)}
                    />
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

            <form onSubmit={handleCreateRelationship} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="type">Tipo de Relacionamento *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                   disabled={creating}
                >
                  <option value="namoro">Namoro</option>
                  <option value="casamento">Casamento</option>
                  <option value="noivado">Noivado</option>
                  <option value="afeto">Afeto</option>
                  <option value="ficante">Ficante</option>
                  <option value="amizade colorida">Amizade Colorida</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="partnerName">Nome do Parceiro(a) (opcional)</label>
                <input
                  id="partnerName"
                  type="text"
                  placeholder="Ex: Ana, João..."
                  value={formData.partnerName || ''}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '10px 14px' }}
                  disabled={creating}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Isso criará um perfil básico para essa pessoa no sistema.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="startedAt">Data de Início *</label>
                <input
                  id="startedAt"
                  type="date"
                  value={formData.startedAt}
                  onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                  className="input-field"
                  required
                  disabled={creating}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Sugerimos a data de hoje para iniciar seu registro.
                </p>
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
      
      {/* ── Personality Popup Bottom Drawer ── */}
      {showPersonalityPopup && personalityQuestions.length > 0 && (
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          style={{
            position: 'fixed',
            bottom: 30, right: 30, left: 30,
            maxWidth: '500px', margin: '0 auto',
            background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}
        >
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF7E5F', fontWeight: 600 }}>
               <Sparkles size={18} />
               <span>Construindo seu Perfil ({currentQuestionIndex + 1}/{personalityQuestions.length})</span>
             </div>
             <button onClick={() => setShowPersonalityPopup(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', cursor: 'pointer' }}>
               Responder depois
             </button>
           </div>
           
           <h3 style={{ fontSize: '1.15rem', lineHeight: 1.4 }}>
             {personalityQuestions[currentQuestionIndex].question_text}
           </h3>
           
           <textarea 
             className="input-field" 
             rows={3} 
             placeholder="Escreva como você costuma agir ou sentir..."
             value={personalityAnswer}
             onChange={e => setPersonalityAnswer(e.target.value)}
             style={{ resize: 'none' }}
           />
           
           <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button 
               className="btn-primary-glow" 
               onClick={submitCurrentAnswer}
               disabled={savingAnswer || !personalityAnswer.trim()}
             >
               {savingAnswer ? 'Salvando...' : (
                 <>Avançar <ChevronRight size={16} /></>
               )}
             </button>
           </div>
        </motion.div>
      )}
      
      <SOSButton />
      {showWishlistModal && (
        <div className="modal-overlay" onClick={() => setShowWishlistModal(false)}>
          <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
             <h3>Adicionar Desejo</h3>
             <form onSubmit={handleAddWishlist} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>O que você deseja?</label>
                  <input value={wishlistTitle} onChange={e => setWishlistTitle(e.target.value)} required className="input-field" placeholder="Ex: Livro novo, Perfume..." />
                </div>
                <div className="form-group">
                  <label>Link (opcional)</label>
                  <input type="url" value={wishlistLink} onChange={e => setWishlistLink(e.target.value)} className="input-field" placeholder="https://..." />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowWishlistModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={savingWishlist}>{savingWishlist ? 'Salvando...' : 'Adicionar'}</button>
                </div>
             </form>
          </motion.div>
        </div>
      )}
      </div>
    </>
  );
};

export default Dashboard;
