import axios from 'axios';

/**
 * Integração com a Evolution API para envio de mensagens WhatsApp.
 * Infra compartilhada com o projeto Nosso Templo (mesma instância Easypanel).
 */

const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || 'https://pracy-evolution-api.vrdrcy.easypanel.host').trim();
const EVOLUTION_INSTANCE = (process.env.EVOLUTION_INSTANCE || 'PracyAT2').trim();
// A chave NUNCA deve ser commitada: o repositório é público. Configure EVOLUTION_API_KEY no Easypanel.
const EVOLUTION_API_KEY = (process.env.EVOLUTION_API_KEY || '').trim();

if (!EVOLUTION_API_KEY) {
  console.error('⚠️ CRITICAL: EVOLUTION_API_KEY não definida — o envio de códigos WhatsApp vai falhar. Configure no Easypanel.');
}

/**
 * Normaliza telefone brasileiro para o formato internacional do WhatsApp.
 * Ex: (11) 98479-1928 -> 5511984791928. Retorna '' se inválido.
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';

  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return '';

  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  if (!cleaned.startsWith('55') && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = '55' + cleaned;
  }

  // 55 + DDD (2) + número (8 ou 9 dígitos)
  if (!cleaned.startsWith('55') || (cleaned.length !== 12 && cleaned.length !== 13)) {
    return '';
  }

  return cleaned;
};

export const isValidPhoneNumber = (phone: string | null | undefined): boolean => {
  return formatPhoneNumber(phone) !== '';
};

/**
 * Envia mensagem de texto via Evolution API.
 * @param phone Telefone já normalizado (5511...) ou em formato brasileiro.
 */
export const sendWhatsAppMessage = async (
  phone: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  const formattedPhone = formatPhoneNumber(phone);

  if (!formattedPhone) {
    return { success: false, message: `Número de telefone inválido para WhatsApp: ${phone || '(vazio)'}` };
  }

  if (!EVOLUTION_API_KEY) {
    return { success: false, message: 'Servidor sem EVOLUTION_API_KEY configurada. Avise o administrador.' };
  }

  try {
    await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        number: formattedPhone,
        text: message,
        linkPreview: false,
        delay: 1000,
      },
      {
        headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
        timeout: 15000,
      }
    );

    return { success: true, message: 'Mensagem enviada com sucesso!' };
  } catch (error: any) {
    const status = error?.response?.status;
    let errorMessage = error?.response?.data?.message || error?.message || 'Erro ao enviar mensagem WhatsApp.';

    if (status === 400) {
      errorMessage = `Número ${formattedPhone} inválido ou não cadastrado no WhatsApp.`;
    } else if (status === 401 || status === 403) {
      errorMessage = 'Erro de autenticação na Evolution API. Verifique a API Key ou se a instância está conectada.';
    } else if (status === 404) {
      errorMessage = 'Instância do WhatsApp não encontrada no servidor Evolution.';
    } else if (status >= 500) {
      errorMessage = 'Erro interno no servidor da Evolution API.';
    }

    console.error('[WhatsApp] Falha no envio:', { status, phone: formattedPhone, error: errorMessage });
    return { success: false, message: errorMessage };
  }
};
