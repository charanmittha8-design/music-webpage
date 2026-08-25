import React, { useState } from 'react';
import {
  Search as SearchIcon,
  X,
  Loader2,
  Play,
  Heart,
  Plus,
  Compass,
  Download,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { Song } from '../types';
import { GENRES } from '../data/musicData';
import { downloadSong } from '../services/musicApi';
import { SafeImage } from './SafeImage';

interface SearchViewProps {
  searchQuery: string;
  searchResults: Song[];
  searchHistory: string[];
  isLoading: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: Song[];
  onSearch: (query: string) => void;
  onSelectSong: (song: Song, queue?: Song[]) => void;
  onClearHistoryItem: (item: string) => void;
  onClearAllHistory: () => void;
  onToggleFavorite: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onRequestDownload?: (song: Song) => void;
  onShowToast?: (msg: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  searchResults,
  searchHistory,
  isLoading,
  currentSong,
  isPlaying,
  favorites,
  onSearch,
  onSelectSong,
  onClearHistoryItem,
  onClearAllHistory,
  onToggleFavorite,
  onAddToQueue,
  onRequestDownload,
  onShowToast,
}) => {
  const [localInput, setLocalInput] = useState(searchQuery);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  // Keep local input in sync with external search queries (e.g. from Quick Mixes)
  React.useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim()) {
      onSearch(localInput.trim());
    }
  };

  const handleChipClick = (query: string) => {
    setLocalInput(query);
    onSearch(query);
  };

  const handleDownload = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (onRequestDownload) {
      onRequestDownload(song);
      return;
    }
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
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* 1. Compact Search Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Search</span>
            <Compass className="w-5 h-5 text-[#1db954]" />
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full 320kbps Telugu, Hindi, Tamil, Malayalam & all Indian songs
          </p>
        </div>
      </div>

      {/* 2. Sleek Spotify Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-[#14141c] border border-white/10 rounded-xl px-3 py-1 focus-within:border-[#1db954] focus-within:ring-1 focus-within:ring-[#1db954] transition-all shadow-sm">
          <SearchIcon className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
          <input
            id="search-input-field"
            type="text"
            placeholder="Search songs, artists, Telugu, Bollywood, Tamil, Malayalam..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            className="w-full bg-transparent border-none text-white text-xs sm:text-sm py-2 outline-none placeholder:text-zinc-500"
            autoFocus
          />
          {localInput && (
            <button
              type="button"
              id="clear-search-input"
              onClick={() => {
                setLocalInput('');
              }}
              className="p-1 text-zinc-400 hover:text-white rounded-full transition-colors mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            id="submit-search-btn"
            disabled={isLoading || !localInput.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1db954] text-black font-extrabold text-xs hover:bg-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Searching</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </form>

      {/* 3. Compact Search History Chips */}
      {searchHistory.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Recent Searches</span>
            <button
              id="clear-all-history-btn"
              onClick={onClearAllHistory}
              className="hover:text-red-400 transition-colors text-[10px]"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {searchHistory.slice(0, 6).map((item) => (
              <div
                key={item}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1c1c24] hover:bg-[#272733] border border-white/5 text-[11px] text-zinc-200 cursor-pointer transition-all"
              >
                <span onClick={() => handleChipClick(item)} className="truncate max-w-[120px]">
                  {item}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearHistoryItem(item);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Genre & Mood Chips (When no search active) */}
      {searchResults.length === 0 && !isLoading && (
        <div className="space-y-2 pt-1">
          <h3 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
            Explore Categories & Moods
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((g) => (
              <button
                key={g.name}
                id={`genre-${g.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleChipClick(g.query)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14141c] hover:bg-[#1f1f2a] border border-white/[0.05] hover:border-[#1db954]/40 transition-all text-left text-xs font-semibold text-zinc-200 hover:text-white"
              >
                <span className="text-sm">{g.icon}</span>
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. 🎵 ULTRA-COMPACT SPACE-EFFICIENT SEARCH RESULTS LIST */}
      {searchResults.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Full Tracks ({searchResults.length})</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 font-bold">
                320kbps Studio
              </span>
            </h3>
            <button
              onClick={() => onSelectSong(searchResults[0], searchResults)}
              className="text-[11px] text-[#1db954] hover:underline font-bold"
            >
              Play All
            </button>
          </div>

          <div className="space-y-1">
            {searchResults.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = favorites.some((f) => f.id === song.id);
              const isThisDownloading = downloadingId === song.id;
              const isDownloaded = downloadedIds.has(song.id);

              return (
                <div
                  key={`search-res-${song.id}-${index}`}
                  id={`song-result-${song.id}`}
                  className={`group flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer select-none ${
                    isCurrent
                      ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                      : 'bg-[#14141c]/80 hover:bg-[#1f1f2a] border border-white/[0.03]'
                  }`}
                  onClick={() => onSelectSong(song, searchResults)}
                >
                  {/* Left: Compact artwork & Track Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-[#121216]">
                      <SafeImage
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" />
                      </div>
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Radio className="w-3.5 h-3.5 text-[#1db954] animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate leading-tight flex items-center gap-1.5 ${
                          isCurrent ? 'text-[#1db954]' : 'text-white'
                        }`}
                      >
                        {song.title}
                        {song.isPreview && (
                          <span className="px-1 py-0.2 rounded-[4px] bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-black uppercase tracking-tighter">
                            30s Preview
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">
                        {song.artist} • <span className="text-zinc-500">{song.album}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick compact actions */}
                  <div className="flex items-center gap-1 ml-1.5 flex-shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline mr-1">
                      {song.duration}
                    </span>

                    {/* Download Button */}
                    <button
                      id={`download-song-${song.id}`}
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
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isDownloaded ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Like Button */}
                    <button
                      id={`fav-btn-${song.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(song);
                      }}
                      className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                        isFav ? 'text-[#1db954]' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title={isFav ? 'Liked' : 'Like'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    {/* Add to Queue Button */}
                    <button
                      id={`add-queue-${song.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(song);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
