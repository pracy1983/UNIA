import { useState } from 'react';
import { motion } from 'framer-motion';

interface RelationshipCardProps {
  id: string;
  type: string;
  status: string;
  level: number;
  xp: number;
  percentage: number;
  progressValue: number;
  avatars?: string[];
  color?: string;
  onClick?: () => void;
}


const RelationshipCard: React.FC<RelationshipCardProps> = ({
  type,
  level,
  percentage,
  progressValue,
  avatars = [],
  color = 'linear-gradient(90deg, #FF7E5F, #FEB47B)',
  onClick,
}) => {
  // Tradução dos tipos
  const typeLabels: Record<string, string> = {
    solo: 'Solo',
    dating: 'Namoro',
    marriage: 'Casamento',
    poly: 'Poliamoroso',
    open: 'Relacionamento Aberto',
    friendship: 'Amizade'
  };

  const displayName = typeLabels[type] || type;

  return (
    <motion.div
      className="rel-card"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="rel-card-top">
        <div className="rel-avatars">
          {avatars.map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
          {avatars.length === 0 && (
            <div style={{
              width: 42, height: 42,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)'
            }}>
              {displayName[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <span className="rel-card-name">{displayName}</span>
      </div>

      <div className="rel-card-meta">
        <span>Nível {level} - {percentage}%</span>
        <span>{progressValue}%</span>
      </div>

      <div className="rel-progress-bar">
        <motion.div
          className="rel-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
};

export default RelationshipCard;
