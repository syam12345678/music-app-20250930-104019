import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HarmoniaLogo } from '../HarmoniaLogo';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Navbar() {
  const location = useLocation();
  const navLinkClasses = (path: string) =>
    cn(
      'text-retro-gold text-2xl transition-all duration-200 hover:text-retro-white hover:translate-x-0.5 hover:-translate-y-0.5',
      location.pathname === path ? 'text-retro-white' : ''
    );
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b-2 border-retro-gold">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <HarmoniaLogo />
              <span className="font-display text-3xl text-retro-white">Harmonia</span>
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/profile" className={navLinkClasses('/profile')}>
              <User className="w-8 h-8" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}