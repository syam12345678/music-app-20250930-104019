import React from 'react';
import type { Song } from '@shared/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Info } from 'lucide-react';
interface SongInfoProps {
  song?: Song;
}
export function SongInfo({ song }: SongInfoProps) {
  const hasLyrics = song?.lyrics && song.lyrics.trim() !== '';
  const hasMetadata = song?.metadata && Object.keys(song.metadata).length > 0;
  if (!hasLyrics && !hasMetadata) {
    return (
      <div className="text-center text-retro-gold/70 py-4">
        <p>No additional information available for this track.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6 py-2">
      {hasMetadata && (
        <div>
          <h4 className="text-xl text-retro-gold mb-2 flex items-center gap-2"><Info className="w-5 h-5" /> Metadata</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-retro-white">
            {Object.entries(song.metadata!).map(([key, value]) => (
              <div key={key}>
                <span className="font-bold text-retro-gold/80">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}
      {hasLyrics && (
        <div>
          <h4 className="text-xl text-retro-gold mb-2 flex items-center gap-2"><FileText className="w-5 h-5" /> Lyrics</h4>
          <ScrollArea className="h-40 bg-card/50 border-2 border-primary/20 p-2">
            <pre className="text-retro-white whitespace-pre-wrap font-sans text-base">
              {song.lyrics}
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}