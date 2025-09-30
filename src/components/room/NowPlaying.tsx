import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, SkipForward, PlayCircle, Volume2, VolumeX, Play, Pause, SkipBack, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import type { Song } from '@shared/types';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SongInfo } from './SongInfo';
interface NowPlayingProps {
  song?: Song;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  isQueueEmpty: boolean;
  isHistoryEmpty: boolean;
  syncTime: number;
}
const defaultSong: Song = {
  id: 'default-song',
  title: 'Silence',
  artist: 'The Void',
  albumArtUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  url: '',
  votes: 0,
};
const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
export function NowPlaying({ song, onPlayNext, onPlayPrevious, isQueueEmpty, isHistoryEmpty, syncTime }: NowPlayingProps) {
  const currentSong = song || defaultSong;
  const lastToastId = useRef<string | null>(null);
  const player = useAudioPlayer({
    src: song?.url,
    onEnded: onPlayNext,
    syncSeekTime: syncTime,
  });
  useEffect(() => {
    if (song && song.id !== 'default-song' && song.id !== lastToastId.current) {
        toast(`Now Playing: "${song.title}" by ${song.artist}`);
        lastToastId.current = song.id;
    }
  }, [song]);
  const handleVolumeChange = (value: number[]) => {
    player.setVolume(value[0] / 100);
    if (player.isMuted && value[0] > 0) {
      player.setIsMuted(false);
    }
  };
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player.duration) return;
    const progressContainer = e.currentTarget;
    const clickPosition = e.clientX - progressContainer.getBoundingClientRect().left;
    const percentage = clickPosition / progressContainer.offsetWidth;
    const seekTime = player.duration * percentage;
    player.seek(seekTime);
  };
  const currentVolume = player.isMuted ? 0 : player.volume * 100;
  return (
    <Card className="retro-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-3xl text-retro-gold">
          <PlayCircle className="animate-pulse-subtle" />
          Now Playing
        </CardTitle>
        <div className="flex items-center gap-2">
            <Button
              onClick={onPlayPrevious}
              disabled={isHistoryEmpty}
              className="retro-btn bg-card hover:bg-retro-gold hover:text-retro-black"
            >
              <SkipBack className="mr-2 h-5 w-5" />
              Prev
            </Button>
            <Button
              onClick={onPlayNext}
              disabled={isQueueEmpty}
              className="retro-btn bg-card hover:bg-retro-gold hover:text-retro-black"
            >
              <SkipForward className="mr-2 h-5 w-5" />
              Next
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <motion.div
            key={currentSong.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={currentSong.albumArtUrl}
              alt="Album Art"
              className="w-40 h-40 object-cover border-2 border-primary bg-card"
            />
          </motion.div>
          <div className="space-y-2 text-center sm:text-left flex-grow w-full">
            <h3 className="text-4xl text-retro-white">{currentSong.title}</h3>
            <p className="flex items-center justify-center sm:justify-start gap-2 text-2xl text-retro-gold">
              <UserCircle />
              {currentSong.artist}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Button onClick={() => player.isPlaying ? player.pause() : player.play()} variant="outline" size="icon" className="retro-btn" disabled={!song}>
                {player.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <div className="flex-grow space-y-1">
                <div className="w-full cursor-pointer" onClick={handleSeek}>
                    <Progress value={player.duration ? (player.currentTime / player.duration) * 100 : 0} className="h-2" />
                </div>
                <div className="flex justify-between text-sm text-retro-gold/80">
                    <span>{formatTime(player.currentTime)}</span>
                    <span>{formatTime(player.duration)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Button onClick={() => player.setIsMuted(!player.isMuted)} variant="outline" size="icon" className="retro-btn">
                {player.isMuted || currentVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider
                value={[currentVolume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full max-w-xs"
              />
            </div>
          </div>
        </div>
        {(song?.lyrics || song?.metadata) && (
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="item-1" className="border-t-2 border-primary/30">
              <AccordionTrigger className="text-retro-gold hover:text-retro-white text-lg">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  <span>Song Info & Lyrics</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SongInfo song={song} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}