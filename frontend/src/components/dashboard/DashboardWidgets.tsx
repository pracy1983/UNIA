import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Pílula do Dia: sem nomes fictícios.
// A pergunta será genérica enquanto não há dados reais de relacionamentos.
export const PillWidget = () => {
  const [selected, setSelected] = useState<string | null>(null);

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
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// AlertWidget: sem mencionar nomes fictícios.
// Exibe mensagem genérica até haver dados reais de relacionamentos.
export const AlertWidget = () => {
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

      <h3>Alerta UNIA: Previsão de Conexão Profunda!</h3>
      <p>
        Cadastre seus relacionamentos para receber previsões e alertas personalizados de IA.
      </p>

      <button className="alert-btn">
        Ver Detalhes
      </button>
    </motion.div>
  );
};
