import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, ArrowRight, ArrowLeft, Calendar, IdCard, MessageCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCPF, validateCPF, formatPhone, validatePhone } from '../utils/validation';

type Step = 'phone' | 'code' | 'register';

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
  }, [step]);

  const requestCode = async () => {
    if (!validatePhone(phone)) {
      setError('Informe um WhatsApp válido com DDD. Ex: (11) 98888-7777');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const response = await api.post('/auth/whatsapp/request-code', { phone });
      setUserExists(response.data.userExists);
      setStep('code');
      setCode('');
      setResendIn(60);
      setInfo('Código enviado! Confira seu WhatsApp. 📱');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (extraData: Record<string, string> = {}) => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const response = await api.post('/auth/whatsapp/verify', { phone, code, ...extraData });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.needsRegistration) {
        // Código válido, mas é um número novo: completar cadastro
        setStep('register');
        setInfo('Número verificado! Complete seu cadastro para começar. ✨');
      } else {
        setError(data?.message || 'Código inválido. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'phone') {
      await requestCode();
      return;
    }

    if (step === 'code') {
      if (code.replace(/\D/g, '').length !== 6) {
        setError('O código tem 6 dígitos.');
        return;
      }
      await verifyCode();
      return;
    }

    // Cadastro
    if (!fullName.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!email.trim()) {
      setError('O e-mail é obrigatório.');
      return;
    }
    if (cpf && !validateCPF(cpf)) {
      setError('CPF inválido. Verifique os números.');
      return;
    }
    await verifyCode({ fullName, displayName, email, cpf, birthDate });
  };

  const backToPhone = () => {
    setStep('phone');
    setCode('');
    setError('');
    setInfo('');
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
            {step === 'phone' && 'Entre com seu WhatsApp para acessar seu universo'}
            {step === 'code' && (userExists ? 'Bem-vindo de volta! Digite o código enviado' : 'Digite o código enviado no seu WhatsApp')}
            {step === 'register' && 'Falta pouco! Complete seu cadastro'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="step-phone"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div className="input-group">
                  <MessageCircle size={18} className="input-icon" />
                  <input
                    type="tel"
                    placeholder="Seu WhatsApp com DDD"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="input-field"
                    autoComplete="tel"
                    required
                  />
                </div>
              </motion.div>
            )}

            {step === 'code' && (
              <motion.div
                key="step-code"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div className="input-group">
                  <KeyRound size={18} className="input-icon" />
                  <input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field"
                    style={{ letterSpacing: '6px', textAlign: 'center', fontSize: '18px' }}
                    autoComplete="one-time-code"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={requestCode}
                  disabled={loading || resendIn > 0}
                  className="btn-link"
                >
                  {resendIn > 0 ? `Reenviar código em ${resendIn}s` : 'Reenviar código'}
                </button>
              </motion.div>
            )}

            {step === 'register' && (
              <motion.div
                key="step-register"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
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
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="E-mail (obrigatório)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <IdCard size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="CPF"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    className="input-field"
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
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {info && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: '#34c759', fontSize: '14px' }}
            >
              {info}
            </motion.p>
          )}

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
            {loading
              ? 'Carregando...'
              : step === 'phone'
                ? 'Receber código no WhatsApp'
                : step === 'code'
                  ? 'Verificar código'
                  : 'Criar Conta'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          {step !== 'phone' && (
            <button onClick={backToPhone} className="btn-link" type="button">
              <ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Usar outro número
            </button>
          )}
        </div>

        <div className="auth-decoration" />
      </motion.div>
    </div>
  );
};

export default LoginPage;
