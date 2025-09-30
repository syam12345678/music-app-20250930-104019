import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HarmoniaLogo } from '@/components/HarmoniaLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { ApiResponse, Room } from '@shared/types';
import { motion } from 'framer-motion';
export function HomePage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/rooms', { method: 'POST' });
      const result = (await response.json()) as ApiResponse<Room>;
      if (result.success && result.data) {
        toast(`Room ${result.data.code} created! Joining now...`);
        navigate(`/room/${result.data.code}`);
      } else {
        throw new Error(result.error || 'Failed to create room.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Creation Failed', {
        description: 'Could not create a new room. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.match(/^\d{4}$/)) {
      toast.error('Invalid Code', {
        description: 'Please enter a 4-digit room code.',
      });
      return;
    }
    setIsJoining(true);
    try {
      const response = await fetch(`/api/rooms/${roomCode}`);
      if (response.ok) {
        const result = (await response.json()) as ApiResponse<Room>;
        if (result.success) {
          navigate(`/room/${roomCode}`);
        } else {
           toast.error('Room Not Found', {
            description: `The room code "${roomCode}" does not exist.`,
          });
        }
      } else {
         toast.error('Room Not Found', {
          description: `The room code "${roomCode}" does not exist.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Join Failed', {
        description: 'Could not connect to the room. Please check your connection.',
      });
    } finally {
      setIsJoining(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 space-y-12" style={{ minHeight: 'calc(100vh - 7rem)'}}>
      <motion.div 
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HarmoniaLogo />
        <h1 className="text-7xl md:text-8xl text-retro-white">
          Harmonia
        </h1>
        <p className="text-2xl md:text-3xl text-retro-gold">
          The Royal Social Music Experience
        </p>
      </motion.div>
      <motion.div 
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button
          size="lg"
          className="w-full py-8 text-3xl retro-btn bg-card text-retro-gold hover:bg-retro-gold hover:text-retro-black"
          onClick={handleCreateRoom}
          disabled={isCreating || isJoining}
        >
          {isCreating ? <Loader2 className="animate-spin" /> : 'Create a Room'}
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex-grow border-t border-retro-gold/30"></div>
          <span className="text-retro-gold text-2xl">OR</span>
          <div className="flex-grow border-t border-retro-gold/30"></div>
        </div>
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <Input
            type="text"
            placeholder="----"
            maxLength={4}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
            className="h-20 text-center text-4xl tracking-[0.8rem] bg-input text-retro-white placeholder:text-retro-gold/50 focus-visible:ring-offset-0 focus-visible:ring-2"
            disabled={isCreating || isJoining}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full py-8 text-3xl retro-btn bg-retro-gold text-retro-black hover:bg-card hover:text-retro-gold"
            disabled={isCreating || isJoining}
          >
            {isJoining ? <Loader2 className="animate-spin" /> : 'Join Room'}
          </Button>
        </form>
      </motion.div>
       <footer className="absolute bottom-8 text-center text-retro-gold/50 text-lg">
        <p>Your personal concert, powered by Cloudflare.</p>
      </footer>
    </div>
  );
}