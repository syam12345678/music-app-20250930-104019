import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Loader2, Music, Search, AlertTriangle, Star, Sparkles } from 'lucide-react';
import type { AddSongPayload, SearchResultSong, ApiResponse, Song } from '@shared/types';
import { useDebounce } from 'react-use';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
interface AddSongProps {
  onAddSong: (songData: AddSongPayload) => Promise<void>;
  nowPlaying?: Song;
}
const SongResultItem = React.memo(({ song, onAdd, isAdding }: { song: SearchResultSong, onAdd: (song: SearchResultSong) => void, isAdding: boolean }) => (
  <div className="flex items-center justify-between p-2 bg-card/50 border-2 border-primary/20 mb-2">
    <div className="flex items-center gap-4 overflow-hidden">
      <img src={song.albumArtUrl} alt={song.title} className="w-12 h-12 object-cover border-2 border-primary/50 flex-shrink-0" />
      <div className="truncate">
        <p className="text-lg text-retro-white truncate">{song.title}</p>
        <p className="text-base text-retro-gold truncate">{song.artist}</p>
      </div>
    </div>
    <Button size="sm" className="retro-btn flex-shrink-0" onClick={() => onAdd(song)} disabled={isAdding}>
      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
    </Button>
  </div>
));
export function AddSong({ onAddSong, nowPlaying }: AddSongProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResultSong[]>([]);
  const [allSongs, setAllSongs] = useState<SearchResultSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  useDebounce(() => setDebouncedQuery(query), 500, [query]);
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const response = await fetch(`/api/music/search?query=`);
        const data = (await response.json()) as ApiResponse<SearchResultSong[]>;
        if (data.success && data.data) {
          setAllSongs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch all songs:', err);
      }
    };
    fetchAllSongs();
  }, []);
  const recommendations = useMemo(() => allSongs.filter(s => s.tags?.includes('recommendation')), [allSongs]);
  const similarVibes = useMemo(() => {
    if (!nowPlaying || !nowPlaying.url || !allSongs.length) return [];
    const nowPlayingTags = nowPlaying.tags || [];
    if (nowPlayingTags.length === 0) return [];
    return allSongs.filter(song =>
      song.url !== nowPlaying.url &&
      song.tags?.some(tag => nowPlayingTags.includes(tag) && tag !== 'recommendation')
    ).slice(0, 5);
  }, [nowPlaying, allSongs]);
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setError(null);
      return;
    }
    const filtered = allSongs.filter(
      song => song.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              song.artist.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
    setResults(filtered);
  }, [debouncedQuery, allSongs]);
  const handleAddClick = async (song: SearchResultSong) => {
    setIsAdding(song.title);
    await onAddSong(song);
    toast.success(`"${song.title}" added to queue!`);
    setIsAdding(null);
    setQuery('');
  };
  const showRecommendations = isFocused && !query;
  const showSearchResults = !!query;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="retro-btn">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Song
        </Button>
      </DialogTrigger>
      <DialogContent className="retro-card bg-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-3xl text-retro-gold">Search for a Song</DialogTitle>
          <DialogDescription className="text-lg text-retro-gold/80">
            Find a track to add to the queue.
          </DialogDescription>
        </DialogHeader>
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-retro-gold/70" />
          <Input
            placeholder="Search for title or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-12 text-xl bg-input text-retro-white placeholder:text-retro-gold/70 pl-10 focus-visible:ring-offset-0 focus-visible:ring-2"
          />
        </div>
        <ScrollArea className="h-72">
          <div className="space-y-4 pr-4">
            {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-retro-gold" /></div>}
            {error && <div className="flex flex-col justify-center items-center h-48 text-center text-destructive"><AlertTriangle className="w-12 h-12 mb-4" /><p className="text-xl">Search Failed</p><p className="text-base text-destructive/80">{error}</p></div>}
            {!isLoading && !error && showRecommendations && (
              <>
                {similarVibes.length > 0 && (
                  <div>
                    <h4 className="text-xl text-retro-gold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Similar Vibes</h4>
                    {similarVibes.map((song) => <SongResultItem key={song.title + song.url} song={song} onAdd={handleAddClick} isAdding={isAdding === song.title} />)}
                  </div>
                )}
                {recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xl text-retro-gold mb-2 flex items-center gap-2"><Star className="w-5 h-5" /> Suggestions</h4>
                    {recommendations.map((song) => <SongResultItem key={song.title + song.url} song={song} onAdd={handleAddClick} isAdding={isAdding === song.title} />)}
                  </div>
                )}
              </>
            )}
            {!isLoading && !error && showSearchResults && results.length > 0 && (
              results.map((song) => <SongResultItem key={song.title + song.url} song={song} onAdd={handleAddClick} isAdding={isAdding === song.title} />)
            )}
            {!isLoading && !error && showSearchResults && debouncedQuery && results.length === 0 && (
              <div className="flex flex-col justify-center items-center h-48 text-center text-retro-gold/80">
                <Music className="w-12 h-12 mb-4" />
                <p className="text-xl">No results found for "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}