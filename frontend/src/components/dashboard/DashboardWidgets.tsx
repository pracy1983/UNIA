import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Pílula do Dia: salva a resposta no localStorage
export const PillWidget = () => {
  const [selected, setSelected] = useState<string | null>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`pill_${today}`);
    return saved || null;
  });

  const handleSelect = (option: string) => {
    setSelected(option);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`pill_${today}`, option);
  };

  return (
    <motion.div
      className="pill-widget"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3>Pílula do Dia</h3>

      <p className="pill-question">
        Como estão seus relacionamentos hoje?
      </p>

      <div className="pill-buttons">
        {['Excelente', 'Normal', 'Melhorável'].map((option) => (
          <button
            key={option}
            className={`pill-btn${selected === option ? ' selected' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {selected && (
        <p style={{
          marginTop: '12px',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center'
        }}>
          ✓ Resposta salva para hoje
        </p>
      )}
    </motion.div>
  );
};

// AlertWidget: mostra dados relevantes quando existirem relacionamentos
export const AlertWidget = ({ relationshipsCount = 0 }: { relationshipsCount?: number }) => {
  return (
    <motion.div
      className="alert-widget"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="alert-icon">
        <Sparkles size={36} />
      </div>

      {relationshipsCount > 0 ? (
        <>
          <h3>Alerta UNIA: Conexões Ativas!</h3>
          <p>
            Você tem {relationshipsCount} relacionamento{relationshipsCount > 1 ? 's' : ''} ativo{relationshipsCount > 1 ? 's' : ''}.
            Continue cultivando suas conexões para fortalecer seus laços.
          </p>
        </>
      ) : (
        <>
          <h3>Alerta UNIA: Previsão de Conexão Profunda!</h3>
          <p>
            Cadastre seus relacionamentos para receber previsões e alertas personalizados de IA.
          </p>
        </>
      )}

      <button className="alert-btn">
        Ver Detalhes
      </button>
    </motion.div>
  );
};
