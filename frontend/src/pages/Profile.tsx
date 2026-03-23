import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, User, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, Profile as ProfileType } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Partial<ProfileType>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setProfile({ ...profile, photo_url: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.cpf) {
      setError('O CPF é obrigatório.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateProfile(profile);
      alert('Perfil atualizado com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="app-layout" style={{ justifyContent: 'center' }}><div className="loader-small" /></div>;

  return (
    <div className="app-layout" style={{ display: 'block', maxWidth: '600px', margin: '0 auto', overflowY: 'auto' }}>
      <div className="rel-detail-header" style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/dashboard')} className="modal-close" style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Meu Perfil</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card" style={{ padding: '24px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div className="rel-avatar-large" style={{ position: 'relative', width: '100px', height: '100px' }}>
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="Profile" style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                  <User size={40} />
                </div>
              )}
              <label 
                style={{ position: 'absolute', bottom: 0, right: 0, padding: '8px', background: 'var(--primary)', borderRadius: '50%', border: '3px solid #0f1223', cursor: 'pointer' }} 
                title="Mudar Foto"
              >
                <Camera size={14} color="white" />
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nome Completo</label>
            <input type="text" name="display_name" value={profile.display_name || ''} onChange={handleChange} className="login-input" placeholder="Seu nome" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>E-mail</label>
            <input type="email" name="email" value={profile.email || ''} onChange={handleChange} className="login-input" placeholder="seu@email.com" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>CPF <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" name="cpf" value={profile.cpf || ''} onChange={handleChange} className="login-input" placeholder="000.000.000-00" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Data de Nascimento</label>
            <input type="date" name="birth_date" value={profile.birth_date ? profile.birth_date.split('T')[0] : ''} onChange={handleChange} className="login-input" />
          </div>

          <button type="submit" className="btn-primary-glow" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={saving}>
            {saving ? <div className="loader-small" /> : <><Save size={18} /> Salvar Perfil</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
