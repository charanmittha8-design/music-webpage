import React, { useState } from 'react';
import { TrendingUp, Play, Trophy, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { CURATED_TRACKS } from '../data/musicData';
import { downloadSong } from '../services/musicApi';

interface ChartsViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onShowToast?: (msg: string) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  currentSong,
  isPlaying,
  onPlaySong,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'telugu' | 'hindi' | 'global'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: '🔥 Top 10 Global' },
    { id: 'telugu', label: '⚡ Telugu Superhits' },
    { id: 'hindi', label: '🌟 Bollywood Hits' },
    { id: 'global', label: '🌍 Pop & Viral' },
  ];

  const filteredTracks = CURATED_TRACKS.filter((track) => {
    if (activeCategory === 'telugu') return track.language === 'Telugu';
    if (activeCategory === 'hindi') return track.language === 'Hindi';
    if (activeCategory === 'global') return track.language === 'English' || track.language === 'Malayalam' || track.language === 'Tamil';
    return true;
  });

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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Trending Charts <TrendingUp className="w-6 h-6 text-[#1db954]" />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time full track charts with high-speed MP3 download
          </p>
        </div>
        <button
          id="play-chart-all-btn"
          onClick={() => onPlaySong(filteredTracks[0], filteredTracks)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1db954] text-black font-bold text-xs hover:bg-[#22c55e] transition-all shadow-lg hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play Chart</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`chart-tab-${cat.id}`}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-[#1db954] text-black shadow-md'
                : 'bg-[#121216] text-zinc-300 hover:bg-[#1c1c24] border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Ranked Track List */}
      <div className="space-y-2">
        {filteredTracks.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;
          const rank = idx + 1;
          const isThisDownloading = downloadingId === song.id;
          const isDownloaded = downloadedIds.has(song.id);

          return (
            <div
              key={`chart-track-${song.id}`}
              id={`chart-item-${song.id}`}
              onClick={() => onPlaySong(song, filteredTracks)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                  : 'bg-[#121216]/80 hover:bg-[#1c1c24] border border-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Ranking Icon / Badge */}
                <div className="w-6 text-center font-extrabold text-sm flex items-center justify-center">
                  {rank === 1 ? (
                    <span className="text-yellow-400 flex items-center justify-center">
                      <Trophy className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </span>
                  ) : rank === 2 ? (
                    <span className="text-zinc-300">#2</span>
                  ) : rank === 3 ? (
                    <span className="text-amber-600">#3</span>
                  ) : (
                    <span className="text-zinc-500 font-mono text-xs">#{rank}</span>
                  )}
                </div>

                <div className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs sm:text-sm font-bold truncate ${
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
                  id={`chart-download-${song.id}`}
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

                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#1db954] group-hover:text-black flex items-center justify-center text-zinc-300 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
