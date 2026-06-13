import { query } from '../config/database.js';
import { sendWhatsAppMessage } from './whatsappService.js';

/**
 * Lembretes automáticos via WhatsApp (Evolution API).
 * Respeita a preferência settings.notify_whatsapp (default: ligado) e deduplica
 * envios através da tabela whatsapp_reminders_sent (uma reminder_key por usuário).
 */

const notifyEnabled = (settings: any): boolean => {
  if (!settings || typeof settings !== 'object') return true;
  return settings.notify_whatsapp !== false;
};

const alreadySent = async (userId: string, key: string): Promise<boolean> => {
  const r = await query(
    'SELECT 1 FROM whatsapp_reminders_sent WHERE user_id = $1 AND reminder_key = $2',
    [userId, key]
  );
  return (r.rowCount ?? 0) > 0;
};

const markSent = async (userId: string, key: string): Promise<void> => {
  await query(
    'INSERT INTO whatsapp_reminders_sent (user_id, reminder_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, key]
  );
};

const firstName = (name: string | null): string => (name || '').trim().split(' ')[0] || '';

/**
 * Aniversários de relacionamento que caem hoje → mensagem para o dono.
 */
const sendAnniversaryReminders = async (): Promise<number> => {
  const res = await query(`
    SELECT u.id AS user_id, u.phone, u.display_name, u.settings,
           r.id AS rel_id, r.title, r.started_at
    FROM relationships r
    JOIN relationship_members rm ON r.id = rm.relationship_id
    JOIN nodes n ON rm.node_id = n.id
    JOIN users u ON n.owner_id = u.id
    WHERE n.type = 'solo'
      AND COALESCE(r.is_archived, FALSE) = FALSE
      AND r.started_at IS NOT NULL
      AND EXTRACT(MONTH FROM r.started_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM r.started_at) = EXTRACT(DAY FROM CURRENT_DATE)
      AND u.phone IS NOT NULL AND u.phone <> ''
  `);

  let sent = 0;
  const year = new Date().getFullYear();

  for (const row of res.rows) {
    if (!notifyEnabled(row.settings)) continue;
    const key = `anniversary:${row.rel_id}:${year}`;
    if (await alreadySent(row.user_id, key)) continue;

    const years = year - new Date(row.started_at).getFullYear();
    const milestone = years > 0 ? ` Hoje faz *${years} ano${years > 1 ? 's' : ''}*! 🎉` : '';
    const hi = firstName(row.display_name);
    const msg = `💜 *UNIA*\n\n${hi ? hi + ', uma' : 'Uma'} data especial chegou: *${row.title}*.${milestone}\n\nQue tal registrar um novo momento ou planejar algo especial para celebrar essa conexão?`;

    const result = await sendWhatsAppMessage(row.phone, msg);
    if (result.success) {
      await markSent(row.user_id, key);
      sent++;
    }
    // pequeno intervalo anti-bloqueio entre envios
    await new Promise((r) => setTimeout(r, 1200));
  }

  return sent;
};

/**
 * Reengajamento: usuários com WhatsApp que não registram a Pílula do Dia há 3+
 * dias recebem um lembrete gentil (no máximo uma vez por semana).
 */
const sendReengagementReminders = async (): Promise<number> => {
  const res = await query(`
    SELECT u.id AS user_id, u.phone, u.display_name, u.settings,
           MAX(p.created_at) AS last_pill
    FROM users u
    LEFT JOIN daily_pills p ON p.user_id = u.id
    WHERE u.phone IS NOT NULL AND u.phone <> '' AND u.whatsapp_verified = TRUE
    GROUP BY u.id, u.phone, u.display_name, u.settings
    HAVING MAX(p.created_at) IS NULL OR MAX(p.created_at) < NOW() - INTERVAL '3 days'
  `);

  let sent = 0;
  // chave por semana ISO para não repetir mais de 1x/semana
  const now = new Date();
  const weekKey = `${now.getFullYear()}-W${Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7)}`;

  for (const row of res.rows) {
    if (!notifyEnabled(row.settings)) continue;
    const key = `reengage:${weekKey}`;
    if (await alreadySent(row.user_id, key)) continue;

    const hi = firstName(row.display_name);
    const msg = `💜 *UNIA*\n\n${hi ? hi + ', sentimos' : 'Sentimos'} sua falta! Como estão seus relacionamentos hoje?\n\nAbra o app e registre sua *Pílula do Dia* — leva 5 segundos e ajuda a IA a te dar insights melhores. 🌱`;

    const result = await sendWhatsAppMessage(row.phone, msg);
    if (result.success) {
      await markSent(row.user_id, key);
      sent++;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  return sent;
};

/**
 * Executa todos os lembretes do dia. Retorna um resumo dos envios.
 */
export const runDailyReminders = async (): Promise<{ anniversaries: number; reengagement: number }> => {
  console.log('⏰ [Reminders] Iniciando rotina diária de lembretes...');
  let anniversaries = 0;
  let reengagement = 0;

  try {
    anniversaries = await sendAnniversaryReminders();
  } catch (err) {
    console.error('[Reminders] Erro nos aniversários:', err);
  }

  try {
    reengagement = await sendReengagementReminders();
  } catch (err) {
    console.error('[Reminders] Erro no reengajamento:', err);
  }

  console.log(`✅ [Reminders] Concluído. Aniversários: ${anniversaries}, Reengajamento: ${reengagement}`);
  return { anniversaries, reengagement };
};
