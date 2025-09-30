import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { User } from '@shared/types';
interface UserListProps {
  users: User[];
}
export function UserList({ users }: UserListProps) {
  return (
    <div className="mb-4">
      <h4 className="text-xl text-retro-gold mb-2">In The Room ({users.length})</h4>
      <ScrollArea className="h-20">
        <div className="flex items-center gap-3 pb-2">
          {users.map((user) => (
            <TooltipProvider key={user.id} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarImage src={user.avatarUrl} alt={user.name} style={{ imageRendering: 'pixelated' }} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-primary text-retro-gold text-lg">
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}