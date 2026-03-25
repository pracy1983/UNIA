import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, X, Clock, Trash2, Archive,
  Camera, Link as LinkIcon, MessageCircle, Edit3
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getRelationshipById, 
  getMemories, 
  createMemory, 
  Memory, 
  Relationship,
  archiveRelationship,
  deleteRelationship,
  updateRelationship,
  getWishlist,
  addWishlistItem,
  deleteWishlistItem,
  WishlistItem
} from '../services/api';
import { SOSButton } from '../components/dashboard/SOSButton';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  namoro: 'Namoro',
  casamento: 'Casamento',
  noivado: 'Noivado',
  afeto: 'Afeto',
  ficante: 'Ficante',
  'amizade colorida': 'Amizade Colorida',
  solo: 'Solo',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── Timeline Item ─────────────────────────────────────────────────────────────
const TimelineItem = ({ memory, index }: { memory: Memory; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
        boxShadow: '0 0 8px rgba(255,126,95,0.5)',
      }} />
      <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: '6px' }} />
    </div>

    <div style={{
      flex: 1, background: 'rgba(15, 18, 35, 0.65)', border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '14px', padding: '14px 16px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <Clock size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
          {formatDate(memory.occurrence_date)}
        </span>
      </div>
      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'white' }}>{memory.title}</p>
      {memory.content && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{memory.content}</p>}
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RelationshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rel, setRel] = useState<Relationship | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'memories' | 'wishlist' | 'settings'>('memories');
  
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [relData, memData, wishData] = await Promise.all([
        getRelationshipById(id).catch(() => null),
        getMemories(id).catch(() => []),
        getWishlist(id).catch(() => []),
      ]);
      setRel(relData);
      setMemories(memData);
      setWishlist(wishData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleArchive = async () => {
    if (!id || !window.confirm('Arquivar este relacionamento? Ele sairá da Dashboard principal.')) return;
    try {
      await archiveRelationship(id);
      navigate('/dashboard');
    } catch {
      alert('Erro ao arquivar.');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('ELIMINAR PERMANENTEMENTE? Todos os dados, fotos e memórias serão apagados.')) return;
    try {
      await deleteRelationship(id);
      navigate('/dashboard');
    } catch {
      alert('Erro ao deletar.');
    }
  };

  const handleWhatsAppInvite = () => {
    if (!rel?.invite_token) return;
    const link = `${window.location.origin}/invite/${rel.invite_token}`;
    const text = `Olá! Quero cultivar nossa conexão no UNIA. Use este link para se conectar: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading || !rel) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  const typeName = TYPE_LABELS[rel.type] || rel.type;
  
  const displayPhotoUrl = rel.settings?.custom_photo 
    || rel.partner_node?.photo_url 
    || `https://i.pravatar.cc/150?u=${rel.id}`;

  return (
    <div className="app-layout" style={{ display: 'block', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto' }}>
      
      {/* Header Section */}
      <div className="rel-detail-header" style={{ marginBottom: '32px' }}>
        <div className="rel-info-main">
          <button onClick={() => navigate('/dashboard')} className="modal-close" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="rel-avatar-large" style={{ position: 'relative' }}>
            <img src={displayPhotoUrl} alt="Partner" style={{ objectFit: 'cover' }} />
            <div 
              onClick={() => setShowPhotoModal(true)}
              style={{ position: 'absolute', bottom: 0, right: 0, padding: '4px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid #0f1223', cursor: 'pointer' }} 
              title="Mudar Foto"
            >
              <Camera size={12} color="white" />
            </div>
          </div>
          <div className="rel-title-group">
            <span className="rel-type-tag">{typeName}</span>
            <h1>{rel.title}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Juntos desde {rel.started_at ? formatDate(rel.started_at) : 'sempre'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={handleWhatsAppInvite} className="btn-add-glass" style={{ background: 'rgba(37, 211, 102, 0.1)', borderColor: 'rgba(37, 211, 102, 0.2)' }}>
             <MessageCircle size={16} color="#25D366" /> Convidar
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'memories' ? 'active' : ''}`} onClick={() => setActiveTab('memories')}>Memórias</button>
        <button className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>Wishlist</button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Configurações</button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'memories' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Linha do Tempo</h2>
              <button onClick={() => setShowMemoryModal(true)} className="btn-add-glass">
                <Plus size={16} /> Novo Momento
              </button>
            </div>

            {memories.length === 0 ? (
               <div className="empty-state-premium">
                 <h3>Nenhuma memória ainda</h3>
                 <p>Comece a registrar os momentos que tornam esta conexão única.</p>
                 <button onClick={() => setShowMemoryModal(true)} className="btn-primary-glow">Registrar Primeiro Momento</button>
               </div>
            ) : (
              <div style={{ paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                {memories.map((m, i) => <TimelineItem key={m.id} memory={m} index={i} />)}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'wishlist' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Desejos e Conquistas</h2>
              <button onClick={() => setShowWishlistModal(true)} className="btn-add-glass">
                <Plus size={16} /> Novo Desejo
              </button>
            </div>

            {wishlist.length === 0 ? (
               <div className="empty-state-premium">
                 <h3>O que vocês sonham?</h3>
                 <p>Adicione links de presentes, lugares para viajar ou planos para o futuro.</p>
                 <button onClick={() => setShowWishlistModal(true)} className="btn-primary-glow">Adicionar Primeiro Desejo</button>
               </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map(item => (
                  <div key={item.id} className="wishlist-card">
                    <div className="wishlist-img">
                      {item.image_url ? <img src={item.image_url} alt="" /> : <LinkIcon size={32} style={{ opacity: 0.1 }} />}
                    </div>
                    <div className="wishlist-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4>{item.title}</h4>
                        <button onClick={() => deleteWishlistItem(item.id).then(fetchData)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      </div>
                      {item.description && <p>{item.description}</p>}
                      {item.link_url && (
                        <a href={item.link_url} target="_blank" rel="noreferrer" className="wishlist-link">
                          Ver item <ArrowLeft size={12} style={{ transform: 'rotate(135deg)' }} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Opções da Conexão</h2>
             
             <div style={{ background: 'rgba(15, 18, 35, 0.65)', borderRadius: '24px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Cultivar Conexão</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Status Atual: <strong>{typeName}</strong></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uma mudança aqui será registrada no histórico com a data que você escolher.</p>
                  </div>
                  <button onClick={() => setShowStatusModal(true)} className="btn-add-glass">
                    <Edit3 size={16} /> Atualizar Status
                  </button>
                </div>
             </div>

             <div className="danger-zone">
               <h3>Zona de Gerenciamento</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Ações permanentes ou de arquivamento desta conexão.</p>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleArchive} className="btn-danger" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Archive size={16} /> Arquivar
                  </button>
                  <button onClick={handleDelete} className="btn-danger">
                    <Trash2 size={16} /> Excluir Permanentemente
                  </button>
               </div>
             </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showMemoryModal && (
        <MemoryForm id={id} onClose={() => setShowMemoryModal(false)} onCreated={fetchData} />
      )}
      {showWishlistModal && (
        <WishlistForm id={id} onClose={() => setShowWishlistModal(false)} onCreated={fetchData} />
      )}
      {showStatusModal && (
        <StatusUpdateModal 
          id={id} 
          currentType={rel.type} 
          onClose={() => setShowStatusModal(false)} 
          onUpdated={fetchData} 
        />
      )}
      {showPhotoModal && (
        <PhotoUpdateModal
          id={id}
          rel={rel}
          onClose={() => setShowPhotoModal(false)}
          onUpdated={fetchData}
        />
      )}

      <SOSButton relationshipId={id} />
    </div>
  );
};

// ─── Sub-Forms ───────────────────────────────────────────────────────────────
const StatusUpdateModal = ({ id, currentType, onClose, onUpdated }: any) => {
  const [newType, setNewType] = useState(currentType);
  const [changeDate, setChangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRelationship(id, { type: newType, changeDate });
      onUpdated();
      onClose();
    } catch {
      alert('Erro ao atualizar status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
         <h3>Atualizar Status da Relação</h3>
         <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
           Isso registrará a mudança de <strong>{TYPE_LABELS[currentType] || currentType}</strong> para o novo status.
         </p>
         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Novo Status</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="input-field" required>
                <option value="namoro">Namoro</option>
                <option value="casamento">Casamento</option>
                <option value="noivado">Noivado</option>
                <option value="afeto">Afeto</option>
                <option value="ficante">Ficante</option>
                <option value="amizade colorida">Amizade Colorida</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data da Mudança</label>
              <input type="date" value={changeDate} onChange={e => setChangeDate(e.target.value)} required className="input-field" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Atualizar' : 'Confirmar Mudança'}</button>
            </div>
         </form>
      </motion.div>
    </div>
  );
};

const PhotoUpdateModal = ({ id, rel, onClose, onUpdated }: any) => {
  const [saving, setSaving] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const newSettings = { ...(rel.settings || {}), custom_photo: croppedImage };
      await updateRelationship(id, { settings: newSettings });
      onUpdated();
      setShowCropper(false);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao processar imagem.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemoveCustomPhoto = async () => {
    setSaving(true);
    try {
      const newSettings = { ...(rel.settings || {}) };
      delete newSettings.custom_photo;
      await updateRelationship(id, { settings: newSettings });
      onUpdated();
      onClose();
    } catch {
      alert('Erro ao remover foto customizada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
           <h3>Atualizar Foto</h3>
         <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
           Escolha uma foto para representar essa conexão.
         </p>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className="btn-primary-glow" style={{ textAlign: 'center', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Salvando...' : 'Fazer Upload de Nova Foto'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                disabled={saving}
              />
            </label>
            
            {rel.settings?.custom_photo && (
              <button 
                className="btn-secondary" 
                onClick={handleRemoveCustomPhoto}
                disabled={saving}
              >
                Remover Foto Customizada
              </button>
            )}
            
            {rel.partner_node?.photo_url && (
              <div style={{ background: 'rgba(15, 18, 35, 0.6)', padding: '12px', borderRadius: '12px', marginTop: '8px' }}>
                 <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>O parceiro já definiu uma foto no perfil dele.</p>
                 <button 
                   className="btn-secondary" 
                   onClick={handleRemoveCustomPhoto}
                   style={{ width: '100%' }}
                   disabled={saving}
                 >
                   Usar Foto do Parceiro
                 </button>
              </div>
            )}
            
            <button className="btn-link" onClick={onClose} style={{ marginTop: '8px' }}>Cancelar</button>
         </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCropper && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ zIndex: 3000 }}
          >
            <motion.div 
              className="modal-content"
              style={{ maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div style={{ position: 'relative', flex: 1, background: '#000' }}>
                {imageToCrop && (
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape="round"
                    showGrid={false}
                  />
                )}
              </div>
              
              <div className="cropper-controls">
                <div className="zoom-slider-container">
                  <span style={{ fontSize: '0.8rem' }}>Zoom</span>
                  <input 
                    type="range" 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    value={zoom} 
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="zoom-slider"
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowCropper(false)} 
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCropSave} 
                    className="btn-primary-glow" 
                    style={{ flex: 1 }}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Cortar e Usar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MemoryForm = ({ id, onClose, onCreated }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMemory({ relationship_id: id, title, content, occurrence_date: date });
      onCreated();
      onClose();
    } catch {
      alert('Erro ao salvar momento.');
    } finally {
      setSaving(false);
    }
  };

  return (
     <div className="modal-overlay" onClick={onClose}>
       <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
         <h3>Registrar Momento</h3>
         <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>O que aconteceu?</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="input-field" placeholder="Ex: Primeiro encontro..." />
            </div>
            <div className="form-group">
              <label>Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Detalhes (opcional)" className="input-field" rows={3} style={{ resize: 'none' }} />
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Registrar'}</button>
            </div>
         </form>
       </motion.div>
     </div>
  );
};

const WishlistForm = ({ id, onClose, onCreated }: any) => {
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addWishlistItem({ relationship_id: id, title, link_url: linkUrl });
      onCreated();
      onClose();
    } catch {
      alert('Erro ao salvar desejo.');
    } finally {
      setSaving(false);
    }
  };

  return (
     <div className="modal-overlay" onClick={onClose}>
       <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
         <h3>Novo Desejo</h3>
         <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Desejo</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="input-field" placeholder="Ex: Jantar no restaurante X..." />
            </div>
            <div className="form-group">
              <label>Link (opcional)</label>
              <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar'}</button>
            </div>
         </form>
       </motion.div>
     </div>
  );
};

export default RelationshipDetail;
