import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Sparkles, Send } from 'lucide-react';
import { startMediation, sendMediationMessage } from '../../services/api';

interface SOSButtonProps {
  relationshipId?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ relationshipId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'breathe' | 'chat'>('breathe');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('breathe');
        setMessage('');
        setChatHistory([]);
        setSessionId(null);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const session = await startMediation(relationshipId);
      setSessionId(session.id);
      setChatHistory(session.chat_history || [{ role: 'assistant', content: 'Olá. Me conte o que aconteceu...' }]);
      setStep('chat');
    } catch (error) {
      console.error('Error starting mediation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;
    
    // Optimistic UI
    const newMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      const res = await sendMediationMessage(sessionId, newMessage.content);
      setChatHistory(res.chatHistory);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="sos-floating-btn"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <AlertCircle size={28} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="modal-overlay" onClick={() => setIsOpen(false)}>
            <motion.div
              className="modal-content sos-modal"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={20} />
                  <h3 className="font-bold">Mediação SOS</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="sos-body">
                {step === 'breathe' && (
                  <motion.div 
                    className="flex flex-col items-center justify-center p-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="breathe-circle"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <h4 className="text-xl font-bold mb-2">Respire comigo...</h4>
                    <p className="text-muted-foreground mb-6">Inale por 4 segundos, segure, e solte devagar.</p>
                    <button 
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      onClick={handleStartChat}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="loader-small" />
                      ) : (
                        <>Estou mais calmo, quero conversar</>
                      )}
                    </button>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', height: '400px' }}
                  >
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {chatHistory.map((msg, i) => (
                        <div key={i} style={{ 
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                          borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                          maxWidth: '85%',
                          color: msg.role === 'user' ? '#fff' : 'var(--text-light)',
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                          border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                          {msg.content}
                        </div>
                      ))}
                      {loading && (
                        <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Pensando...</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="input-field"
                        style={{ flex: 1 }}
                        disabled={loading}
                      />
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={handleSendMessage}
                        disabled={loading || !message.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
