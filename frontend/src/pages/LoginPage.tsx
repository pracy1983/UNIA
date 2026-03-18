import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { email, password, displayName };
      const response = await axios.post(endpoint, payload);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');    } catch (err: any) {
      setError(err.response?.data?.message || 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ 
              display: 'inline-flex', 
              padding: '12px', 
              borderRadius: '50%', 
              background: 'rgba(255, 51, 102, 0.1)',
              marginBottom: '16px'
            }}
          >
            <Heart size={32} color="var(--primary)" fill="var(--primary)" />
          </motion.div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>UNIA</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? 'Bem-vindo de volta ao seu universo' : 'Comece sua jornada de conexão'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: '16px', position: 'relative' }}
              >
                <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-light)',
                    border: '1px solid var(--glass-border)',
                    color: 'white',
                    outline: 'none'
                  }}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-light)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-light)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ 
              background: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já tem conta? Faça login'}
          </button>
        </div>

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '100px',
          height: '100px',
          background: 'var(--secondary)',
          filter: 'blur(60px)',
          opacity: 0.2,
          pointerEvents: 'none'
        }} />
      </motion.div>
    </div>
  );
};

export default LoginPage;
