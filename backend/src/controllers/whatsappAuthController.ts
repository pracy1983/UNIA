import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { validateCPF } from '../utils/validation.js';
import { formatPhoneNumber, sendWhatsAppMessage } from '../services/whatsappService.js';

const OTP_EXPIRATION_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_REQUESTS_PER_WINDOW = 3;
const OTP_REQUEST_WINDOW_MINUTES = 10;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET não definido no ambiente. Usando fallback inseguro — configure no Easypanel!');
    return 'fallback_secret';
  }
  return secret;
};

const signToken = (user: { id: string; email: string; phone?: string }) =>
  jwt.sign({ id: user.id, email: user.email, phone: user.phone }, getJwtSecret(), { expiresIn: '7d' });

const generateOtpCode = (): string => String(crypto.randomInt(100000, 1000000));

/**
 * POST /api/auth/whatsapp/request-code
 * Body: { phone }
 * Envia um código de 6 dígitos via WhatsApp. Retorna se o usuário já existe
 * (para o frontend decidir entre login direto ou formulário de cadastro).
 */
export const requestWhatsAppCode = async (req: Request, res: Response) => {
  const phone = formatPhoneNumber(req.body?.phone);

  if (!phone) {
    return res.status(400).json({ message: 'Informe um número de WhatsApp válido com DDD. Ex: (11) 98888-7777' });
  }

  try {
    // Rate limit: máximo de códigos por telefone na janela
    const recent = await query(
      `SELECT COUNT(*)::int AS count FROM whatsapp_otps
       WHERE phone = $1 AND created_at > NOW() - ($2 || ' minutes')::interval`,
      [phone, OTP_REQUEST_WINDOW_MINUTES]
    );
    if (recent.rows[0].count >= OTP_MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ message: 'Muitos códigos solicitados. Aguarde alguns minutos e tente novamente.' });
    }

    const code = generateOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Invalida códigos anteriores pendentes deste telefone
    await query('DELETE FROM whatsapp_otps WHERE phone = $1 AND verified = FALSE', [phone]);
    await query(
      'INSERT INTO whatsapp_otps (phone, code_hash, expires_at) VALUES ($1, $2, $3)',
      [phone, codeHash, expiresAt]
    );

    const sendResult = await sendWhatsAppMessage(
      phone,
      `💜 *UNIA*\n\nSeu código de acesso é: *${code}*\n\nEle expira em ${OTP_EXPIRATION_MINUTES} minutos. Se você não solicitou, ignore esta mensagem.`
    );

    if (!sendResult.success) {
      return res.status(502).json({ message: `Não foi possível enviar o código: ${sendResult.message}` });
    }

    const userCheck = await query('SELECT id FROM users WHERE phone = $1', [phone]);

    res.json({
      message: 'Código enviado para seu WhatsApp!',
      userExists: (userCheck.rowCount ?? 0) > 0,
      expiresInSeconds: OTP_EXPIRATION_MINUTES * 60,
    });
  } catch (err) {
    console.error('[WhatsApp Auth] Erro ao solicitar código:', err);
    res.status(500).json({ message: 'Erro interno ao solicitar código.' });
  }
};

/**
 * Valida o código OTP do telefone. Um código já verificado continua aceito
 * até expirar, pois o fluxo de cadastro faz duas chamadas de verify
 * (a primeira valida o número, a segunda envia os dados do cadastro).
 * Após login/cadastro concluído, o código é apagado em finalizeOtp().
 */
