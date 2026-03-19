import { motion } from 'framer-motion';

interface RelationshipCardProps {
  name: string;
  level: string;
  percentage: number;
  progressValue: number;
  avatars?: string[];
  color?: string;
}

const RelationshipCard: React.FC<RelationshipCardProps> = ({ 
  name, 
  level, 
  percentage, 
  progressValue,
  avatars = [],
  color = 'linear-gradient(90deg, #FF7E5F, #FEB47B)'
}) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass rounded-[24px] p-5 flex flex-col gap-4 min-w-[260px] border border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {avatars.map((avatar, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1c23] overflow-hidden bg-white/5">
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {avatars.length === 0 && (
            <div className="w-10 h-10 rounded-full border-2 border-[#1a1c23] bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
              {name[0]}
            </div>
          )}
        </div>
        <h3 className="text-white font-semibold text-lg">{name}</h3>
      </div>

      <div className="flex justify-between items-end">
        <span className="text-white/50 text-sm">{level} - {percentage}%</span>
        <span className="text-white/50 text-sm">{progressValue}%</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ background: color }}
          className="h-full rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default RelationshipCard;
