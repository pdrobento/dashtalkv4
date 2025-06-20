import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  duration,
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setError("Erro ao carregar áudio");
      setIsLoading(false);
      console.warn("Erro ao carregar áudio:", audioUrl);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        setError("Erro ao reproduzir áudio");
      });
    }
    setIsPlaying(!isPlaying);
  };
  const handleProgressClick = (e: React.MouseEvent) => {
    const progressBar = progressRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio || isLoading) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = percentage * totalDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  if (error) {
    return (
      <div
        className={`flex items-center gap-2 p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-lg ${className}`}
      >
        <div className="w-6 h-6 bg-red-500 bg-opacity-30 rounded-full flex items-center justify-center">
          <VolumeX size={12} className="text-red-300" />
        </div>
        <span className="text-xs text-red-300">{error}</span>
      </div>
    );
  }
  return (
    <div
      className={`flex items-center gap-3 p-2 bg-black bg-opacity-20 border border-white border-opacity-20 rounded-lg max-w-xs ${className}`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Botão Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        disabled={isLoading}
        className="w-8 h-8 bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white rounded-full flex-shrink-0"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} />
        ) : (
          <Play size={14} className="ml-0.5" />
        )}
      </Button>

      {/* Área de progresso e tempo */}
      <div className="flex-1 min-w-0">
        {/* Barra de progresso */}
        <div
          ref={progressRef}
          className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer mb-1"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white rounded-full transition-all duration-150"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Tempo */}
        <div className="flex justify-between text-xs text-white text-opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Botão Mute */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="w-6 h-6 text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full flex-shrink-0"
      >
        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
      </Button>
    </div>
  );
}
