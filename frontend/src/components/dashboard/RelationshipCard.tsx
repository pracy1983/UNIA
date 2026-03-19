import React from 'react';
import { motion } from 'framer-motion';

interface RelationshipCardProps {
  name: string;
  type: string;
  level: string;
  percentage: number;
  avatar?: string;
  color?: string;
}

const RelationshipCard: React.FC<RelationshipCardProps> = ({ 
  name, 
  type, 
  level, 
  percentage, 
  avatar,
  color = '#FF7E5F'
}) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass rounded-[24px] p-6 flex items-center gap-6"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 bg-white/5 flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold opacity-30">{name[0]}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-sm text-white/50">{type}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/40 block">Relacionamento level · {level}</span>
            <span className="text-xs text-white/40">50%</span>
          </div>
        </div>

        <div className="progress-container h-[10px] bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.2) 100%)` 
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RelationshipCard;