const checkOtp = async (phone: string, code: string): Promise<{ ok: boolean; otpId?: string; message?: string }> => {
  const result = await query(
    'SELECT * FROM whatsapp_otps WHERE phone = $1 ORDER BY created_at DESC LIMIT 1',
    [phone]
  );

  if (!result.rowCount) {
    return { ok: false, message: 'Nenhum código pendente. Solicite um novo código.' };
  }

  const otp = result.rows[0];

  if (new Date(otp.expires_at) < new Date()) {
    return { ok: false, message: 'Código expirado. Solicite um novo código.' };
  }

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, message: 'Muitas tentativas incorretas. Solicite um novo código.' };
  }

  const isMatch = await bcrypt.compare(String(code), otp.code_hash);
  if (!isMatch) {
    await query('UPDATE whatsapp_otps SET attempts = attempts + 1 WHERE id = $1', [otp.id]);
    return { ok: false, message: 'Código incorreto. Verifique e tente novamente.' };
  }

  await query('UPDATE whatsapp_otps SET verified = TRUE WHERE id = $1', [otp.id]);
  return { ok: true, otpId: otp.id };
};

const finalizeOtp = async (otpId: string) => {
  await query('DELETE FROM whatsapp_otps WHERE id = $1', [otpId]);
};

/**
 * POST /api/auth/whatsapp/verify
 * Body: { phone, code } para login.
 * Body: { phone, code, fullName, email, displayName?, cpf?, birthDate? } para cadastro.
 * Verifica o código; se o telefone já tem conta, faz login. Caso contrário,
 * exige os dados de cadastro (e-mail obrigatório) e cria a conta.
 */
export const verifyWhatsAppCode = async (req: Request, res: Response) => {
  const phone = formatPhoneNumber(req.body?.phone);
  const { code, fullName, displayName, email, cpf, birthDate } = req.body || {};

  if (!phone || !code) {
    return res.status(400).json({ message: 'Telefone e código são obrigatórios.' });
  }

  try {
    const otpResult = await checkOtp(phone, code);
    if (!otpResult.ok) {
      return res.status(400).json({ message: otpResult.message });
    }

    // Login: usuário já existe para este telefone
    const existing = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (existing.rowCount && existing.rowCount > 0) {
      const user = existing.rows[0];
      await query('UPDATE users SET whatsapp_verified = TRUE WHERE id = $1', [user.id]);
      await finalizeOtp(otpResult.otpId!);

      return res.json({
        user: { id: user.id, email: user.email, displayName: user.display_name, phone: user.phone },
        token: signToken({ id: user.id, email: user.email, phone: user.phone }),
        isNewUser: false,
      });
    }

    // Cadastro: exige os dados (e-mail obrigatório, mesmo sendo auth via WhatsApp)
    if (!fullName || !email) {
      return res.status(422).json({
        message: 'Telefone verificado! Complete o cadastro: nome completo e e-mail são obrigatórios.',
        needsRegistration: true,
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'E-mail inválido.' });
    }

    if (cpf && !validateCPF(cpf)) {
      return res.status(400).json({ message: 'CPF inválido. Verifique os números.' });
    }

    const duplicate = await query(
      'SELECT id FROM users WHERE email = $1 OR ($2::text IS NOT NULL AND cpf = $2)',
      [email, cpf || null]
    );
    if (duplicate.rowCount && duplicate.rowCount > 0) {
      return res.status(400).json({ message: 'E-mail ou CPF já cadastrado em outra conta.' });
    }

    const result = await query(
      `INSERT INTO users (email, phone, whatsapp_verified, display_name, full_name, cpf, birth_date)
       VALUES ($1, $2, TRUE, $3, $4, $5, $6)
       RETURNING id, email, phone, display_name, full_name, cpf, birth_date`,
      [email, phone, displayName || fullName, fullName, cpf || null, birthDate || null]
    );

    const newUser = result.rows[0];
    await query('INSERT INTO nodes (owner_id, name, type) VALUES ($1, $2, $3)', [newUser.id, 'Meu Cantinho', 'solo']);
    await finalizeOtp(otpResult.otpId!);

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email, displayName: newUser.display_name, phone: newUser.phone },
      token: signToken({ id: newUser.id, email: newUser.email, phone: newUser.phone }),
      isNewUser: true,
    });
  } catch (err) {
    console.error('[WhatsApp Auth] Erro ao verificar código:', err);
    res.status(500).json({ message: 'Erro interno ao verificar código.' });
  }
};
