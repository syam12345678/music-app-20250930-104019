import { useState, useEffect, useRef, useCallback } from 'react';
interface UseAudioPlayerProps {
  src?: string;
  onEnded?: () => void;
  syncSeekTime?: number;
}
export function useAudioPlayer({ src, onEnded, syncSeekTime }: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(onEnded);
  const hasUserInteracted = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEndedRef.current?.();
    };
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (src && audio.src !== src) {
      audio.src = src;
      audio.load();
      if (hasUserInteracted.current) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Autoplay failed on source change:", error);
            setIsPlaying(false);
          });
        }
      }
    } else if (!src) {
      audio.pause();
      audio.removeAttribute('src');
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [src]);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && syncSeekTime && audio.readyState > 0) {
        const targetTime = Math.min(syncSeekTime, audio.duration);
        if (Math.abs(audio.currentTime - targetTime) > 2) { // Only seek if out of sync by >2s
            audio.currentTime = targetTime;
        }
    }
  }, [syncSeekTime]);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (audio?.src && audio.paused) {
      hasUserInteracted.current = true;
      audio.play().catch(e => console.error("Audio play failed on manual play:", e));
    }
  }, []);
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
  }, []);
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);
  const setPlayerVolume = useCallback((vol: number) => {
    setVolume(Math.max(0, Math.min(1, vol)));
  }, []);
  return {
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    play,
    pause,
    seek,
    setVolume: setPlayerVolume,
    setIsMuted,
  };
}