import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_URL = 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * Service to interact with DeepSeek API.
 */
export const deepseekService = {
  async chat(messages: any[]) {
    if (!DEEPSEEK_API_KEY) {
      console.error('CRITICAL: DEEPSEEK_API_KEY is missing from environment variables.');
      throw new Error('Configuração de IA ausente (API Key).');
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

      if (!response.data?.choices?.[0]?.message) {
        throw new Error('Resposta da IA em formato inválido.');
      }

      return response.data.choices[0].message;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error('DeepSeek API Error:', errorMsg);
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
