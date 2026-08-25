import React, { useState } from 'react';
import {
  Heart,
  Play,
  Shuffle,
  Music,
  Plus,
  Trash2,
  ListMusic,
  FolderHeart,
  Download,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Song, Playlist } from '../types';
import { downloadSong } from '../services/musicApi';

interface LibraryViewProps {
  favorites: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onRemoveFavorite: (song: Song) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onShowToast?: (msg: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  favorites,
  playlists,
  currentSong,
  onPlaySong,
  onRemoveFavorite,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayPlaylist,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'playlists'>('favorites');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
    }
  };

  const handleShuffleFavorites = () => {
    if (favorites.length === 0) return;
    const shuffled = [...favorites].sort(() => Math.random() - 0.5);
    onPlaySong(shuffled[0], shuffled);
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
      {/* Library Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            id="lib-tab-favorites"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'bg-[#121216] text-zinc-300 hover:bg-[#1c1c24] border border-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Liked Songs ({favorites.length})</span>
          </button>

          <button
            id="lib-tab-playlists"
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playlists'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'bg-[#121216] text-zinc-300 hover:bg-[#1c1c24] border border-white/5'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists ({playlists.length})</span>
          </button>
        </div>

        {activeTab === 'playlists' && (
          <button
            id="create-playlist-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        )}
      </div>

      {/* Liked Songs Tab View */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {/* Liked Songs Hero Banner */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-[#121218] to-[#121216] border border-white/10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#1db954] to-emerald-400 flex items-center justify-center text-black shadow-lg">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Liked Collection</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {favorites.length} {favorites.length === 1 ? 'full track' : 'full tracks'} saved
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  id="shuffle-fav-btn"
                  onClick={handleShuffleFavorites}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Shuffle Play"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  id="play-fav-all-btn"
                  onClick={() => onPlaySong(favorites[0], favorites)}
                  className="p-3 rounded-full bg-[#1db954] text-black hover:bg-[#22c55e] transition-transform hover:scale-105 shadow-md"
                  title="Play All"
                >
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </button>
              </div>
            )}
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <div className="py-14 text-center text-zinc-500 bg-[#121216]/40 rounded-2xl border border-white/5 p-6">
              <FolderHeart className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              <h3 className="text-sm font-semibold text-zinc-300">No Liked Songs Yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Tap the heart icon on any song during playback or search to build your library.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const isThisDownloading = downloadingId === song.id;
                const isDownloaded = downloadedIds.has(song.id);

                return (
                  <div
                    key={`fav-item-${song.id}-${index}`}
                    id={`fav-song-${song.id}`}
                    onClick={() => onPlaySong(song, favorites)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                        : 'bg-[#121216]/70 hover:bg-[#1c1c24] border border-white/[0.04]'
                    }`}
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
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                        {song.duration}
                      </span>

                      {/* Download Button */}
                      <button
                        id={`fav-download-${song.id}`}
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
                        id={`remove-fav-${song.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFavorite(song);
                        }}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Playlists Tab View */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                id={`playlist-card-${pl.id}`}
                onClick={() => onPlayPlaylist(pl)}
                className="group p-4 rounded-xl bg-[#121216] hover:bg-[#1c1c24] border border-white/5 hover:border-[#1db954]/30 cursor-pointer transition-all shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                    <Music className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-[#1db954]">
                      {pl.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {pl.description || `${pl.songs.length} songs`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`delete-pl-${pl.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlaylist(pl.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121218] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Playlist</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Playlist Name</label>
                <input
                  id="new-pl-name-input"
                  type="text"
                  placeholder="e.g. Late Night Vibes"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#1db954]"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Description (Optional)</label>
                <input
                  id="new-pl-desc-input"
                  type="text"
                  placeholder="e.g. My relaxing favorites"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#1db954]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  id="cancel-create-pl"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-create-pl"
                  className="px-4 py-1.5 text-xs bg-[#1db954] text-black font-bold rounded-lg hover:bg-[#22c55e]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
