import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@shared/types';
interface HarmoniaState {
  user: User;
  roomCode: string | null;
  setUser: (name: string, avatarUrl?: string) => void;
  setRoomCode: (code: string | null) => void;
}
export const useStore = create<HarmoniaState>()(
  persist(
    (set, get) => ({
      user: {
        id: uuidv4(),
        name: 'Anonymous Crown',
        avatarUrl: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${Math.random()}`,
      },
      roomCode: null,
      setUser: (name, avatarUrl) => {
        set((state) => ({
          user: {
            ...state.user,
            name: name || state.user.name,
            avatarUrl: avatarUrl || state.user.avatarUrl,
          },
        }));
      },
      setRoomCode: (code) => set({ roomCode: code }),
    }),
    {
      name: 'harmonia-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);