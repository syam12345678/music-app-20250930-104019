import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NowPlaying } from '@/components/room/NowPlaying';
import { Queue } from '@/components/room/Queue';
import { Chat } from '@/components/room/Chat';
import type { ApiResponse, Room, AddSongPayload } from '@shared/types';
import { toast } from 'sonner';
import { Loader2, Copy, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useInterval } from '@/hooks/useInterval';
import { Button } from '@/components/ui/button';
export function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, setRoomCode } = useStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isVisible = usePageVisibility();
  const localVersionRef = useRef(0);
  const fetchRoomData = useCallback(async (showLoadingSpinner = false) => {
    if (!code) return;
    if (showLoadingSpinner) setLoading(true);
    else setIsPolling(true);
    setError(null);
    try {
      const response = await fetch(`/api/rooms/${code}`);
      if (!response.ok) throw new Error(`Room not found or server error.`);
      const result = (await response.json()) as ApiResponse<Room>;
      if (result.success && result.data) {
        setRoom(result.data);
        localVersionRef.current = result.data.version || 0;
      } else {
        throw new Error(result.error || 'Failed to fetch room data.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Failed to Join Room', {
        description: `Could not find or load data for room ${code}. Redirecting home.`,
      });
      setTimeout(() => navigate('/'), 3000);
    } finally {
      if (showLoadingSpinner) setLoading(false);
      else setIsPolling(false);
    }
  }, [code, navigate]);
  const pollForUpdates = useCallback(async () => {
    if (!code || !isVisible) return;
    try {
      const response = await fetch(`/api/rooms/${code}/version`);
      const result = (await response.json()) as ApiResponse<{ version: number }>;
      if (result.success && result.data && result.data.version !== localVersionRef.current) {
        fetchRoomData(false);
      }
    } catch (err) {
      console.error("Polling failed:", err);
    }
  }, [code, isVisible, fetchRoomData]);
  const sendHeartbeat = useCallback(async () => {
    if (!code || !user?.id || !isVisible) return;
    try {
      await fetch(`/api/rooms/${code}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (err) {
      console.error("Heartbeat failed:", err);
    }
  }, [code, user?.id, isVisible]);
  useInterval(pollForUpdates, 3000);
  useInterval(sendHeartbeat, 10000);
  useEffect(() => {
    fetchRoomData(true);
  }, [fetchRoomData]);
  useEffect(() => {
    const addUserToRoom = async () => {
      if (!code || !user) return;
      try {
        await fetch(`/api/rooms/${code}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
      } catch (err) {
        console.error("Failed to register user in room:", err);
      }
    };
    if (room) {
        addUserToRoom();
    }
  }, [code, user, room]);
  const handleApiCall = async (url: string, options: RequestInit, successMessage?: string) => {
    try {
      const response = await fetch(url, options);
      const result = await response.json() as ApiResponse<Room>;
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'API request failed');
      }
      if (successMessage) toast.success(successMessage);
      setRoom(result.data!);
      localVersionRef.current = result.data!.version || 0;
    } catch (err) {
      toast.error('Action Failed', { description: err instanceof Error ? err.message : 'An unknown error occurred.' });
    }
  };
  const handleAddSong = (songData: AddSongPayload) => handleApiCall(`/api/rooms/${code}/queue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(songData) }, 'Song added to queue!');
  const handleVote = (songId: string) => handleApiCall(`/api/rooms/${code}/queue/${songId}/vote`, { method: 'POST' }, 'Vote counted!');
  const handleDownvote = (songId: string) => handleApiCall(`/api/rooms/${code}/queue/${songId}/downvote`, { method: 'POST' }, 'Downvote registered.');
  const handleSendMessage = (text: string) => handleApiCall(`/api/rooms/${code}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, user }) }, 'Message sent!');
  const handlePlayNext = () => handleApiCall(`/api/rooms/${code}/playback/next`, { method: 'POST' }, 'Playing next track!');
  const handlePlayPrevious = () => handleApiCall(`/api/rooms/${code}/playback/previous`, { method: 'POST' }, 'Playing previous track!');
  const handleReactToMessage = (messageId: string, emoji: string) => handleApiCall(`/api/rooms/${code}/chat/${messageId}/react`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji, user }) });
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || '');
    toast.success('Room code copied to clipboard!');
  };
  const handleLeaveRoom = () => {
    setRoomCode(null);
    navigate('/');
    toast.info("You've left the room.");
  };
  if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"><Loader2 className="w-16 h-16 animate-spin text-retro-gold" /><h2 className="text-4xl text-retro-white">Entering Room {code}...</h2></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4"><h2 className="text-5xl text-destructive">Error</h2><p className="text-2xl text-retro-gold">{error}</p><p className="text-xl text-retro-white">Redirecting you to the home page...</p></div>;
  if (!room) return null;
  const syncTime = room.nowPlayingStartedAt ? (Date.now() - room.nowPlayingStartedAt) / 1000 : 0;
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl md:text-5xl text-retro-white flex items-center gap-4">
          <span>Room: <span className="text-retro-gold">{code}</span></span>
          {isPolling && <Loader2 className="w-8 h-8 animate-spin text-retro-gold/70" />}
        </h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleCopyCode} className="retro-btn bg-card hover:bg-retro-gold hover:text-retro-black text-lg"><Copy className="mr-2 h-5 w-5"/> Copy Code</Button>
            <Button onClick={handleLeaveRoom} variant="destructive" className="retro-btn border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-lg"><LogOut className="mr-2 h-5 w-5"/> Leave</Button>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <NowPlaying
            song={room.nowPlaying}
            onPlayNext={handlePlayNext}
            onPlayPrevious={handlePlayPrevious}
            isQueueEmpty={room.queue.length === 0}
            isHistoryEmpty={!room.playHistory || room.playHistory.length === 0}
            syncTime={syncTime}
          />
          <Queue songs={room.queue} onVote={handleVote} onDownvote={handleDownvote} onAddSong={handleAddSong} nowPlaying={room.nowPlaying} />
        </div>
        <div className="lg:col-span-1">
          <Chat messages={room.chatHistory} users={room.users} onSendMessage={handleSendMessage} onReactToMessage={handleReactToMessage} />
        </div>
      </div>
    </div>
  );
}