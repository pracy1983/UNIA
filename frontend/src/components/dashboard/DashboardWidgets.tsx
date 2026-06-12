import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { savePill, getLatestPill, getInsight } from '../../services/api';

const MOOD_MAP: Record<string, string> = {
  Excelente: 'excellent',
  Normal: 'normal',
  Melhorável: 'improvable',
};
const MOOD_MAP_REVERSE: Record<string, string> = {
  excellent: 'Excelente',
  normal: 'Normal',
  improvable: 'Melhorável',
};

// Pílula do Dia: estado do usuário — persiste no banco via /api/pills
export const PillWidget = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar pill de hoje do banco
  useEffect(() => {
    getLatestPill()
      .then((pill) => {
        if (pill) {
          const today = new Date().toISOString().split('T')[0];
          const pillDay = pill.created_at.split('T')[0];
          if (pillDay === today) {
            setSelected(MOOD_MAP_REVERSE[pill.mood] || null);
          }
        }
      })
      .catch(() => {
        // Fallback: usar localStorage
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`pill_${today}`);
        if (saved) setSelected(saved);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (option: string) => {
    setSelected(option);
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`pill_${today}`, option);
    try {
      await savePill(MOOD_MAP[option], '');
    } catch {
      // Silently fail — localStorage backup is set
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="pill-widget"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3>Pílula do Dia</h3>

      <p className="pill-question">
        Como estão seus relacionamentos hoje?
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
          <Loader2 size={20} style={{ opacity: 0.4, animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="pill-buttons">
          {['Excelente', 'Normal', 'Melhorável'].map((option) => (
            <button
              key={option}
              className={`pill-btn${selected === option ? ' selected' : ''}`}
              onClick={() => handleSelect(option)}
              disabled={saving}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {selected && !loading && (
        <p style={{
          marginTop: '12px',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center'
        }}>
          {saving ? 'Salvando...' : '✓ Salvo no seu perfil'}
        </p>
      )}
    </motion.div>
  );
};

// AlertWidget: Deep Insight gerado por IA (OmniRoute) a partir do humor e memórias
export const AlertWidget = ({ relationshipsCount = 0 }: { relationshipsCount?: number }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadInsight = async () => {
    setLoading(true);
    try {
      const data = await getInsight();
      setInsight(data.insight);
    } catch {
      setInsight('Não consegui gerar seu insight agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsight();
    // recarrega quando o número de relacionamentos muda
  }, [relationshipsCount]);

  return (
    <motion.div
      className="alert-widget"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="alert-icon">
        <Sparkles size={36} />
      </div>

      <h3>Insight da UNIA</h3>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
          <Loader2 size={20} style={{ opacity: 0.5, animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <p>{insight}</p>
      )}

      <button className="alert-btn" onClick={loadInsight} disabled={loading}>
        <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Atualizar insight
      </button>
    </motion.div>
  );
};
