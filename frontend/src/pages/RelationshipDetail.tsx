import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRelationshipById, getMemories, createMemory, Memory, Relationship } from '../services/api';
import { SOSButton } from '../components/dashboard/SOSButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  solo: 'Solo',
  dating: 'Namoro',
  marriage: 'Casamento',
  poly: 'Poliamoroso',
  open: 'Relacionamento Aberto',
  friendship: 'Amizade',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── Memory Form ──────────────────────────────────────────────────────────────
const MemoryFormModal = ({
  relId,
  onClose,
  onCreated,
}: {
  relId: string;
  onClose: () => void;
  onCreated: (m: Memory) => void;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr('Título é obrigatório.'); return; }
    setSaving(true);
    try {
      const m = await createMemory({
        relationship_id: relId,
        title: title.trim(),
        content: content.trim() || undefined,
        occurrence_date: new Date(date).toISOString(),
      });
      onCreated(m);
      onClose();
    } catch {
      setErr('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Novo Momento</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              placeholder="Ex: Primeira viagem juntos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              style={{ padding: '12px 16px' }}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              style={{ padding: '12px 16px', colorScheme: 'dark' }}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Descrição (opcional)</label>
            <textarea
              placeholder="O que aconteceu? Como você estava se sentindo?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: 'white',
                resize: 'none', outline: 'none', fontSize: '0.9rem',
              }}
              disabled={saving}
            />
          </div>

          {err && <p style={{ color: '#FF7E5F', fontSize: '0.82rem', textAlign: 'center' }}>{err}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Registrar Momento'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Timeline Item ─────────────────────────────────────────────────────────────
const TimelineItem = ({ memory, index }: { memory: Memory; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
  >
    {/* Dot + line */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
        boxShadow: '0 0 8px rgba(255,126,95,0.5)',
        flexShrink: 0,
      }} />
      <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: '6px' }} />
    </div>

    {/* Card */}
    <div style={{
      flex: 1,
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '14px 16px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <Clock size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
          {formatDate(memory.occurrence_date)}
        </span>
      </div>
      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'white', marginBottom: memory.content ? '6px' : 0 }}>
        {memory.title}
      </p>
      {memory.content && (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          {memory.content}
        </p>
      )}
    </div>
  </motion.div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────
const RelationshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rel, setRel] = useState<Relationship | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getRelationshipById(id).catch(() => null),
      getMemories(id).catch(() => []),
    ]).then(([relData, memData]) => {
      setRel(relData);
      setMemories(Array.isArray(memData) ? memData : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleCreated = (m: Memory) => {
    setMemories((prev) => [m, ...prev]);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="empty-state">Carregando...</div>
      </div>
    );
  }

  const typeName = rel ? (TYPE_LABELS[rel.type] || rel.type) : 'Relacionamento';

  return (
    <div className="app-layout" style={{ flexDirection: 'column', padding: '20px 32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '10px',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{typeName}</h1>
          {rel && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Nível {rel.level} · Status: {rel.status}
            </p>
          )}
        </div>
      </div>

      {/* XP bar */}
      {rel && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              <span>Nível {rel.level}</span>
              <span>{rel.xp} XP</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((rel.xp % 100), 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #FF7E5F, #FEB47B)', borderRadius: '999px' }}
              />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nível {rel.level}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{rel.type}</div>
          </div>
        </div>
      )}

      {/* Momentos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Linha do Tempo</h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px',
            background: 'rgba(255,126,95,0.12)', border: '1px solid rgba(255,126,95,0.3)',
            color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Plus size={14} />
          Registrar Momento
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="empty-state">
          Nenhum momento registrado ainda.<br />
          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Registre o primeiro marco desta relação!</span>
        </div>
      ) : (
        <div>
          {memories.map((m, i) => (
            <TimelineItem key={m.id} memory={m} index={i} />
          ))}
        </div>
      )}

      {showModal && id && (
        <MemoryFormModal relId={id} onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <SOSButton relationshipId={id} />
    </div>
  );
};

export default RelationshipDetail;
