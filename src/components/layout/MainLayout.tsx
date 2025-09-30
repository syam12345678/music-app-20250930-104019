import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Toaster } from '@/components/ui/sonner';
import { AnimatePresence } from 'framer-motion';
import { AnimatedPage } from '../AnimatedPage';
export function MainLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-retro-white font-sans bg-[url('data:image/svg+xml,%3Csvg%20width%3D%226%22%20height%3D%226%22%20viewBox%3D%220%200%206%206%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23F4B393%22%20fill-opacity%3D%220.1%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M5%200h1L0%206V5zM6%205v1H5z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-32 md:pb-24">
        <AnimatePresence mode="wait">
          <AnimatedPage key={location.pathname}>
            <Outlet />
          </AnimatedPage>
        </AnimatePresence>
      </main>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '2px solid hsl(var(--primary))',
            fontFamily: 'VT323, monospace',
            fontSize: '1.25rem',
            borderRadius: '0px',
          }
        }}
      />
    </div>
  );
}