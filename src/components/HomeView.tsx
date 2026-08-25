import React from 'react';
import { Play, Flame, Clock, Radio, Music, Sparkles, Shuffle } from 'lucide-react';
import { Song, QuickMix, OfflineSong } from '../types';
import { QUICK_MIXES, CURATED_TRACKS } from '../data/musicData';
import { SafeImage } from './SafeImage';

interface HomeViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  recentTracks: Song[];
  offlineSongs: OfflineSong[];
  newReleases?: Song[];
  onPlaySong: (song: Song, customQueue?: Song[]) => void;
  onQuickMixSelect: (mix: QuickMix) => void;
  onRequestDownload: (song: Song) => void;
  onNavigateTab: (tab: 'home' | 'search' | 'charts' | 'library') => void;
  onShowToast?: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentSong,
  isPlaying,
  recentTracks,
  offlineSongs,
  newReleases = [],
  onPlaySong,
  onQuickMixSelect,
  onRequestDownload,
  onNavigateTab,
  onShowToast,
}) => {
  // Shuffle all tracks helper
  const handleShufflePlay = () => {
    const shuffled = [...CURATED_TRACKS].sort(() => Math.random() - 0.5);
    if (shuffled.length > 0) {
      onPlaySong(shuffled[0], shuffled);
      onShowToast?.(`🔀 Shuffling 320kbps Indian studio mix!`);
    }
  };

  // Group Indian Tracks for Clean Sections
  const freshArrivals = newReleases.length > 0 ? newReleases : CURATED_TRACKS.filter(
    (s) => s.year === '2024' || s.year === '2025' || s.year === '2026'
  );

  const teluguHits = CURATED_TRACKS.filter((s) => s.language === 'Telugu');
  const hindiHits = CURATED_TRACKS.filter((s) => s.language === 'Hindi');
  const southPanIndiaHits = CURATED_TRACKS.filter(
    (s) => s.language === 'Tamil' || s.language === 'Malayalam' || s.language === 'Kannada' || s.language === 'Punjabi'
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Quick Shuffle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Discover Indian Music
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full Studio Audio • Telugu, Hindi, Tamil, Malayalam, Kannada & Punjabi
          </p>
        </div>

        <button
          id="home-shuffle-play-btn"
          onClick={handleShufflePlay}
          className="flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-full bg-[#1db954] hover:bg-[#22c55e] text-black transition-all shadow-md active:scale-95"
          title="Shuffle and play all curated Indian hits"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle All</span>
        </button>
      </div>

      {/* 2. 🌟 NEW INDIAN ARRIVALS & FRESH RELEASES (Clean Banner Cards Carousel) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              New Indian Arrivals & Fresh Releases
            </h2>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {freshArrivals.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            return (
              <div
                key={`fresh-arrival-${song.id}`}
                id={`fresh-arrival-${song.id}`}
                onClick={() => onPlaySong(song, freshArrivals)}
                className="group flex-shrink-0 w-36 sm:w-40 p-2.5 rounded-2xl bg-[#15151e] hover:bg-[#1f1f2c] border border-white/[0.06] hover:border-[#1db954]/40 transition-all duration-200 cursor-pointer shadow-md select-none flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md bg-[#121216]">
                    <SafeImage
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* New Release Badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-black text-amber-400">
                      NEW
                    </div>

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    {isThisPlaying && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-1" />
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-2" />
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs font-bold text-white truncate group-hover:text-[#1db954] transition-colors">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                  <span className="text-[9px] text-[#1db954] font-bold">
                    {song.language || 'Indian'}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    320kbps
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ⚡ Quick Mix Radios (Clean 4-column quick stations) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡</span> Indian Quick Mix Radios
          </h2>
          <span className="text-[10px] text-zinc-500 font-medium">1-Tap Stations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_MIXES.map((mix) => (
            <div
              key={mix.id}
              id={`quick-mix-${mix.id}`}
              onClick={() => onQuickMixSelect(mix)}
              className="group relative flex items-center gap-2 p-2 rounded-xl bg-[#14141c] hover:bg-[#1f1f2a] border border-white/[0.06] hover:border-[#1db954]/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm overflow-hidden select-none"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mix.gradient} flex items-center justify-center text-sm shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform`}
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

      {/* 4. 🎬 Telugu Cinema Blockbusters */}
      {teluguHits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-emerald-400" /> Telugu Cinema Blockbusters
            </h2>
            <button
              onClick={() => onPlaySong(teluguHits[0], teluguHits)}
              className="text-[10px] text-[#1db954] hover:underline font-bold"
            >
              Play All
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {teluguHits.map((song) => {
              const isThisCurrent = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={`telugu-${song.id}`}
                  onClick={() => onPlaySong(song, teluguHits)}
                  className="group flex-shrink-0 w-24 sm:w-28 cursor-pointer select-none"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md border border-white/5 group-hover:border-[#1db954]/50 transition-all bg-[#14141c]">
                    <SafeImage
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    {isThisCurrent && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-1" />
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-2" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-white truncate group-hover:text-[#1db954]">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. 🌟 Bollywood & Hindi Chartbusters */}
      {hindiHits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Bollywood Romance & Melodies
            </h2>
            <button
              onClick={() => onPlaySong(hindiHits[0], hindiHits)}
              className="text-[10px] text-[#1db954] hover:underline font-bold"
            >
              Play All
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {hindiHits.map((song) => {
              const isThisCurrent = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={`hindi-${song.id}`}
                  onClick={() => onPlaySong(song, hindiHits)}
                  className="group flex-shrink-0 w-24 sm:w-28 cursor-pointer select-none"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md border border-white/5 group-hover:border-rose-400/50 transition-all bg-[#14141c]">
                    <SafeImage
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    {isThisCurrent && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-1" />
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-2" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-white truncate group-hover:text-rose-300">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. ⚡ South & Pan-India Hits (Tamil, Malayalam, Kannada, Punjabi) */}
      {southPanIndiaHits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" /> Tamil, Malayalam, Kannada & Punjabi
            </h2>
            <button
              onClick={() => onPlaySong(southPanIndiaHits[0], southPanIndiaHits)}
              className="text-[10px] text-[#1db954] hover:underline font-bold"
            >
              Play All
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {southPanIndiaHits.map((song) => {
              const isThisCurrent = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={`pan-india-${song.id}`}
                  onClick={() => onPlaySong(song, southPanIndiaHits)}
                  className="group flex-shrink-0 w-24 sm:w-28 cursor-pointer select-none"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md border border-white/5 group-hover:border-amber-400/50 transition-all bg-[#14141c]">
                    <SafeImage
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    {isThisCurrent && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-1" />
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-2" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-white truncate group-hover:text-amber-300">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. ⏱️ Jump Back In (Recent Tracks if any) */}
      {recentTracks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1db954]" /> Jump Back In
            </h2>
            <span className="text-[10px] text-zinc-500">{recentTracks.length} tracks</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {recentTracks.map((song) => {
              const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={`recent-${song.id}`}
                  id={`recent-track-${song.id}`}
                  onClick={() => onPlaySong(song, recentTracks)}
                  className="group flex-shrink-0 w-24 sm:w-28 cursor-pointer select-none"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md border border-white/5 group-hover:border-[#1db954]/50 transition-all bg-[#14141c]">
                    <SafeImage
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    {isCurrentlyPlaying && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-1" />
                        <span className="w-1 h-2.5 bg-[#1db954] rounded-full animate-wave-2" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-white truncate group-hover:text-[#1db954]">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. 🔥 Trending Indian Chartbusters Top List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" /> Trending Indian Chartbusters
          </h2>
          <button
            onClick={() => onPlaySong(CURATED_TRACKS[0], CURATED_TRACKS)}
            className="text-[10px] text-[#1db954] hover:underline font-bold"
          >
            Play All
          </button>
        </div>

        <div className="space-y-1">
          {CURATED_TRACKS.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <div
                key={`trending-${song.id}`}
                id={`trending-track-${song.id}`}
                onClick={() => onPlaySong(song, CURATED_TRACKS)}
                className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                    : 'bg-[#14141c]/70 hover:bg-[#1e1e28] border border-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-3.5 text-center text-[11px] font-extrabold ${
                      index < 3 ? 'text-[#1db954]' : 'text-zinc-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <SafeImage
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                        isCurrent ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {song.artist} • <span className="text-zinc-500">{song.language || 'Indian'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                    {song.duration}
                  </span>

                  <button
                    id={`trending-download-${song.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDownload(song);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-[#1db954] hover:bg-white/10 transition-colors"
                    title="Download Options"
                  >
                    <Music className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#1db954] hover:text-black flex items-center justify-center text-zinc-300 transition-colors">
                    {isCurrent && isPlaying ? (
                      <Radio className="w-3.5 h-3.5 text-black" />
                    ) : (
                      <Play className="w-3 h-3 fill-current translate-x-0.5" />
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
