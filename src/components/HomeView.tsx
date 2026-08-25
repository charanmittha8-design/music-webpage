import React, { useState } from 'react';
import { Play, Sparkles, Flame, Clock, Radio, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Song, QuickMix } from '../types';
import { QUICK_MIXES, CURATED_TRACKS } from '../data/musicData';
import { downloadSong } from '../services/musicApi';

interface HomeViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  recentTracks: Song[];
  onPlaySong: (song: Song, customQueue?: Song[]) => void;
  onQuickMixSelect: (mix: QuickMix) => void;
  onShowToast?: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentSong,
  isPlaying,
  recentTracks,
  onPlaySong,
  onQuickMixSelect,
  onShowToast,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const handleDownload = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (downloadingId === song.id) return;

    setDownloadingId(song.id);
    onShowToast?.(`⬇️ Downloading "${song.title}" (320kbps HD)...`);

    const success = await downloadSong(song);
    setDownloadingId(null);

    if (success) {
      setDownloadedIds((prev) => new Set(prev).add(song.id));
      onShowToast?.(`✅ "${song.title}.mp3" saved to your downloads!`);
    } else {
      onShowToast?.(`❌ Download failed for "${song.title}"`);
    }
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Header Profile Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Good Day, Explorer <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Welcome to <span className="text-[#1db954] font-semibold">Charan Music Premium</span> • Full 320kbps Audio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1db954] to-emerald-400 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full bg-[#121216] flex items-center justify-center text-xs font-bold text-emerald-400">
              CM
            </div>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-[#121218] to-purple-950 p-5 border border-white/10 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1db954]/20 border border-[#1db954]/30 text-[#1db954] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPOTLIGHT RELEASE • FULL ALBUM</span>
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">
              Pushpa 2 The Rule (Original Motion Picture Hits)
            </h3>
            <p className="text-xs text-zinc-300">
              Experience the energetic tracks by Devi Sri Prasad in ultra-crisp 320kbps full track audio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="spotlight-play-btn"
              onClick={() => onPlaySong(CURATED_TRACKS[0], CURATED_TRACKS)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1db954] text-black font-bold text-xs hover:bg-[#22c55e] transition-all hover:scale-105 active:scale-95 shadow-lg flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Full Track</span>
            </button>
            <button
              id="spotlight-download-btn"
              onClick={(e) => handleDownload(e, CURATED_TRACKS[0])}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Download 320kbps MP3"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ⚡ Quick Mix Hub */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡</span> Quick Mix Hub
          </h2>
          <span className="text-[11px] text-zinc-500 font-medium">1-Tap Stations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_MIXES.map((mix) => (
            <div
              key={mix.id}
              id={`quick-mix-${mix.id}`}
              onClick={() => onQuickMixSelect(mix)}
              className="group relative flex items-center gap-3 p-3 rounded-xl bg-[#121216] hover:bg-[#1c1c24] border border-white/[0.06] hover:border-[#1db954]/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-md overflow-hidden"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mix.gradient} flex items-center justify-center text-lg shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                {mix.emoji}
              </div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                {mix.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ⏱️ Jump Back In (Recent Tracks) */}
      {recentTracks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1db954]" /> Jump Back In
            </h2>
            <span className="text-[11px] text-zinc-500">{recentTracks.length} full songs</span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
            {recentTracks.map((song) => {
              const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={`recent-${song.id}`}
                  id={`recent-track-${song.id}`}
                  onClick={() => onPlaySong(song, recentTracks)}
                  className="group flex-shrink-0 w-28 sm:w-32 cursor-pointer"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-lg border border-white/5 group-hover:border-[#1db954]/50 transition-all">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg">
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    {isCurrentlyPlaying && (
                      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-[#1db954] rounded-full animate-wave-1" />
                        <span className="w-1 h-3 bg-[#1db954] rounded-full animate-wave-2" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-white truncate group-hover:text-[#1db954]">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🔥 Trending Essentials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" /> Trending Chartbusters (Full Length)
          </h2>
          <button
            onClick={() => onPlaySong(CURATED_TRACKS[0], CURATED_TRACKS)}
            className="text-[11px] text-[#1db954] hover:underline font-semibold"
          >
            Play All
          </button>
        </div>

        <div className="space-y-2">
          {CURATED_TRACKS.slice(0, 8).map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isThisDownloading = downloadingId === song.id;
            const isDownloaded = downloadedIds.has(song.id);

            return (
              <div
                key={`trending-${song.id}`}
                id={`trending-track-${song.id}`}
                onClick={() => onPlaySong(song, CURATED_TRACKS)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                    : 'bg-[#121216]/60 hover:bg-[#1c1c24] border border-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`w-5 text-center text-xs font-bold ${
                      index < 3 ? 'text-[#1db954]' : 'text-zinc-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isCurrent ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ml-2 flex-shrink-0">
                  <span className="text-xs text-zinc-400 font-mono hidden sm:inline">{song.duration}</span>
                  
                  {/* Download Button */}
                  <button
                    id={`trending-download-${song.id}`}
                    onClick={(e) => handleDownload(e, song)}
                    disabled={isThisDownloading}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                      isDownloaded
                        ? 'text-emerald-400'
                        : isThisDownloading
                        ? 'text-[#1db954] animate-pulse'
                        : 'text-zinc-400 hover:text-[#1db954]'
                    }`}
                    title="Download 320kbps MP3"
                  >
                    {isThisDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isDownloaded ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1db954] hover:text-black flex items-center justify-center text-zinc-300 transition-colors">
                    {isCurrent && isPlaying ? (
                      <Radio className="w-4 h-4 text-[#1db954]" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
