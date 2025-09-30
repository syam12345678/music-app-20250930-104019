import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Loader2, SmilePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ChatMessage, User } from '@shared/types';
import { UserList } from './UserList';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
interface ChatProps {
  messages: ChatMessage[];
  users: User[];
  onSendMessage: (text: string) => Promise<void>;
  onReactToMessage: (messageId: string, emoji: string) => Promise<void>;
}
const EMOJIS = ['❤️', '👍', '😂', '🔥', '😢', '👏'];
export function Chat({ messages, users, onSendMessage, onReactToMessage }: ChatProps) {
  const { user: currentUser } = useStore();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);
    await onSendMessage(newMessage);
    setNewMessage('');
    setIsSending(false);
  };
  const getReactorNames = (userIds: string[]) => {
    return userIds.map(id => users.find(u => u.id === id)?.name || 'Someone').join(', ');
  };
  return (
    <Card className="retro-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl text-retro-gold">
          <MessageSquare />
          Live Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <UserList users={users} />
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <Avatar className="w-8 h-8 border-2 border-secondary">
                    <AvatarImage src={msg.user.avatarUrl} alt={msg.user.name} />
                    <AvatarFallback>{msg.user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex items-baseline gap-2">
                        <p className="text-lg text-retro-gold">{msg.user.name}</p>
                        <p className="text-xs text-retro-gold/60" title={new Date(msg.timestamp).toLocaleString()}>
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                    <div className="relative text-retro-white text-lg bg-card/50 p-2 border-2 border-primary/20 mt-1 break-words">
                      {msg.text}
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-card border-primary/50 border opacity-0 group-hover:opacity-100 transition-opacity">
                                <SmilePlus className="h-4 w-4 text-retro-gold" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1 bg-card border-primary">
                            <div className="flex gap-1">
                                {EMOJIS.map(emoji => (
                                    <Button key={emoji} variant="ghost" size="icon" className="h-8 w-8 text-lg" onClick={() => onReactToMessage(msg.id, emoji)}>
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                <TooltipProvider key={emoji} delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onReactToMessage(msg.id, emoji)}
                                                className={cn(
                                                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border-2 border-primary/50 transition-colors",
                                                    userIds.includes(currentUser.id) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/20"
                                                )}
                                            >
                                                <span>{emoji}</span>
                                                <span>{userIds.length}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-card border-primary text-retro-gold text-sm">
                                            <p>{getReactorNames(userIds)}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-retro-gold/60 space-y-4">
              <MessageSquare className="w-24 h-24" />
              <p className="text-2xl">Break the ice! Send the first message.</p>
            </div>
          )}
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t-2 border-primary/30">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="bg-input text-retro-white placeholder:text-retro-gold/70 text-base focus-visible:ring-offset-0 focus-visible:ring-2"
          />
          <Button type="submit" variant="outline" size="icon" className="retro-btn flex-shrink-0" disabled={isSending}>
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}