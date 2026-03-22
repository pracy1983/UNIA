import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRelationshipByInvite, acceptInvite, Relationship } from '../services/api';
import { Heart, CheckCircle, ArrowRight } from 'lucide-react';

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [rel, setRel] = useState<Relationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getRelationshipByInvite(token)
      .then(setRel)
      .catch(() => setError('Convite inválido ou expirado.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    try {
      const res = await acceptInvite(token);
      navigate(`/relationship/${res.relationshipId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao aceitar convite.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !rel) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
           <h2 style={{ color: '#FF7E5F' }}>Ops!</h2>
           <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{error || 'Não encontramos este convite.'}</p>
           <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ marginTop: '20px' }}>
             Ir para Dashboard
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <div className="empty-icon-glow" style={{ margin: '0 auto 24px' }}>
          <Heart size={48} color="var(--primary)" />
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Convite Recebido!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          <strong>{rel.title}</strong> convidou você para cultivar esta conexão no UNIA.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
           <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tipo de Conexão:</p>
           <p style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>{rel.type}</p>
        </div>

        <button 
          onClick={handleAccept} 
          className="btn-primary-glow" 
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={accepting}
        >
          {accepting ? 'Conectando...' : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Aceitar Convite <CheckCircle size={18} />
            </span>
          )}
        </button>

        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn-link" 
          style={{ marginTop: '20px' }}
        >
          Recusar e ir para Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default InvitePage;
