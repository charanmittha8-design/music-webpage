import React, { useState, useEffect, useRef } from 'react';
import { Song, OfflineSong, NavTab, QuickMix, RepeatMode, Playlist } from './types';
import { CURATED_TRACKS } from './data/musicData';
import { searchSongs } from './services/musicApi';
import {
  getAllOfflineSongs,
  deleteOfflineSong,
  clearAllOfflineSongs,
  getOfflineStorageStats,
  getOfflineAudioUrl,
} from './services/offlineStorage';
import { BottomNav } from './components/BottomNav';
import { FloatingPlayer } from './components/FloatingPlayer';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { ChartsView } from './components/ChartsView';
import { LibraryView } from './components/LibraryView';
import { LyricsModal } from './components/LyricsModal';
import { QueueModal } from './components/QueueModal';
import { DownloadModal } from './components/DownloadModal';
import { WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Network State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Audio Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(() => CURATED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => CURATED_TRACKS[0].durationSec || 256);
  const [volume, setVolume] = useState<number>(0.85);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Queue & Track Lists
  const [queue, setQueue] = useState<Song[]>(() => CURATED_TRACKS);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Offline Storage State (IndexedDB)
  const [offlineSongs, setOfflineSongs] = useState<OfflineSong[]>([]);
  const [offlineStorageBytes, setOfflineStorageBytes] = useState<number>(0);

  // Local Storage Data (Device-isolated)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('charan_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentTracks, setRecentTracks] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('charan_recent_tracks');
      return saved ? JSON.parse(saved) : CURATED_TRACKS.slice(0, 5);
    } catch {
      return CURATED_TRACKS.slice(0, 5);
    }
  });

  const [favorites, setFavorites] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('charan_favorites');
      return saved ? JSON.parse(saved) : CURATED_TRACKS.slice(0, 3);
    } catch {
      return CURATED_TRACKS.slice(0, 3);
    }
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('charan_playlists');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'pl-1',
              name: '🔥 Mega Blockbusters',
              description: 'Energetic soundtrack hits from big cinema',
              coverUrl: '',
              songs: CURATED_TRACKS.slice(0, 4),
            },
            {
              id: 'pl-2',
              name: '🌙 Midnight Chill',
              description: 'Smooth and relaxing melodies',
              coverUrl: '',
              songs: CURATED_TRACKS.slice(4, 8),
            },
          ];
    } catch {
      return [];
    }
  });

  // Modals & Overlays
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [downloadModalSong, setDownloadModalSong] = useState<Song | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Refresh Offline Songs from IndexedDB
  const refreshOfflineVault = async () => {
    try {
      const storedSongs = await getAllOfflineSongs();
      setOfflineSongs(storedSongs);
      const stats = await getOfflineStorageStats();
      setOfflineStorageBytes(stats.totalBytes);
    } catch (e) {
      console.warn('Error refreshing offline vault:', e);
    }
  };

  // Initial load of offline stored songs
  useEffect(() => {
    refreshOfflineVault();
  }, []);

  // Online / Offline Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('📶 Back online • Connected to network');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('📡 You are offline • Playing from Local Offline Vault');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('charan_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('charan_recent_tracks', JSON.stringify(recentTracks));
  }, [recentTracks]);

  useEffect(() => {
    localStorage.setItem('charan_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('charan_playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Audio Element Setup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      handleTrackEnd();
    };

    const onError = async (e: Event) => {
      console.warn('Audio playback encountered an issue:', e);
      // If network fails, try fallback to offline object URL if present
      if (currentSong) {
        const offlineUrl = await getOfflineAudioUrl(currentSong.id);
        if (offlineUrl && audio.src !== offlineUrl) {
          audio.src = offlineUrl;
          if (isPlaying) {
            audio.play().catch(() => {});
          }
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update Source when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (currentSong.durationSec) {
      setDuration(currentSong.durationSec);
    }

    const prepareAndPlay = async () => {
      // Check if this song is saved offline in IndexedDB
      let resolvedSrc = currentSong.audioUrl;
      const offlineMatch = offlineSongs.find((s) => s.id === currentSong.id);
      if (offlineMatch?.offlineBlobUrl) {
        resolvedSrc = offlineMatch.offlineBlobUrl;
      } else {
        const offlineBlob = await getOfflineAudioUrl(currentSong.id);
        if (offlineBlob) {
          resolvedSrc = offlineBlob;
        }
      }

      if (audio.src !== resolvedSrc) {
        audio.src = resolvedSrc;
        audio.currentTime = 0;
        setCurrentTime(0);
        if (isPlaying) {
          audio.play().catch((err) => {
            console.warn('Playback resume notice:', err);
          });
        }
      }
    };

    prepareAndPlay();
  }, [currentSong, offlineSongs]);

  // Play / Pause toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Play request interrupted:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume handler
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Play a specific song
  const handlePlaySong = async (song: Song, customQueue?: Song[]) => {
    // Check if song has local offline URL
    const offlineMatch = offlineSongs.find((s) => s.id === song.id);
    const playableSong = offlineMatch
      ? { ...song, audioUrl: offlineMatch.offlineBlobUrl || song.audioUrl, isOffline: true }
      : song;

    setCurrentSong(playableSong);
    setIsPlaying(true);

    if (customQueue && customQueue.length > 0) {
      setQueue(customQueue);
    } else if (!queue.some((s) => s.id === song.id)) {
      setQueue((prev) => [playableSong, ...prev]);
    }

    // Add to recent tracks (deduped, max 10)
    setRecentTracks((prev) => [playableSong, ...prev.filter((s) => s.id !== song.id)].slice(0, 10));
  };

  // Next Track Logic
  const handleNext = () => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      handlePlaySong(queue[randomIndex]);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      handlePlaySong(queue[currentIndex + 1]);
    } else {
      // Loop back to start if repeatMode is 'all'
      handlePlaySong(queue[0]);
    }
  };

  // Prev Track Logic
  const handlePrev = () => {
    if (queue.length === 0) return;

    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    if (currentIndex > 0) {
      handlePlaySong(queue[currentIndex - 1]);
    } else {
      handlePlaySong(queue[queue.length - 1]);
    }
  };

  // Track Ended Handler
  const handleTrackEnd = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }
    handleNext();
  };

  // Seek
  const handleSeek = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = sec;
      setCurrentTime(sec);
    }
  };

  // Repeat Mode Cycle
  const handleToggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  // Shuffle Toggle
  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    showToast(!isShuffle ? 'Shuffle turned on' : 'Shuffle turned off');
  };

  // Favorite Toggle
  const handleToggleFavorite = (song: Song) => {
    const exists = favorites.some((f) => f.id === song.id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== song.id));
      showToast('Removed from Liked Songs');
    } else {
      setFavorites((prev) => [song, ...prev]);
      showToast('Added to Liked Songs ❤️');
    }
  };

  // Add to Queue
  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
    showToast(`Added "${song.title}" to queue`);
  };

  // Remove from Queue
  const handleRemoveFromQueue = (songId: string) => {
    setQueue((prev) => prev.filter((s) => s.id !== songId));
  };

  // Clear Queue
  const handleClearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
    } else {
      setQueue([]);
    }
    showToast('Queue cleared');
  };

  // Perform Search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await searchSongs(query);
      setSearchResults(results);

      setSearchHistory((prev) => [
        query,
        ...prev.filter((item) => item.toLowerCase() !== query.toLowerCase()),
      ].slice(0, 8));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Quick Mix Click
  const handleQuickMixSelect = (mix: QuickMix) => {
    setActiveTab('search');
    handleSearch(mix.query);
  };

  // Playlists
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      coverUrl: '',
      songs: currentSong ? [currentSong] : [],
    };
    setPlaylists((prev) => [newPl, ...prev]);
    showToast(`Created playlist "${name}"`);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    showToast('Playlist deleted');
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      handlePlaySong(playlist.songs[0], playlist.songs);
      showToast(`Playing "${playlist.name}"`);
    } else {
      showToast('This playlist is empty');
    }
  };

  // Delete Offline Song
  const handleDeleteOfflineSong = async (songId: string) => {
    const ok = await deleteOfflineSong(songId);
    if (ok) {
      await refreshOfflineVault();
      showToast('Track removed from Offline Vault');
    }
  };

  // Clear All Offline Songs
  const handleClearAllOffline = async () => {
    if (window.confirm('Remove all stored songs from your offline vault?')) {
      await clearAllOfflineSongs();
      await refreshOfflineVault();
      showToast('Offline Vault cleared');
    }
  };

  // Request Download (Opens Modal)
  const handleRequestDownload = (song: Song) => {
    setDownloadModalSong(song);
  };

  const isCurrentFavorite = currentSong
    ? favorites.some((f) => f.id === currentSong.id)
    : false;

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#1db954] selection:text-black">
      {/* 👑 Top App Brand Bar (Persistent on all screens for high visibility) */}
      <header className="sticky top-0 z-30 bg-[#070708]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1db954] to-emerald-400 p-[2px] shadow-lg shadow-emerald-950/40">
              <div className="w-full h-full rounded-[10px] bg-[#0c0c10] flex items-center justify-center font-extrabold text-xs text-[#1db954]">
                CM
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">CHARAN MUSIC</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-sm">
                  PREMIUM
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-none">
                Full 320kbps • Zero-Data Offline Vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold animate-pulse">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
                <span>Ultra HD 320K</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Offline Status Top Bar (when user is offline) */}
      {!isOnline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 px-4 py-1.5 text-xs text-center font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Playing from your Local Offline Vault with 0 Data</span>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1db954] text-black font-bold px-4 py-2 rounded-full shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-y-auto px-4 sm:px-6 py-5 max-w-2xl mx-auto w-full no-scrollbar transition-all ${
          currentSong ? 'pb-44' : 'pb-24'
        }`}
      >
        {activeTab === 'home' && (
          <HomeView
            currentSong={currentSong}
            isPlaying={isPlaying}
            recentTracks={recentTracks}
            offlineSongs={offlineSongs}
            onPlaySong={handlePlaySong}
            onQuickMixSelect={handleQuickMixSelect}
            onRequestDownload={handleRequestDownload}
            onNavigateTab={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchHistory={searchHistory}
            isLoading={isSearching}
            currentSong={currentSong}
            isPlaying={isPlaying}
            favorites={favorites}
            onSearch={handleSearch}
            onSelectSong={handlePlaySong}
            onClearHistoryItem={(item) =>
              setSearchHistory((prev) => prev.filter((i) => i !== item))
            }
            onClearAllHistory={() => setSearchHistory([])}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={handleAddToQueue}
            onRequestDownload={handleRequestDownload}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsView
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onRequestDownload={handleRequestDownload}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            favorites={favorites}
            playlists={playlists}
            offlineSongs={offlineSongs}
            offlineStorageBytes={offlineStorageBytes}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onRemoveFavorite={handleToggleFavorite}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onPlayPlaylist={handlePlayPlaylist}
            onDeleteOfflineSong={handleDeleteOfflineSong}
            onClearAllOffline={handleClearAllOffline}
            onRequestDownload={handleRequestDownload}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Persistent Floating Player */}
      {currentSong && (
        <FloatingPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          isFavorite={isCurrentFavorite}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          onPrev={handlePrev}
          onNext={handleNext}
          onVolumeChange={handleVolumeChange}
          onToggleRepeat={handleToggleRepeat}
          onToggleShuffle={handleToggleShuffle}
          onToggleFavorite={handleToggleFavorite}
          onOpenLyrics={() => setIsLyricsOpen(true)}
          onOpenQueue={() => setIsQueueOpen(true)}
          onRequestDownload={handleRequestDownload}
          onShowToast={showToast}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Lyrics Modal */}
      {currentSong && (
        <LyricsModal
          song={currentSong}
          currentTime={currentTime}
          isOpen={isLyricsOpen}
          onClose={() => setIsLyricsOpen(false)}
        />
      )}

      {/* Queue Modal */}
      <QueueModal
        queue={queue}
        currentSong={currentSong}
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        onSelectSong={handlePlaySong}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        onRequestDownload={handleRequestDownload}
        onShowToast={showToast}
      />

      {/* Download Options Modal (Web App Offline & Mobile Storage) */}
      <DownloadModal
        song={downloadModalSong}
        isOpen={!!downloadModalSong}
        onClose={() => setDownloadModalSong(null)}
        onDownloadedOffline={async () => {
          await refreshOfflineVault();
        }}
        onShowToast={showToast}
      />
    </div>
  );
};
