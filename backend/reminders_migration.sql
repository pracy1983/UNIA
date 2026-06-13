-- Lembretes WhatsApp: deduplicação de envios
CREATE TABLE IF NOT EXISTS whatsapp_reminders_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_key TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, reminder_key)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_user ON whatsapp_reminders_sent (user_id, reminder_key);
