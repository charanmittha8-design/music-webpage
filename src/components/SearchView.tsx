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
} from 'lucide-react';
import { Song } from '../types';
import { GENRES } from '../data/musicData';
import { downloadSong } from '../services/musicApi';

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
  onShowToast?: (msg: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  searchResults,
  searchHistory,
  isLoading,
  currentSong,
  favorites,
  onSearch,
  onSelectSong,
  onClearHistoryItem,
  onClearAllHistory,
  onToggleFavorite,
  onAddToQueue,
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Explore & Search <Compass className="w-6 h-6 text-[#1db954]" />
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Search and stream full-length 320kbps songs with instant MP3 downloads
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-[#121216] border border-white/10 rounded-2xl px-4 py-1.5 focus-within:border-[#1db954] focus-within:ring-1 focus-within:ring-[#1db954] transition-all shadow-inner">
          <SearchIcon className="w-5 h-5 text-zinc-400 mr-2 flex-shrink-0" />
          <input
            id="search-input-field"
            type="text"
            placeholder="Search Telugu, Bollywood, English, artists, movies..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            className="w-full bg-transparent border-none text-white text-sm py-2.5 outline-none placeholder:text-zinc-500"
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
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            id="submit-search-btn"
            disabled={isLoading || !localInput.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1db954] text-black font-bold text-xs hover:bg-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </form>

      {/* Search History Chips */}
      {searchHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Recent Searches</span>
            <button
              id="clear-all-history-btn"
              onClick={onClearAllHistory}
              className="hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <div
                key={item}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1c24] hover:bg-[#272733] border border-white/5 text-xs text-zinc-200 cursor-pointer transition-all"
              >
                <span onClick={() => handleChipClick(item)}>{item}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearHistoryItem(item);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genre Exploration Chips */}
      {searchResults.length === 0 && !isLoading && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Explore Categories & Moods
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {GENRES.map((g) => (
              <button
                key={g.name}
                id={`genre-${g.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleChipClick(g.query)}
                className="flex items-center gap-2 p-3 rounded-xl bg-[#121216] hover:bg-[#1a1a22] border border-white/[0.06] hover:border-[#1db954]/50 transition-all text-left text-xs font-semibold text-zinc-200 hover:text-white"
              >
                <span className="text-base">{g.icon}</span>
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results List */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <span>Full Tracks ({searchResults.length})</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20">
                320kbps Audio
              </span>
            </h3>
            <button
              onClick={() => onSelectSong(searchResults[0], searchResults)}
              className="text-xs text-[#1db954] hover:underline font-semibold"
            >
              Play All
            </button>
          </div>

          <div className="space-y-2">
            {searchResults.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = favorites.some((f) => f.id === song.id);
              const isThisDownloading = downloadingId === song.id;
              const isDownloaded = downloadedIds.has(song.id);

              return (
                <div
                  key={`search-res-${song.id}-${index}`}
                  id={`song-result-${song.id}`}
                  className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                      : 'bg-[#121216]/70 hover:bg-[#1c1c24] border border-white/[0.04]'
                  }`}
                  onClick={() => onSelectSong(song, searchResults)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
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
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCurrent ? 'text-[#1db954]' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {song.artist} • <span className="text-zinc-500">{song.album}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
                    <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isDownloaded ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

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
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      id={`add-queue-${song.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(song);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
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
