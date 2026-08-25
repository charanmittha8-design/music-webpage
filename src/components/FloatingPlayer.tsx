import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  ListMusic,
  FileText,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Song, RepeatMode } from '../types';
import { formatTime, downloadSong } from '../services/musicApi';

interface FloatingPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: (song: Song) => void;
  onOpenLyrics: () => void;
  onOpenQueue: () => void;
  onShowToast?: (msg: string) => void;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  repeatMode,
  isShuffle,
  isFavorite,
  onTogglePlay,
  onSeek,
  onPrev,
  onNext,
  onVolumeChange,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
  onOpenLyrics,
  onOpenQueue,
  onShowToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume || 0.8);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(15);
    onShowToast?.(`⬇️ Downloading "${currentSong.title}" (320kbps HD)...`);

    const success = await downloadSong(currentSong, (p) => setDownloadProgress(p));
    setIsDownloading(false);

    if (success) {
      setDownloadSuccess(true);
      onShowToast?.(`✅ "${currentSong.title}.mp3" saved to your downloads!`);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } else {
      onShowToast?.(`❌ Download failed for "${currentSong.title}"`);
    }
  };

  const effectiveDuration = duration > 0 ? duration : (currentSong.durationSec || 240);
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <>
      {/* Mini / Docked Floating Player */}
      <div
        id="floating-player-bar"
        className="fixed bottom-[68px] left-3 right-3 md:left-6 md:right-6 max-w-2xl mx-auto z-40 floating-player rounded-2xl p-3 shadow-2xl transition-all duration-300"
      >
        {/* Progress Bar with Scrubbing */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] font-mono text-zinc-400 min-w-[28px]">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center group">
            <input
              id="audio-progress-slider"
              type="range"
              min="0"
              max={effectiveDuration}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            {/* Visual gradient fill behind slider */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1db954] rounded-full pointer-events-none group-hover:h-1.5 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 min-w-[28px] text-right">
            {formatTime(effectiveDuration)}
          </span>
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Track Info */}
          <div
            className="flex items-center gap-2.5 min-w-0 max-w-[40%] md:max-w-[38%] cursor-pointer group"
            onClick={() => setIsExpanded(true)}
          >
            <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                  <span className="w-1 bg-[#1db954] rounded-full animate-wave-1" />
                  <span className="w-1 bg-[#1db954] rounded-full animate-wave-2" />
                  <span className="w-1 bg-[#1db954] rounded-full animate-wave-3" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-bold text-white truncate group-hover:text-[#1db954] transition-colors">
                {currentSong.title}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              id="player-prev-btn"
              onClick={onPrev}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              id="player-play-pause-btn"
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-[#1db954] hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              id="player-next-btn"
              onClick={onNext}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Right Action Icons: Download, Like, Lyrics, Queue, Expand */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Download Button */}
            <button
              id="player-download-btn"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`p-1.5 rounded-lg transition-all ${
                downloadSuccess
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : isDownloading
                  ? 'text-[#1db954] animate-pulse'
                  : 'text-zinc-300 hover:text-[#1db954] hover:bg-white/10'
              }`}
              title="Download full 320kbps song"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#1db954]" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            <button
              id="player-like-btn"
              onClick={() => onToggleFavorite(currentSong)}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-[#1db954]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              id="player-lyrics-btn"
              onClick={onOpenLyrics}
              className="p-1.5 text-zinc-400 hover:text-[#1db954] transition-colors hidden sm:flex"
              title="View Lyrics"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              id="player-queue-btn"
              onClick={onOpenQueue}
              className="p-1.5 text-zinc-400 hover:text-[#1db954] transition-colors"
              title="View Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              id="player-expand-btn"
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Full Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Full-Screen Now Playing Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#09090d]/95 backdrop-blur-2xl flex flex-col justify-between p-6 max-w-lg mx-auto md:rounded-3xl md:my-6 md:border md:border-white/10 shadow-2xl animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              id="collapse-player-btn"
              onClick={() => setIsExpanded(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Now Playing
              </span>
              <p className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                {currentSong.album}
              </p>
            </div>
            <button
              id="expanded-queue-btn"
              onClick={onOpenQueue}
              className="p-2 text-zinc-400 hover:text-[#1db954] rounded-full bg-white/5"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>

          {/* Large Album Art */}
          <div className="my-4 px-4 flex justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/15">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4">
                  <div className="flex items-end gap-1.5 h-8">
                    <span className="w-1.5 bg-[#1db954] rounded-full animate-wave-1" />
                    <span className="w-1.5 bg-[#1db954] rounded-full animate-wave-2" />
                    <span className="w-1.5 bg-[#1db954] rounded-full animate-wave-3" />
                    <span className="w-1.5 bg-[#1db954] rounded-full animate-wave-4" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Track Details & Favorite */}
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0 flex-1 mr-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white truncate">
                  {currentSong.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30 flex-shrink-0">
                  320kbps HD
                </span>
              </div>
              <p className="text-sm text-zinc-400 truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>
            <button
              id="expanded-like-btn"
              onClick={() => onToggleFavorite(currentSong)}
              className={`p-2.5 rounded-full bg-white/5 transition-colors ${
                isFavorite ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Full Progress Scrubber */}
          <div className="px-2 mt-2">
            <div className="relative flex items-center group">
              <input
                id="expanded-progress-slider"
                type="range"
                min="0"
                max={effectiveDuration}
                step="0.1"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1db954] rounded-full pointer-events-none"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-around my-2">
            <button
              id="expanded-shuffle-btn"
              onClick={onToggleShuffle}
              className={`p-2 transition-colors ${
                isShuffle ? 'text-[#1db954]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              id="expanded-prev-btn"
              onClick={onPrev}
              className="p-3 text-white hover:text-[#1db954] transition-colors"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            <button
              id="expanded-play-btn"
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full bg-[#1db954] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              id="expanded-next-btn"
              onClick={onNext}
              className="p-3 text-white hover:text-[#1db954] transition-colors"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            <button
              id="expanded-repeat-btn"
              onClick={onToggleRepeat}
              className={`p-2 transition-colors ${
                repeatMode !== 'off'
                  ? 'text-[#1db954]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Download & Lyrics Action Buttons in Expanded View */}
          <div className="flex items-center justify-center gap-3 px-2">
            <button
              id="expanded-download-song-btn"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1db954] to-emerald-500 text-black font-bold text-xs hover:opacity-90 active:scale-98 transition-all shadow-lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Downloading {downloadProgress}%</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-black" />
                  <span>Download Full Song (320k MP3)</span>
                </>
              )}
            </button>

            <button
              id="expanded-lyrics-action-btn"
              onClick={onOpenLyrics}
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-[#1db954] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Lyrics</span>
            </button>
          </div>

          {/* Volume Slider Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 px-2 mt-2">
            <div className="flex items-center gap-2 w-full max-w-[280px] mx-auto">
              <button
                id="expanded-mute-btn"
                onClick={handleToggleMute}
                className="text-zinc-400 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                id="expanded-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setIsMuted(false);
                  onVolumeChange(parseFloat(e.target.value));
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
