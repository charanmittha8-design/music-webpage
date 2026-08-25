import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Download,
  Loader2,
  CheckCircle2,
  Sparkles,
  Share2,
  Maximize2,
} from 'lucide-react';
import { Song, RepeatMode } from '../types';
import { formatTime, downloadSong, getMockLyrics } from '../services/musicApi';
import { detectSongMood } from '../data/musicData';
import { SafeImage } from './SafeImage';

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
  onRequestDownload?: (song: Song) => void;
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
  onRequestDownload,
  onShowToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showFullLyricsInSheet, setShowFullLyricsInSheet] = useState(false);

  // Touch Swipe to Dismiss Player Sheet on Mobile
  const touchStartY = useRef<number | null>(null);

  // Mobile Back-Button Integration (Pressing phone back button minimizes the player instead of leaving page)
  useEffect(() => {
    if (isExpanded) {
      window.history.pushState({ playerExpanded: true }, '');
      const handlePopState = () => {
        setIsExpanded(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isExpanded]);

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
    if (onRequestDownload) {
      onRequestDownload(currentSong);
      return;
    }
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Listening to "${currentSong.title}" by ${currentSong.artist} on Charan Music Premium!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard?.writeText(
        `🎵 Now Playing: ${currentSong.title} by ${currentSong.artist} on Charan Music Premium - ${window.location.href}`
      );
      onShowToast?.('Song link copied to clipboard!');
    }
  };

  const effectiveDuration = duration > 0 ? duration : currentSong.durationSec || 240;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;
  const lyrics = getMockLyrics(currentSong);

  // Find active lyric index
  const activeLyricIdx = lyrics.findIndex((line, idx) => {
    return currentTime >= line.time && (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].time);
  });

  return (
    <>
      {/* 🎵 SPOTIFY-STYLE DOCKED MINI PLAYER (Sits cleanly right above bottom nav) */}
      <div
        id="floating-player-bar"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-[58px] left-2 right-2 md:left-4 md:right-4 max-w-2xl mx-auto z-40 bg-[#18181f]/95 hover:bg-[#20202a] backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl transition-all duration-200 cursor-pointer overflow-hidden group select-none"
      >
        {/* Top Mini Progress Bar (Spotify Style) */}
        <div className="w-full h-1 bg-white/10 relative">
          <div
            className="h-full bg-[#1db954] transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 gap-2">
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-[#121216]">
              <SafeImage
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-0.5 bg-[#1db954] rounded-full animate-wave-1" />
                  <span className="w-0.5 bg-[#1db954] rounded-full animate-wave-2" />
                  <span className="w-0.5 bg-[#1db954] rounded-full animate-wave-3" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1db954] transition-colors">
                {currentSong.title}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Like */}
            <button
              id="mini-player-like-btn"
              onClick={() => onToggleFavorite(currentSong)}
              className={`p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors ${
                isFavorite ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-[#1db954]' : ''}`} />
            </button>

            {/* Previous */}
            <button
              id="mini-player-prev-btn"
              onClick={onPrev}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              id="mini-player-play-btn"
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#1db954] hover:text-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              id="mini-player-next-btn"
              onClick={onNext}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* 📱 FULL-SCREEN SPOTIFY-STYLE NOW PLAYING VIEW (Never congested, easy back navigation) */}
      {isExpanded && (
        <div
          id="fullscreen-now-playing"
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            if (touchStartY.current !== null) {
              const diff = e.changedTouches[0].clientY - touchStartY.current;
              if (diff > 90) {
                setIsExpanded(false); // Swipe down to minimize
              }
              touchStartY.current = null;
            }
          }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#1c1c24] via-[#101014] to-[#070708] overflow-y-auto flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto md:rounded-3xl md:my-4 md:max-h-[96vh] md:border md:border-white/10 shadow-2xl animate-fadeIn no-scrollbar"
        >
          {/* 1. Header Bar: Back to Home / Minimize Chevron & Title */}
          <div className="flex items-center justify-between pt-1 pb-3 sticky top-0 bg-[#1c1c24]/80 backdrop-blur-md z-10 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <button
              id="back-to-home-btn"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
              title="Back to Home / Minimize"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </button>

            <div className="text-center min-w-0 flex-1 px-3">
              <span className="text-[10px] uppercase tracking-widest text-[#1db954] font-extrabold flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Playing from Album
              </span>
              <p className="text-xs font-semibold text-zinc-300 truncate max-w-[200px] mx-auto">
                {currentSong.album || 'Charan Music Hits'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="expanded-share-btn"
                onClick={handleShare}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                title="Share Song"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                id="expanded-queue-btn"
                onClick={onOpenQueue}
                className="p-2 text-zinc-400 hover:text-[#1db954] rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                title="Queue"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Large Album Art Container (Responsive Aspect Square) */}
          <div className="my-3 px-2 flex justify-center items-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 max-w-[75vw] max-h-[36vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <SafeImage
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                iconClassName="w-16 h-16 text-zinc-600"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3">
                  <div className="flex items-end gap-1.5 h-6">
                    <span className="w-1 bg-[#1db954] rounded-full animate-wave-1" />
                    <span className="w-1 bg-[#1db954] rounded-full animate-wave-2" />
                    <span className="w-1 bg-[#1db954] rounded-full animate-wave-3" />
                    <span className="w-1 bg-[#1db954] rounded-full animate-wave-4" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Track Title, Artist, Quality Badge, Like & Download Quick Buttons */}
          <div className="space-y-3 px-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                  {currentSong.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5 font-medium">
                  {currentSong.artist}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Download Button */}
                <button
                  id="expanded-header-download-btn"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-[#1db954] transition-all"
                  title="Download MP3 or Save to Vault"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#1db954]" />
                  ) : downloadSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>

                {/* Heart Favorite */}
                <button
                  id="expanded-like-btn"
                  onClick={() => onToggleFavorite(currentSong)}
                  className={`p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors ${
                    isFavorite ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-[#1db954]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quality & Audio Spec Pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] text-[10px] font-black tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
                320kbps Studio Master
              </span>
              {(() => {
                const mood = detectSongMood(currentSong);
                const moodLabels: Record<string, { label: string; icon: string; style: string }> = {
                  party: { label: 'Party & Mass Vibe', icon: '🎉', style: 'bg-red-500/20 text-red-300 border-red-500/30' },
                  sad: { label: 'Sad & Emotional Vibe', icon: '💔', style: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                  romantic: { label: 'Romantic Melody', icon: '❤️', style: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
                  hype: { label: 'Mass Swagger BGM', icon: '⚡', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  chill: { label: 'Acoustic Chill', icon: '🌙', style: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                };
                const item = moodLabels[mood] || moodLabels.party;
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${item.style}`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                );
              })()}
              {currentSong.isOffline && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  ⚡ 0-Data Offline Vault
                </span>
              )}
            </div>

            {/* 4. Full Spotify Progress Scrubber */}
            <div className="pt-2">
              <div className="relative flex items-center group py-2">
                <input
                  id="expanded-progress-slider"
                  type="range"
                  min="0"
                  max={effectiveDuration}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="w-full cursor-pointer z-10"
                />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#1db954] rounded-full pointer-events-none"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 -mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(effectiveDuration)}</span>
              </div>
            </div>

            {/* 5. Center Spotify Playback Controls */}
            <div className="flex items-center justify-between py-2">
              <button
                id="expanded-shuffle-btn"
                onClick={onToggleShuffle}
                className={`p-2.5 rounded-full transition-colors ${
                  isShuffle ? 'text-[#1db954] bg-[#1db954]/10' : 'text-zinc-500 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                id="expanded-prev-btn"
                onClick={onPrev}
                className="p-3 text-zinc-200 hover:text-white hover:scale-110 active:scale-95 transition-all"
                title="Previous Track"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                id="expanded-play-btn"
                onClick={onTogglePlay}
                className="w-16 h-16 rounded-full bg-white text-black hover:bg-[#1db954] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                id="expanded-next-btn"
                onClick={onNext}
                className="p-3 text-zinc-200 hover:text-white hover:scale-110 active:scale-95 transition-all"
                title="Next Track"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                id="expanded-repeat-btn"
                onClick={onToggleRepeat}
                className={`p-2.5 rounded-full transition-colors ${
                  repeatMode !== 'off'
                    ? 'text-[#1db954] bg-[#1db954]/10'
                    : 'text-zinc-500 hover:text-white'
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

            {/* 6. Download Full Song Bar (Clean, Uncut & Spacious) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="expanded-download-action-btn"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1db954] to-emerald-400 text-black font-extrabold text-xs hover:brightness-110 active:scale-98 transition-all shadow-lg"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Downloading {downloadProgress}%</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Downloaded to Phone & Vault</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-black" />
                    <span>Download Full Song (320kbps MP3)</span>
                  </>
                )}
              </button>
            </div>

            {/* 7. SPOTIFY-STYLE INTEGRATED KARAOKE LYRICS CARD */}
            <div className="rounded-2xl bg-gradient-to-b from-[#1e1e28] to-[#14141c] border border-white/10 p-4 space-y-2 mt-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1db954]" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Lyrics (Karaoke Mode)
                  </span>
                </div>
                <button
                  id="expand-lyrics-toggle"
                  onClick={() => setShowFullLyricsInSheet(!showFullLyricsInSheet)}
                  className="text-[11px] font-bold text-[#1db954] hover:underline"
                >
                  {showFullLyricsInSheet ? 'Compact View' : 'Full Screen Lyrics'}
                </button>
              </div>

              {/* Synchronized Live Lines */}
              <div
                className={`transition-all duration-300 overflow-y-auto no-scrollbar space-y-2.5 ${
                  showFullLyricsInSheet ? 'max-h-64 py-2' : 'max-h-24'
                }`}
              >
                {lyrics.map((line, idx) => {
                  const isCurrentLine = idx === activeLyricIdx;
                  return (
                    <p
                      key={idx}
                      onClick={() => onSeek(line.time)}
                      className={`text-sm sm:text-base cursor-pointer transition-all duration-200 ${
                        isCurrentLine
                          ? 'text-[#1db954] font-black text-base sm:text-lg scale-[1.02] bg-[#1db954]/10 p-1.5 rounded-lg'
                          : 'text-zinc-400 font-medium hover:text-white'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Tap any line to jump</span>
                <span>Live Synced Audio Engine</span>
              </div>
            </div>

            {/* 8. Volume Slider Footer */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/10 pb-4">
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
                className="w-full max-w-[220px]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
