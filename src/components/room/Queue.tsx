import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListMusic, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Song, AddSongPayload } from '@shared/types';
import { AddSong } from './AddSong';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
interface QueueProps {
  songs: Song[];
  onVote: (songId: string) => Promise<void>;
  onDownvote: (songId: string) => Promise<void>;
  onAddSong: (songData: AddSongPayload) => Promise<void>;
  nowPlaying?: Song;
}
export function Queue({ songs, onVote, onDownvote, onAddSong, nowPlaying }: QueueProps) {
  const [votingId, setVotingId] = useState<string | null>(null);
  const handleVoteClick = async (songId: string, action: 'up' | 'down') => {
    setVotingId(songId);
    if (action === 'up') {
      await onVote(songId);
    } else {
      await onDownvote(songId);
    }
    setVotingId(null);
  };
  return (
    <Card className="retro-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-3xl text-retro-gold">
          <ListMusic />
          Up Next
        </CardTitle>
        <AddSong onAddSong={onAddSong} nowPlaying={nowPlaying} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          {songs.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {songs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex items-center justify-between p-2 bg-card/50 border-2 border-primary/20 transition-all hover:border-primary/80 hover:bg-card", index === 0 && "border-retro-gold")}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <img src={song.albumArtUrl} alt={song.title} className="w-12 h-12 object-cover border-2 border-primary/50 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xl text-retro-white truncate">{song.title}</p>
                        <p className="text-lg text-retro-gold truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="retro-btn"
                        onClick={() => handleVoteClick(song.id, 'down')}
                        disabled={votingId === song.id}
                      >
                        {votingId === song.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsDown className="w-5 h-5" />}
                      </Button>
                      <span className="text-2xl text-retro-white w-8 text-center">{song.votes}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="retro-btn"
                        onClick={() => handleVoteClick(song.id, 'up')}
                        disabled={votingId === song.id}
                      >
                        {votingId === song.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[24rem] text-center text-retro-gold/60 space-y-4">
              <ListMusic className="w-24 h-24" />
              <p className="text-2xl">The stage is quiet... Add the first song!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}