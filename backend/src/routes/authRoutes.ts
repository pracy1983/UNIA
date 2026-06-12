import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { requestWhatsAppCode, verifyWhatsAppCode } from '../controllers/whatsappAuthController.js';

const router = Router();

// Fluxo principal: autenticação via WhatsApp (OTP)
router.post('/whatsapp/request-code', requestWhatsAppCode);
router.post('/whatsapp/verify', verifyWhatsAppCode);

// Legado: e-mail/senha (mantido para contas antigas)
router.post('/register', register);
router.post('/login', login);

export default router;
