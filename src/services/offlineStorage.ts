import { Song, OfflineSong } from '../types';

const DB_NAME = 'CharanMusicOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_songs';

// Cache of created object URLs to prevent memory leaks and recreate on demand
const objectUrlCache = new Map<string, string>();

/**
 * Request persistent browser storage so downloaded songs are never evicted by the OS or browser
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Open or initialize the IndexedDB instance
 */
export function initOfflineDB(): Promise<IDBDatabase> {
  // Request persistence in background
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open offline IndexedDB'));
    };
  });
}

/**
 * Helper to convert an image URL to a permanent base64 data URL for offline display
 */
async function cacheImageAsBase64(imageUrl: string): Promise<string> {
  if (!imageUrl || imageUrl.startsWith('data:')) return imageUrl;
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) return imageUrl;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve((reader.result as string) || imageUrl);
      };
      reader.onerror = () => resolve(imageUrl);
      reader.readAsDataURL(blob);
    });
  } catch {
    return imageUrl;
  }
}

/**
 * Download audio binary and persist full track into IndexedDB
 */
export async function saveSongOffline(
  song: Song,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; error?: string; sizeBytes?: number }> {
  try {
    onProgress?.(10);
    const db = await initOfflineDB();

    // 1. Fetch audio with timeout and retry fallback
    onProgress?.(25);

    let audioBlob: Blob | null = null;
    let sizeBytes = 0;

    // Try fetching via /api/download proxy first for CORS safety
    const safeTitle = song.title.replace(/[/\\?%*:|"<>]/g, '').trim();
    const safeArtist = song.artist.replace(/[/\\?%*:|"<>]/g, '').trim();
    const proxyUrl = `/api/download?url=${encodeURIComponent(song.audioUrl)}&title=${encodeURIComponent(
      safeTitle
    )}&artist=${encodeURIComponent(safeArtist)}`;

    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        onProgress?.(60);
        audioBlob = await res.blob();
        sizeBytes = audioBlob.size;
      }
    } catch (e) {
      console.warn('Proxy audio fetch error, trying direct fetch:', e);
    }

    if (!audioBlob || sizeBytes === 0) {
      try {
        const directRes = await fetch(song.audioUrl);
        if (directRes.ok) {
          onProgress?.(60);
          audioBlob = await directRes.blob();
          sizeBytes = audioBlob.size;
        }
      } catch (e) {
        console.warn('Direct audio fetch error:', e);
      }
    }

    if (!audioBlob || sizeBytes === 0) {
      return { success: false, error: 'Could not fetch audio data for offline storage' };
    }

    onProgress?.(80);

    // 2. Fetch and store offline cover art
    let offlineCover = song.coverUrl;
    try {
      offlineCover = await cacheImageAsBase64(song.coverUrl);
    } catch (e) {
      console.warn('Cover caching note:', e);
    }

    onProgress?.(90);

    // 3. Store record in IndexedDB
    const offlineRecord: OfflineSong = {
      ...song,
      coverUrl: offlineCover,
      downloadedAt: Date.now(),
      sizeBytes,
      audioBlob,
      isOffline: true,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(offlineRecord);

      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });

    onProgress?.(100);
    return { success: true, sizeBytes };
  } catch (error: any) {
    console.error('saveSongOffline failed:', error);
    return { success: false, error: error.message || 'Storage error' };
  }
}

/**
 * Retrieve all offline songs stored in the IndexedDB
 */
export async function getAllOfflineSongs(): Promise<OfflineSong[]> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const songs: OfflineSong[] = req.result || [];
        // Map songs to attach valid offline blob URLs
        const mapped = songs.map((s) => {
          if (s.audioBlob) {
            let blobUrl = objectUrlCache.get(s.id);
            if (!blobUrl) {
              blobUrl = URL.createObjectURL(s.audioBlob);
              objectUrlCache.set(s.id, blobUrl);
            }
            return {
              ...s,
              isOffline: true,
              offlineBlobUrl: blobUrl,
              audioUrl: blobUrl, // Point primary audio to the offline local blob!
            };
          }
          return { ...s, isOffline: true };
        });

        // Sort by most recently downloaded
        mapped.sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0));
        resolve(mapped);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('getAllOfflineSongs error:', error);
    return [];
  }
}

/**
 * Get an offline object URL for a given song ID
 */
export async function getOfflineAudioUrl(songId: string): Promise<string | null> {
  const cached = objectUrlCache.get(songId);
  if (cached) return cached;

  try {
    const db = await initOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(songId);

      req.onsuccess = () => {
        const song: OfflineSong = req.result;
        if (song && song.audioBlob) {
          const url = URL.createObjectURL(song.audioBlob);
          objectUrlCache.set(songId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Check if a song is already stored in the offline database
 */
export async function isSongDownloadedOffline(songId: string): Promise<boolean> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(songId);

      req.onsuccess = () => {
        resolve(req.result > 0);
      };

      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Delete a specific song from offline storage
 */
export async function deleteOfflineSong(songId: string): Promise<boolean> {
  try {
    const db = await initOfflineDB();
    if (objectUrlCache.has(songId)) {
      URL.revokeObjectURL(objectUrlCache.get(songId)!);
      objectUrlCache.delete(songId);
    }

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(songId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (error) {
    console.warn('deleteOfflineSong error:', error);
    return false;
  }
}

/**
 * Clear all offline stored songs
 */
export async function clearAllOfflineSongs(): Promise<boolean> {
  try {
    const db = await initOfflineDB();
    objectUrlCache.forEach((url) => URL.revokeObjectURL(url));
    objectUrlCache.clear();

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Format bytes to readable string (MB/GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Calculate total offline storage usage and item count
 */
export async function getOfflineStorageStats(): Promise<{ count: number; totalBytes: number; formattedSize: string }> {
  try {
    const songs = await getAllOfflineSongs();
    const count = songs.length;
    const totalBytes = songs.reduce((acc, song) => acc + (song.sizeBytes || 0), 0);
    return {
      count,
      totalBytes,
      formattedSize: formatBytes(totalBytes),
    };
  } catch {
    return { count: 0, totalBytes: 0, formattedSize: '0 MB' };
  }
}
