import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';
import { deepseekService } from '../services/deepseekService.js';

/**
 * Trigger an SOS Event.
 * Provides immediate AI-guided emotional first aid.
 */
export const startMediation = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { relationshipId } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const initialMessage = {
            role: 'assistant',
            content: 'Olá. Me conte o que aconteceu...'
        };

        const result = await query(
            'INSERT INTO sos_sessions (user_id, relationship_id, advice_received, chat_history) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, relationshipId || null, '[]', JSON.stringify([initialMessage])]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error starting SOS mediation:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const sendMediationMessage = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Obter Sessão e Histórico
        const sessionRes = await query(
            'SELECT * FROM sos_sessions WHERE id = $1 AND user_id = $2',
            [sessionId, userId]
        );

        if (!sessionRes.rowCount || sessionRes.rowCount === 0) {
            return res.status(404).json({ message: 'Sessão não encontrada' });
        }

        const session = sessionRes.rows[0];
        const chatHistory = session.chat_history || [];

        // Adicionar a mensagem do usuário
        chatHistory.push({ role: 'user', content: message });

        // Montar Contexto
        let contextStr = "Contexto: O usuário está precisando de mediação ou conselho.";
        
        // Contexto de Personalidade
        const discovRes = await query(
            `    SELECT q.question_text, a.answer_content
                 FROM personality_answers a
                 JOIN personality_questions q ON a.question_id = q.id
                 WHERE a.user_id = $1`,
            [userId]
        );
        if (discovRes.rowCount && discovRes.rowCount > 0) {
            contextStr += "\\n\\nPerfil Psicológico do Usuário:";
            discovRes.rows.forEach(r => {
                contextStr += `\\n- Pergunta: "${r.question_text}" | Resposta: "${r.answer_content}"`;
            });
        }

        // Contexto de Relacionamento
        if (session.relationship_id) {
            const relRes = await query('SELECT title, type FROM relationships WHERE id = $1', [session.relationship_id]);
            if (relRes.rowCount && relRes.rowCount > 0) {
                contextStr += `\\n\\nRelacionamento Atual em Foco: ${relRes.rows[0].title} (${relRes.rows[0].type})`;
            }
        }

        const systemPrompt = `
Você é o mediador e terapeuta de relacionamentos hiper-experiente da UNIA.
Sua missão principal é ajudar a pacificar a situação, oferecer perspectiva madura e promover o diálogo construtivo.

Regras de Ouro:
1. Entenda as emoções do usuário, seja extremamente acolhedor e seguro.
2. Ajude a baixar a guarda e buscar soluções lógicas, nunca incentivando o ataque mútuo.
3. Leve o usuário a reflexões justas e coerentes fazendo perguntas estratégicas, uma de cada vez.
4. Use o "Perfil Psicológico do Usuário" (quando disponível) para entender de onde as dores estão vindo e aconselhar de maneira personalizada (ex: se a pessoa disse que a linguagem do amor é X, aborde sob esse prisma).
5. Respostas devem ser curtas, muito naturais e parecidas com chat online, NADA de respostas mecânicas ou divididas em muitos pontos secos - você é humano e atencioso.

${contextStr}
        `;

        // Prepara mensagens para Envio no Formato OpenAI/DeepSeek
        const messagesToSend = [
            { role: 'system', content: systemPrompt },
            ...chatHistory // Enviamos o histórico inteiro para a IA ter o contexto da conversa
        ];

        // Chamar IA
        const aiResponse = await deepseekService.chat(messagesToSend);

        // Adicionar resposta da IA ao histórico
        chatHistory.push({ role: 'assistant', content: aiResponse.content });

        // Atualizar DB
        await query(
            'UPDATE sos_sessions SET chat_history = $1 WHERE id = $2',
            [JSON.stringify(chatHistory), sessionId]
        );

        res.json({
            session: sessionRes.rows[0],
            response: aiResponse.content,
            chatHistory
        });
    } catch (err) {
        console.error('Error sending mediation message:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
