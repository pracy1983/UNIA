import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, User, Save, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, Profile as ProfileType } from '../services/api';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';
import { validateCPF, formatCPF } from '../utils/validation';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Partial<ProfileType>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      const formatted = formatCPF(value);
      setProfile({ ...profile, [name]: formatted });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setZoom(1);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setProfile({ ...profile, photo_url: croppedImage });
      setShowCropper(false);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      setError('Erro ao processar imagem.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validação de CPF
    if (!profile.cpf) {
      setError('O CPF é obrigatório.');
      return;
    }

    if (!validateCPF(profile.cpf)) {
      setError('CPF inválido. Por favor, confira os números.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(profile);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="loader-premium" />
    </div>
  );

  // Considera o CPF "definido" se ele existir no banco (vindo do backend)
  // Mas o usuário quer poder editar se estiver vazio.
  const isCpfLocked = !!profile.id && !!profile.cpf && profile.cpf.length > 0;

  return (
    <div className="content-area" style={{ overflowY: 'auto', padding: '20px' }}>
      <div className="profile-container">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => navigate('/dashboard')} className="notif-btn" style={{ borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Meu Perfil</h1>
        </div>

        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-header">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-large">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt="Profile" />
                ) : (
                  <User size={48} color="var(--text-muted)" />
                )}
              </div>
              <label className="photo-edit-btn" title="Mudar Foto">
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              {profile.photo_url && (
                <button 
                  onClick={() => setProfile({...profile, photo_url: ''})} 
                  className="photo-edit-btn" 
                  style={{ right: 'auto', left: 4, background: 'rgba(255,59,48,0.8)' }}
                  title="Remover Foto"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{profile.display_name || 'Seu Nome'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profile.email}</p>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="error-message" 
                  style={{ background: 'rgba(255,59,48,0.1)', padding: '12px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="success-animation" 
                  style={{ background: 'rgba(52,199,89,0.1)', color: '#34C759', padding: '12px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <CheckCircle size={18} />
                  <span>Perfil atualizado com sucesso! Redirecionando...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="profile-section">
              <h3 className="profile-section-title">Informações Pessoais</h3>
              <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-container">
                  <label>Nome Social / Apelido</label>
                  <input 
                    type="text" 
                    name="display_name" 
                    value={profile.display_name || ''} 
                    onChange={handleChange} 
                    className="premium-input" 
                    placeholder="Como quer ser chamado" 
                    required 
                  />
                </div>
                <div className="input-container">
                  <label>Data de Nascimento</label>
                  <input 
                    type="date" 
                    name="birth_date" 
                    value={profile.birth_date ? profile.birth_date.split('T')[0] : ''} 
                    onChange={handleChange} 
                    className="premium-input" 
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3 className="profile-section-title">Documentação & Registro</h3>
              <div className="input-container">
                <label>Nome Completo (Real)</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={profile.full_name || ''} 
                  onChange={handleChange} 
                  className="premium-input" 
                  placeholder="Seu nome completo para o sistema" 
                  required 
                />
              </div>
              
              <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="input-container">
                  <label>CPF *</label>
                  <input 
                    type="text" 
                    name="cpf" 
                    value={profile.cpf || ''} 
                    onChange={handleChange} 
                    className="premium-input" 
                    placeholder="000.000.000-00" 
                    required 
                    disabled={isCpfLocked}
                  />
                  {isCpfLocked && <p className="cpf-lock-msg">O CPF não pode ser alterado após definido.</p>}
                </div>
                <div className="input-container">
                  <label>E-mail de Acesso</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profile.email || ''} 
                    onChange={handleChange} 
                    className="premium-input" 
                    placeholder="seu@email.com" 
                    required 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary-glow" 
              style={{ padding: '16px', fontSize: '1rem', marginTop: '20px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} 
              disabled={saving}
            >
              {saving ? <div className="loader-small" /> : <><Save size={20} /> Salvar Alterações</>}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Cropper Modal */}
      <AnimatePresence>
        {showCropper && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ zIndex: 2000 }}
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
                  >
                    Cortar e Usar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
