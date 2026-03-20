import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Sparkles } from 'lucide-react';
import { triggerSOS } from '../../services/api';

interface SOSButtonProps {
  relationshipId?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ relationshipId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'breathe' | 'input' | 'advice'>('breathe');
  const [message, setMessage] = useState('');
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('breathe');
        setMessage('');
        setAdvice([]);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const response = await triggerSOS(relationshipId, message);
      setAdvice(response.advice);
      setStep('advice');
    } catch (error) {
      setAdvice(['Respire fundo.', 'Tente se afastar da situação por 5 minutos.', 'Aguarde um momento antes de responder.']);
      setStep('advice');
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
                      className="btn-primary w-full"
                      onClick={() => setStep('input')}
                    >
                      Estou um pouco melhor
                    </button>
                  </motion.div>
                )}

                {step === 'input' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="mb-4 text-center">O que está acontecendo agora?</p>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Descreva brevemente a situação ou como se sente..."
                      className="sos-textarea mb-4"
                      rows={4}
                    />
                    <button 
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      onClick={handleTrigger}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="loader-small" />
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Pedir Ajuda IA
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {step === 'advice' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h4 className="font-bold mb-4 text-center text-primary">3 Passos para agora:</h4>
                    <div className="flex flex-col gap-4">
                      {advice.map((item, index) => (
                        <motion.div 
                          key={index}
                          className="advice-card"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.2 }}
                        >
                          <span className="advice-number">{index + 1}</span>
                          <p>{item}</p>
                        </motion.div>
                      ))}
                    </div>
                    <button 
                      className="btn-secondary w-full mt-8"
                      onClick={() => setIsOpen(false)}
                    >
                      Vou tentar isso. Obrigado.
                    </button>
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
