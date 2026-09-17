import React from 'react';
import { Character } from '../types.ts';

interface CharacterBadgeProps {
  character: Character;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const CharacterBadge: React.FC<CharacterBadgeProps> = ({
  character,
  size = 'md',
  showTagline = true,
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-2 gap-2 text-xs',
      emoji: 'text-2xl w-9 h-9',
      title: 'text-sm font-semibold',
    },
    md: {
      container: 'p-4 gap-3 text-sm',
      emoji: 'text-4xl w-14 h-14',
      title: 'text-lg font-bold',
    },
    lg: {
      container: 'p-6 gap-4 text-base',
      emoji: 'text-6xl w-24 h-24',
      title: 'text-2xl font-extrabold',
    },
  }[size];

  return (
    <div
      className={`glass-card rounded-2xl flex items-center border border-white/10 shadow-xl transition-transform hover:scale-[1.02] ${sizeClasses.container}`}
      style={{
        background: `linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)`,
        borderColor: character.color ? `${character.color}40` : undefined,
      }}
    >
      <div
        className={`rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 bg-slate-800/80 border border-white/10 ${sizeClasses.emoji}`}
      >
        <span>{character.avatarEmoji}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-white tracking-tight ${sizeClasses.title}`}>
            {character.name}
          </span>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-semibold text-white/90 border border-white/10 shadow-sm"
            style={{ backgroundColor: character.color || '#6366f1' }}
          >
            {character.universe}
          </span>
        </div>

        {showTagline && character.tagline && (
          <p className="text-slate-300 text-xs sm:text-sm mt-1 italic line-clamp-2">
            "{character.tagline}"
          </p>
        )}
      </div>
    </div>
  );
};
