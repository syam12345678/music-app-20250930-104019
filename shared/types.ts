export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  lastHeartbeat?: number;
}
export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  url: string;
  votes: number;
  tags?: string[];
  lyrics?: string;
  metadata?: Record<string, string>;
}
export interface ChatMessage {
  id:string;
  user: User;
  text: string;
  timestamp: number;
  reactions?: Record<string, string[]>;
}
export interface Room {
  code: string;
  users: User[];
  queue: Song[];
  chatHistory: ChatMessage[];
  nowPlaying?: Song;
  playHistory?: Song[];
  nowPlayingStartedAt?: number;
  version?: number;
}
export type AddSongPayload = Omit<Song, 'id' | 'votes'>;
export type SearchResultSong = {
  title: string;
  artist: string;
  albumArtUrl: string;
  url: string;
  tags?: string[];
  lyrics?: string;
  metadata?: Record<string, string>;
};
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}