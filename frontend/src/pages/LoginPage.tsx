import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Calendar, IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCPF, validateCPF } from '../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação extra para registro
    if (!isLogin) {
      if (!validateCPF(cpf)) {
        setError('CPF inválido. Verifique os números.');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email, password } 
        : { email, password, displayName, fullName, cpf, birthDate };
      const response = await api.post(endpoint, payload);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="auth-logo-container"
          >
            <img src="/assets/logo.png" alt="UNIA Logo" className="auth-logo" />
          </motion.div>
          <p className="auth-subtitle">
            {isLogin ? 'Bem-vindo de volta ao seu universo' : 'Comece sua jornada de conexão'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}
              >
                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Seu Nome Real (obrigatório)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nome Social / Apelido"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <IdCard size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="CPF (obrigatório)"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="error-message"
              style={{ color: '#ff3b30' }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="btn-link"
          >
            {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já tem conta? Faça login'}
          </button>
        </div>

        <div className="auth-decoration" />
      </motion.div>
    </div>
  );
};

export default LoginPage;
