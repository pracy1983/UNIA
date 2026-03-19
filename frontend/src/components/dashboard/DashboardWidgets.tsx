import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const PillWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 rounded-[32px] flex flex-col gap-6 border border-white/10"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">Pílula do Dia</h3>
        <div className="h-[1px] w-full bg-white/5" />
      </div>

      <p className="text-white/70 text-center text-sm px-4">
        Como foi sua conexão com Sofia hoje?
      </p>

      <div className="flex flex-col gap-3">
        {['Excelente', 'Normal', 'Melhorável'].map((option) => (
          <button 
            key={option}
            className="w-full py-3 rounded-full border border-white/20 bg-white/5 text-white/80 font-medium hover:bg-white/10 hover:border-white/40 transition-all text-sm"
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export const AlertWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 rounded-[32px] flex flex-col items-center text-center gap-6 border border-white/10 relative overflow-hidden group shadow-[0_0_40px_rgba(255,126,95,0.1)]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all" />
      
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
        <Sparkles size={32} className="text-primary" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white max-w-[240px]">
          Alerta UNIA: Previsão de Conexão Profunda!
        </h3>
        <p className="text-white/50 text-sm max-w-[260px]">
          Sugerimos um encontro com Pedro neste fim de semana.
        </p>
      </div>

      <button className="px-10 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all">
        Ver Detalhes
      </button>
    </motion.div>
  );
};
