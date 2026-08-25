export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec?: number;
  coverUrl: string;
  audioUrl: string;
  downloadUrl?: string;
  quality?: string;
  year?: string;
  language?: string;
  mood?: 'party' | 'sad' | 'romantic' | 'hype' | 'chill' | string;
  genre?: string;
  isFavorite?: boolean;
  isOffline?: boolean;
  offlineBlobUrl?: string;
  sizeBytes?: number;
}

export interface OfflineSong extends Song {
  downloadedAt: number;
  sizeBytes: number;
  audioBlob?: Blob;
}

export type AudioQuality = '320kbps' | '160kbps' | '96kbps';

export type NavTab = 'home' | 'search' | 'charts' | 'library';

export type RepeatMode = 'off' | 'all' | 'one';

export interface QuickMix {
  id: string;
  name: string;
  query: string;
  emoji: string;
  gradient: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
}

