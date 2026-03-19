import { motion } from 'framer-motion';
import { Sparkles, MoreHorizontal } from 'lucide-react';

export const PillWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-[32px] relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Pílula do Dia</h3>
        <button className="text-white/40"><MoreHorizontal size={20} /></button>
      </div>

      <p className="text-white/70 mb-8 max-w-[200px]">
        Qual te redin:·nseleiziona pois digundo?
      </p>

      {/* Buttons Grid 1, 2, 3 */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((num) => (
          <button 
            key={num}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 hover:bg-white/10 transition-all font-semibold"
          >
            {num}
          </button>
        ))}
      </div>

      <p className="text-white/50 text-sm mb-4">Qual te questo memanls?</p>

      {/* Name Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {['Nome 1', 'Nome 2', 'Nome 3', 'Nome 4'].map((name) => (
          <button 
            key={name}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-semibold hover:bg-white/10 transition-all"
          >
            {name}
          </button>
        ))}
      </div>

      <button className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-3 font-bold text-sm transition-all">
        Commistrar
      </button>
    </motion.div>
  );
};

export const AlertWidget = () => {
  const alerts = [
    { title: "Alerta de Conexão:", description: "Sugestão para reavivar a conexão com [Nome]!", time: "now" }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white/50">AI Predictive Alert</h3>
        <span className="text-xs text-white/30">now</span>
      </div>

      {alerts.map((alert, i) => (
        <motion.div 
          key={i}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass p-6 rounded-3xl flex gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/5 blur-[20px] rounded-full group-hover:blur-[30px] transition-all" />
          
          <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/10">
            <Sparkles size={24} className="text-[#FFD700]" />
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
            <p className="text-white/60 text-xs leading-relaxed">{alert.description}</p>
          </div>
        </motion.div>
      ))}

      {/* Stacked effect (mockup layers) */}
      <div className="absolute -bottom-2 -left-2 -right-2 h-10 glass opacity-40 rounded-3xl -z-10" />
      <div className="absolute -bottom-4 -left-4 -right-4 h-10 glass opacity-10 rounded-3xl -z-20" />
    </div>
  );
};
