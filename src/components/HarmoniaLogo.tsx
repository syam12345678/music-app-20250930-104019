import React from 'react';
import { Crown, Headphones } from 'lucide-react';
export function HarmoniaLogo() {
  return (
    <div className="relative w-10 h-10">
      <Headphones className="w-10 h-10 text-retro-gold" />
      <Crown className="w-6 h-6 text-retro-gold absolute -top-2 left-1/2 -translate-x-1/2 -rotate-12" />
    </div>
  );
}