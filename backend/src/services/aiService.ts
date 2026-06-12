import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Serviço de IA da UNIA.
 * Usa a OmniRoute (OpenAI-compatible, mesma infra do projeto de bot) como provedor
 * principal e o DeepSeek como fallback opcional, caso a OmniRoute falhe.
 */

const OMNIROUTE_BASE_URL = (process.env.OMNIROUTE_BASE_URL || 'https://omniroute-omniroute-app.vrdrcy.easypanel.host/v1').trim();
const OMNIROUTE_API_KEY = (process.env.OMNIROUTE_API_KEY || '').trim();
const OMNIROUTE_MODEL = (process.env.OMNIROUTE_MODEL || 'free-stack').trim();

const DEEPSEEK_API_URL = 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = (process.env.DEEPSEEK_API_KEY || '').trim();

if (!OMNIROUTE_API_KEY && !DEEPSEEK_API_KEY) {
  console.error('⚠️ CRITICAL: Nenhuma chave de IA configurada (OMNIROUTE_API_KEY ou DEEPSEEK_API_KEY). SOS e insights vão falhar.');
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const callOmniRoute = async (messages: ChatMessage[]): Promise<string> => {
  const response = await axios.post(
    `${OMNIROUTE_BASE_URL}/chat/completions`,
    { model: OMNIROUTE_MODEL, messages, temperature: 0.7 },
    {
      headers: { Authorization: `Bearer ${OMNIROUTE_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Resposta da OmniRoute em formato inválido.');
  return content;
};

const callDeepSeek = async (messages: ChatMessage[]): Promise<string> => {
  const response = await axios.post(
    `${DEEPSEEK_API_URL}/chat/completions`,
    { model: 'deepseek-chat', messages, temperature: 0.7 },
    {
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Resposta do DeepSeek em formato inválido.');
  return content;
};

export const aiService = {
  /**
   * Conversa com a IA. Retorna { role, content } no mesmo formato esperado
   * pelo controller de SOS. Tenta OmniRoute; se falhar e houver DeepSeek, usa o fallback.
   */
  async chat(messages: ChatMessage[]): Promise<{ role: 'assistant'; content: string }> {
    if (OMNIROUTE_API_KEY) {
      try {
        return { role: 'assistant', content: await callOmniRoute(messages) };
      } catch (error: any) {
        const msg = error.response?.data?.error?.message || error.message;
        console.error('OmniRoute falhou:', msg);
        if (!DEEPSEEK_API_KEY) throw error;
        console.warn('Tentando fallback DeepSeek...');
      }
    }

    if (DEEPSEEK_API_KEY) {
      return { role: 'assistant', content: await callDeepSeek(messages) };
    }

    throw new Error('Configuração de IA ausente (nenhuma API Key disponível).');
  },

  /**
   * Gera um "Deep Insight" sobre o estado relacional do usuário a partir das
   * pílulas diárias (humor) e memórias recentes.
   */
  async analyzeRelationship(pills: any[], memories: any[]): Promise<string> {
    const prompt = `
Você é a inteligência artificial da UNIA, um PRM (Personal Relationship Management) premium.
Analise os dados abaixo de um usuário e gere um insight curto e prático ("Deep Insight").

Humor recente (Pílulas do Dia): ${JSON.stringify(pills)}
Memórias recentes: ${JSON.stringify(memories)}

Responda em no máximo 2 frases, tom acolhedor e observador, com uma dica prática ou
um alerta emocional gentil. Não use markdown, não repita os dados brutos.`.trim();

    const result = await this.chat([
      { role: 'system', content: 'Você é um assistente especialista em relacionamentos, acolhedor e objetivo.' },
      { role: 'user', content: prompt },
    ]);

    return result.content.trim();
  },
};

// Alias de compatibilidade: código legado importa `deepseekService`.
export const deepseekService = aiService;
