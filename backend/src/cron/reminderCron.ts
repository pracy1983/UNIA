import cron from 'node-cron';
import { runDailyReminders } from '../services/reminderService.js';

/**
 * Agenda a rotina diária de lembretes WhatsApp.
 * Roda todo dia às 09:00 no fuso do servidor (America/Sao_Paulo).
 */
export const startReminderCron = (): void => {
  cron.schedule(
    '0 9 * * *',
    () => {
      runDailyReminders().catch((err) => console.error('[Reminders] Falha na execução agendada:', err));
    },
    { timezone: 'America/Sao_Paulo' }
  );

  console.log('⏰ Cron de lembretes WhatsApp agendado (diário às 09:00 America/Sao_Paulo).');
};
