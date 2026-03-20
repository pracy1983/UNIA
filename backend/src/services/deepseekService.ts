import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * Service to interact with DeepSeek API.
 */
export const deepseekService = {
  async chat(messages: any[]) {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    try {
      const response = await axios.post(
        `${DEEPSEEK_API_URL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message;
    } catch (error: any) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  async analyzeRelationship(pills: any[], memories: any[]) {
    const prompt = `
      Você é a inteligência artificial da UNIA, um PRM (Relational Management) premium.
      Analise os dados abaixo de um usuário e forneça um insight profundo ("Deep Insight").
      
      Perguntas Diárias (Pílulas):
      ${JSON.stringify(pills)}
      
      Memórias Recentes:
      ${JSON.stringify(memories)}
      
      Gere uma resposta curta (máximo 3 frases) com uma dica prática ou alerta emocional.
      Mantenha um tom acolhedor e observador.
    `;

    const messages = [
      { role: 'system', content: 'Você é um assistente especialista em relacionamentos.' },
      { role: 'user', content: prompt }
    ];

    return this.chat(messages);
  }
};
