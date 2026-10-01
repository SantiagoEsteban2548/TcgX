'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface CardImageProps {
  src: string;
  alt: string;
  code?: string;
  className?: string;
  aspectRatio?: string;
}

export function CardImage({
  src,
  alt,
  code = '',
  className = 'w-full h-full object-cover rounded-xl',
  aspectRatio = 'aspect-[2.5/3.5]',
}: CardImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const cleanCode = code ? code.replace(/[^A-Za-z0-9-]/g, '') : '';
  const setPrefix = cleanCode.split('-')[0] || 'OP01';

  const handleError = () => {
    if (attempt === 0 && cleanCode) {
      // Fallback 1: URL directa limpia de Bandai oficial
      setAttempt(1);
      setCurrentSrc(`https://en.onepiece-cardgame.com/images/cardlist/card/${cleanCode}.png`);
    } else if (attempt === 1 && cleanCode) {
      // Fallback 2: CDN Limitless TCG
      setAttempt(2);
      setCurrentSrc(`https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/${setPrefix}/${cleanCode}_EN.webp`);
    } else {
      // Fallback 3: Placeholder estilizado de One Piece tcgtX
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`${aspectRatio} ${className} bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-700/60 flex flex-col items-center justify-between p-3 text-center shadow-inner relative overflow-hidden`}
      >
        <div className="w-full flex items-center justify-between opacity-60 text-[10px] font-mono text-sky-400">
          <span>{cleanCode || 'OP-TCG'}</span>
          <span>tcgtX</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 my-auto">
          <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sky-400 shadow-md">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[11px] font-bold text-white leading-tight px-1 line-clamp-2">
            {alt}
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            One Piece TCG
          </span>
        </div>

        <div className="w-full text-[9px] text-slate-500 font-mono">
          tcgtx.com
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
    />
  );
}
