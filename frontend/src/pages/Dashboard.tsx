import { useState, useEffect } from 'react';
import {
  Home, Calendar, Link as LinkIcon, Orbit, Settings, Search as SearchIcon, Plus, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RelationshipCard from '../components/dashboard/RelationshipCard';
import { PillWidget, AlertWidget } from '../components/dashboard/DashboardWidgets';
import { SOSButton } from '../components/dashboard/SOSButton';
import { createRelationship, getRelationships, getProfile, CreateRelationshipData, Profile, WishlistItem, getPersonalWishlist, addWishlistItem, deleteWishlistItem, PersonalityQuestion, getUnansweredQuestions, submitPersonalityAnswer, getDiscoveries, PersonalityDiscovery, getConnections, getCalendar, updateSettings, deleteAccount, Connection, CalendarEvent } from '../services/api';
import { LogOut, User, Gift, Trash2, ChevronRight, Sparkles, MessageCircle, Mail, Archive, CalendarHeart, Bell as BellIcon, AlertTriangle } from 'lucide-react';

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

  // ─── Conexões / Calendário / Configurações ───
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [calendar, setCalendar] = useState<{ upcoming: CalendarEvent[]; past: CalendarEvent[] }>({ upcoming: [], past: [] });
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
    fetchPersonalityQuestions();
  }, []);

  // Sincroniza o toggle de notificação quando o perfil carrega
  useEffect(() => {
    if (profile?.settings && typeof profile.settings.notify_whatsapp === 'boolean') {
      setNotifyWhatsapp(profile.settings.notify_whatsapp);
    }
  }, [profile]);

  // Carrega dados sob demanda ao abrir cada aba
  useEffect(() => {
    if (activeTab === 'Conexões' && connections.length === 0) {
      setLoadingConnections(true);
      getConnections().then(setConnections).catch(() => {}).finally(() => setLoadingConnections(false));
    }
    if (activeTab === 'Calendário' && calendar.upcoming.length === 0 && calendar.past.length === 0) {
      setLoadingCalendar(true);
      getCalendar().then(setCalendar).catch(() => {}).finally(() => setLoadingCalendar(false));
    }
  }, [activeTab]);

  const handleToggleNotify = async () => {
    const next = !notifyWhatsapp;
    setNotifyWhatsapp(next);
    setSavingSettings(true);
    try {
      await updateSettings({ notify_whatsapp: next });
    } catch {
      setNotifyWhatsapp(!next); // reverte em caso de erro
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza? Sua conta e TODOS os seus dados (relacionamentos, memórias, perfil) serão apagados permanentemente. Esta ação é irreversível.')) return;
    try {
      await deleteAccount();
      localStorage.clear();
      navigate('/login');
    } catch {
      alert('Erro ao excluir conta. Tente novamente.');
    }
  };

  const formatEventDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

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
                   <div key={i} style={{ background: 'rgba(15, 18, 35, 0.65)', border: '1px solid rgba(255, 126, 95, 0.25)', borderRadius: '16px', padding: '20px' }}>
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
        ) : activeTab === 'Conexões' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Minhas Conexões</h2>
              <button onClick={() => setShowModal(true)} className="btn-add-glass">
                <Plus size={16} /> Nova Conexão
              </button>
            </div>

            {loadingConnections ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="loader-small" />
              </div>
            ) : connections.length === 0 ? (
              <div className="empty-state-premium">
                <h3>Nenhuma conexão ainda</h3>
                <p>Aqui ficam todos os seus relacionamentos — ativos e arquivados. Comece criando o primeiro.</p>
                <button onClick={() => setShowModal(true)} className="btn-primary-glow"><Plus size={18} /> Criar Conexão</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connections.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/relationship/${c.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 18, 35, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 20px', cursor: 'pointer', opacity: c.is_archived ? 0.6 : 1 }}
                  >
                    <div className="user-avatar" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', borderRadius: '50%', flexShrink: 0 }}>
                      {c.partner_node?.photo_url ? (
                        <img src={c.partner_node.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <User size={22} color="var(--text-muted)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '2px' }}>{c.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{c.type} · Nível {c.level}</p>
                    </div>
                    {c.is_archived ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}><Archive size={13} /> Arquivado</span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#34c759' }}>● Ativo</span>
                    )}
                    <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : activeTab === 'Calendário' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', marginTop: '12px' }}>Calendário</h2>

            {loadingCalendar ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loader-small" /></div>
            ) : calendar.upcoming.length === 0 && calendar.past.length === 0 ? (
              <div className="empty-state-premium">
                <h3>Sem datas ainda</h3>
                <p>Quando você definir a data de início de um relacionamento ou registrar memórias, os aniversários e momentos aparecerão aqui.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {calendar.upcoming.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '14px' }}>Próximos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {calendar.upcoming.map((e, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 18, 35, 0.65)', border: '1px solid rgba(255, 126, 95, 0.25)', borderRadius: '14px', padding: '14px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '12px', background: 'rgba(255,126,95,0.1)', color: '#FF7E5F', flexShrink: 0 }}>
                            {e.type === 'anniversary' ? <CalendarHeart size={20} /> : <Sparkles size={20} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1rem' }}>{e.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{e.subtitle}</p>
                          </div>
                          <span style={{ fontWeight: 600, color: '#FF7E5F', fontSize: '0.9rem', textTransform: 'capitalize' }}>{formatEventDate(e.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {calendar.past.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '14px' }}>Histórico</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {calendar.past.map((e, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 18, 35, 0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 18px', opacity: 0.75 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {e.type === 'anniversary' ? <CalendarHeart size={20} /> : <Sparkles size={20} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1rem' }}>{e.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{e.subtitle}</p>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{formatEventDate(e.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : activeTab === 'Configurações' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 24px', maxWidth: 640 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', marginTop: '12px' }}>Configurações</h2>

            {/* Conta */}
            <div style={{ background: 'rgba(15, 18, 35, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Conta</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                <MessageCircle size={18} color="#25D366" />
                <span style={{ flex: 1 }}>{profile?.phone || '—'}</span>
                {profile?.whatsapp_verified && <span style={{ fontSize: '0.75rem', color: '#34c759' }}>✓ verificado</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <Mail size={18} />
                <span>{profile?.email || '—'}</span>
              </div>
              <button onClick={() => navigate('/profile')} className="btn-add-glass" style={{ marginTop: '18px' }}>
                <User size={16} /> Editar perfil
              </button>
            </div>

            {/* Notificações */}
            <div style={{ background: 'rgba(15, 18, 35, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Notificações</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BellIcon size={18} color="var(--text-muted)" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.95rem' }}>Lembretes pelo WhatsApp</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aniversários, datas e a pílula do dia.</p>
                </div>
                <button
                  onClick={handleToggleNotify}
                  disabled={savingSettings}
                  style={{
                    width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative',
                    background: notifyWhatsapp ? '#34c759' : 'rgba(255,255,255,0.15)', transition: 'background 0.2s'
                  }}
                  aria-label="Alternar notificações"
                >
                  <span style={{ position: 'absolute', top: 3, left: notifyWhatsapp ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            {/* Zona de perigo */}
            <div style={{ background: 'rgba(35, 15, 15, 0.55)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#ff453a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> Zona de perigo
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Excluir sua conta apaga permanentemente todos os seus dados. Não há como desfazer.
              </p>
              <button
                onClick={handleDeleteAccount}
                style={{ background: 'rgba(255, 59, 48, 0.12)', color: '#ff453a', border: '1px solid rgba(255, 59, 48, 0.4)', borderRadius: '12px', padding: '10px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}
              >
                <Trash2 size={16} /> Excluir minha conta
              </button>
            </div>
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
