import React, { useState, useEffect, useRef } from 'react';
import { Song, NavTab, QuickMix, RepeatMode, Playlist } from './types';
import { CURATED_TRACKS } from './data/musicData';
import { searchSongs } from './services/musicApi';
import { BottomNav } from './components/BottomNav';
import { FloatingPlayer } from './components/FloatingPlayer';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { ChartsView } from './components/ChartsView';
import { LibraryView } from './components/LibraryView';
import { LyricsModal } from './components/LyricsModal';
import { QueueModal } from './components/QueueModal';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('home');

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

  // Storage State
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('charan_search_history');
      return saved ? JSON.parse(saved) : ['Pushpa 2', 'RRR', 'Devara', 'Arijit Singh'];
    } catch {
      return ['Pushpa 2', 'RRR', 'Devara'];
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

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

    const onError = (e: Event) => {
      console.warn('Audio playback encountered an issue:', e);
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

    if (audio.src !== currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Auto-play blocked or audio load failed:', err);
        });
      }
    }
  }, [currentSong]);

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
  const handlePlaySong = (song: Song, customQueue?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);

    if (customQueue && customQueue.length > 0) {
      setQueue(customQueue);
    } else if (!queue.some((s) => s.id === song.id)) {
      setQueue((prev) => [song, ...prev]);
    }

    // Add to recent tracks (deduped, max 10)
    setRecentTracks((prev) => [song, ...prev.filter((s) => s.id !== song.id)].slice(0, 10));
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

    // If more than 3 seconds into track, restart current track
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

      // Add to search history
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

  const isCurrentFavorite = currentSong
    ? favorites.some((f) => f.id === currentSong.id)
    : false;

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#1db954] selection:text-black">
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
            onPlaySong={handlePlaySong}
            onQuickMixSelect={handleQuickMixSelect}
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
            onShowToast={showToast}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsView
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            favorites={favorites}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onRemoveFavorite={handleToggleFavorite}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onPlayPlaylist={handlePlayPlaylist}
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
        onShowToast={showToast}
      />
    </div>
  );
};
