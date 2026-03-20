import { useState } from 'react';
import { motion } from 'framer-motion';

interface RelationshipCardProps {
  id: number;
  title: string;
  type: string;
  status: string;
  level: number;
  xp: number;
  percentage: number;
  progressValue: number;
  avatars?: string[];
  color?: string;
}

const RelationshipCard: React.FC<RelationshipCardProps> = ({
  title,
  type,
  level,
  percentage,
  progressValue,
  avatars = [],
  color = 'linear-gradient(90deg, #FF7E5F, #FEB47B)'
}) => {
  // Tradução dos tipos
  const typeLabels: Record<string, string> = {
    dating: 'Namoro',
    marriage: 'Casamento',
    friendship: 'Amizade',
    family: 'Família',
    professional: 'Profissional',
    other: 'Outro'
  };

  return (
    <motion.div
      className="rel-card"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
              {title[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <span className="rel-card-name">{title}</span>
        <span style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '4px'
        }}>
          {typeLabels[type] || type}
        </span>
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
