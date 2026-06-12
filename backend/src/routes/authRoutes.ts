import { Router } from 'express';
import { requestWhatsAppCode, verifyWhatsAppCode } from '../controllers/whatsappAuthController.js';

const router = Router();

// Autenticação via WhatsApp (OTP) — único fluxo suportado
router.post('/whatsapp/request-code', requestWhatsAppCode);
router.post('/whatsapp/verify', verifyWhatsAppCode);

export default router;
