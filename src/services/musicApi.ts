import CryptoJS from 'crypto-js';
import { Song } from '../types';
import { CURATED_TRACKS } from '../data/musicData';

/**
 * Decrypt JioSaavn DES encrypted_media_url to get high-quality 320kbps full track audio URL
 */
export function decryptSaavnMediaUrl(encryptedUrl: string, quality: '320' | '160' | '96' = '320'): string {
  if (!encryptedUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(
      cipherParams,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!rawUrl) return '';

    if (quality === '320') {
      return rawUrl.replace(/_96\.mp4|_48\.mp4|_160\.mp4/, '_320.mp4');
    } else if (quality === '160') {
      return rawUrl.replace(/_96\.mp4|_48\.mp4|_320\.mp4/, '_160.mp4');
    } else {
      return rawUrl;
    }
  } catch (error) {
    console.warn('Media URL decryption failed:', error);
    return '';
  }
}

/**
 * Decode HTML entities like &quot;, &#039;, &amp;
 */
export function cleanHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&bull;/g, '•');
}

/**
 * Client-side fuzzy search when backend or external APIs are down
 */
function localFuzzySearch(query: string): Song[] {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = CURATED_TRACKS.map((song) => {
    let score = 0;
    const title = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    const album = song.album.toLowerCase();

    if (title.includes(q)) score += 50;
    if (artist.includes(q)) score += 30;
    if (album.includes(q)) score += 20;

    for (const token of tokens) {
      if (title.includes(token)) score += 15;
      if (artist.includes(token)) score += 10;
      if (album.includes(token)) score += 5;
    }

    return { song, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.song);
}

/**
 * Search full songs with 320kbps audio.
 * Queries backend proxy /api/search (handling JioSaavn + Saavn mirror + iTunes) with guaranteed local offline fallback.
 */
export async function searchSongs(query: string): Promise<Song[]> {
  const trimmed = query.trim();
  if (!trimmed) return CURATED_TRACKS;

  // 1. Primary: Query our dedicated Express backend proxy
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Backend /api/search unreachable, trying direct client-side fallback:', err);
  }

  // 2. Secondary: Direct client-side Saavn Mirror API (CORS-friendly)
  try {
    const mirrorUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(trimmed)}&page=1&limit=25`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const mirrorRes = await fetch(mirrorUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (mirrorRes.ok) {
      const mirrorData = await mirrorRes.json();
      const list = mirrorData.data?.results || mirrorData.results || [];
      if (Array.isArray(list) && list.length > 0) {
        const mirrorSongs: Song[] = [];
        for (const item of list) {
          const downloadList = item.downloadUrl || [];
          const bestAudio =
            downloadList.find((d: any) => d.quality === '320kbps')?.url ||
            downloadList.find((d: any) => d.quality === '160kbps')?.url ||
            downloadList[downloadList.length - 1]?.url ||
            item.url;

          if (bestAudio) {
            const durSec = parseInt(item.duration || '210', 10);
            const mins = Math.floor(durSec / 60);
            const secs = durSec % 60;
            const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

            const images = item.image || [];
            const cover =
              (Array.isArray(images) ? images[images.length - 1]?.url : images) ||
              'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500';

            const artistName =
              item.artists?.primary?.[0]?.name ||
              item.primaryArtists ||
              item.artist ||
              'Artist';

            mirrorSongs.push({
              id: item.id || `mirror-${Math.random()}`,
              title: cleanHtml(item.name || item.title),
              artist: cleanHtml(artistName),
              album: cleanHtml(item.album?.name || item.album || item.name || 'Single'),
              duration: durationStr,
              durationSec: durSec,
              coverUrl: cover,
              audioUrl: bestAudio,
              downloadUrl: `/api/download?url=${encodeURIComponent(bestAudio)}&title=${encodeURIComponent(cleanHtml(item.name || item.title))}&artist=${encodeURIComponent(cleanHtml(artistName))}`,
              quality: '320kbps HD',
              year: item.year || '2024',
              language: item.language || 'Music',
              isPreview: false,
              source: 'saavn-mirror',
            });
          }
        }
        if (mirrorSongs.length > 0) {
          return mirrorSongs;
        }
      }
    }
  } catch (err) {
    console.warn('Client-side mirror search note:', err);
  }

  // 2.5 Alternative Mirror: JioSaavn Unofficial Mirror
  try {
    const altMirrorUrl = `https://jiosaavn-api-tau.vercel.app/search/songs?query=${encodeURIComponent(trimmed)}`;
    const altRes = await fetch(altMirrorUrl);
    if (altRes.ok) {
      const altData = await altRes.json();
      const list = altData.data?.results || altData.results || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => ({
          id: item.id || `alt-${Math.random()}`,
          title: cleanHtml(item.name || item.title),
          artist: cleanHtml(item.primaryArtists || item.artist || 'Artist'),
          album: cleanHtml(item.album?.name || item.album || 'Single'),
          duration: item.duration || '3:30',
          durationSec: parseInt(item.duration, 10) || 210,
          coverUrl: item.image?.[item.image?.length - 1]?.url || item.image?.[0]?.url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500',
          audioUrl: item.downloadUrl?.[item.downloadUrl?.length - 1]?.url || item.downloadUrl?.[0]?.url || item.url,
          quality: '320kbps HD',
          year: item.year || '2024',
          language: item.language || 'Music',
          isPreview: false,
          source: 'saavn-alt',
        }));
      }
    }
  } catch (err) {
    console.warn('Alt mirror search failed:', err);
  }

  // 3. Tertiary: Direct client-side iTunes API fetch (100% available globally)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=25`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const itunesRes = await fetch(itunesUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      const itunesList = itunesData.results || [];
      if (Array.isArray(itunesList) && itunesList.length > 0) {
        const itunesSongs: Song[] = itunesList
          .filter((item: any) => item.previewUrl)
          .map((item: any) => {
            const durSec = Math.floor((item.trackTimeMillis || 210000) / 1000);
            const mins = Math.floor(durSec / 60);
            const secs = durSec % 60;
            const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            const cover = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');

            return {
              id: `itunes-${item.trackId || Math.random()}`,
              title: item.trackName || item.collectionName || 'Track',
              artist: item.artistName || 'Artist',
              album: item.collectionName || item.trackName || 'Album',
              duration: durationStr,
              durationSec: durSec,
              coverUrl: cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
              audioUrl: item.previewUrl,
              downloadUrl: `/api/download?url=${encodeURIComponent(item.previewUrl)}&title=${encodeURIComponent(item.trackName || 'Song')}&artist=${encodeURIComponent(item.artistName || 'Artist')}`,
              quality: 'High Fidelity',
              year: (item.releaseDate || '').substring(0, 4) || '2024',
              language: item.primaryGenreName || 'Music',
              isPreview: true,
              source: 'itunes',
            };
          });

        if (itunesSongs.length > 0) {
          return itunesSongs;
        }
      }
    }
  } catch (err) {
    console.warn('Client-side iTunes search note:', err);
  }

  // 4. Local fuzzy search over verified catalog (no fake tracks)
  return localFuzzySearch(trimmed);
}

/**
 * Trigger browser download of full song MP3/Audio file
 */
export async function downloadSong(
  song: Song,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  try {
    onProgress?.(15);
    const safeTitle = song.title.replace(/[/\\?%*:|"<>]/g, '').trim();
    const safeArtist = song.artist.replace(/[/\\?%*:|"<>]/g, '').trim();
    const fileName = `${safeTitle} - ${safeArtist}.mp3`;

    // 1. If downloadUrl is already our backend proxy or valid
    const targetUrl = song.downloadUrl?.startsWith('/api/download')
      ? song.downloadUrl
      : `/api/download?url=${encodeURIComponent(song.audioUrl)}&title=${encodeURIComponent(
          safeTitle
        )}&artist=${encodeURIComponent(safeArtist)}`;

    // Try fetching with progress
    try {
      const response = await fetch(targetUrl);
      if (response.ok) {
        onProgress?.(50);
        const blob = await response.blob();
        onProgress?.(85);

        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
        }, 1000);

        onProgress?.(100);
        return true;
      }
    } catch {
      // If backend proxy had an issue, fallback to direct anchor click
    }

    // 2. Fallback: Direct Anchor Download
    onProgress?.(60);
    const a = document.createElement('a');
    a.href = song.audioUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onProgress?.(100);
    return true;
  } catch (error) {
    console.warn('Download error:', error);
    return false;
  }
}

/**
 * Fetch mood and vibe-matched recommendations from backend or fallback to smart client engine
 */
export async function fetchMoodRecommendations(song: Song): Promise<Song[]> {
  try {
    const mood = song.mood || 'party';
    const res = await fetch(
      `/api/recommendations?songId=${encodeURIComponent(song.id)}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}&language=${encodeURIComponent(song.language || 'Telugu')}&mood=${encodeURIComponent(mood)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Mood recommendation fetch warning:', err);
  }
  return [];
}

/**
 * Fetch latest Indian song releases automatically from backend
 */
export async function fetchNewReleases(): Promise<Song[]> {
  try {
    const res = await fetch('/api/new-releases');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('New releases fetch error:', err);
  }
  return [];
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getMockLyrics(song: Song): { time: number; text: string }[] {
  const titleLower = song.title.toLowerCase();

  if (titleLower.includes('believer')) {
    return [
      { time: 0, text: 'First things first, I\'ma say all the words inside my head' },
      { time: 6, text: 'I\'m fired up and tired of the way that things have been, oh-ooh' },
      { time: 13, text: 'The way that things have been, oh-ooh' },
      { time: 18, text: 'Second thing second, don\'t you tell me what you think that I can be' },
      { time: 24, text: 'I\'m the one at the sail, I\'m the master of my sea, oh-ooh' },
      { time: 30, text: 'The master of my sea, oh-ooh' },
      { time: 35, text: 'I was broken from a young age' },
      { time: 38, text: 'Taking my sulking to the masses' },
      { time: 41, text: 'Writing my poems for the few' },
      { time: 44, text: 'That look at me, took to me, shook to me, feeling me' },
      { time: 47, text: 'Singing from heartache from the pain' },
      { time: 51, text: 'Taking my message from the veins' },
      { time: 54, text: 'Speaking my lesson from the brain' },
      { time: 57, text: 'Seeing the beauty through the...' },
      { time: 60, text: 'PAIN! You made me a, you made me a believer, believer!' },
      { time: 68, text: 'PAIN! You break me down, you build me up, believer, believer!' },
      { time: 76, text: 'Pain! Oh, let the bullets fly, oh, let them rain' },
      { time: 82, text: 'My life, my love, my drive, it came from...' },
      { time: 86, text: 'PAIN! You made me a, you made me a believer, believer!' },
      { time: 96, text: 'Third things third, send a prayer to the ones up above' },
      { time: 102, text: 'All the hate that you\'ve heard has turned your spirit to a dove, oh-ooh' },
      { time: 109, text: 'Your spirit up above, oh-ooh' },
      { time: 114, text: 'I was choking in the crowd, building my rain up in the cloud' },
      { time: 120, text: 'Falling like ashes to the ground, hoping my feelings they would drown' },
      { time: 126, text: 'PAIN! You made me a, you made me a believer, believer!' },
    ];
  }

  if (titleLower.includes('magenta') || titleLower.includes('riddim')) {
    return [
      { time: 0, text: '🎵 [DJ Snake - Magenta Riddim] 🎵' },
      { time: 4, text: '🔥 Heavy Bass Drop Incoming 🔥' },
      { time: 12, text: '🎺 High-Energy Brass & Horns Rhythms 🎺' },
      { time: 25, text: '🥁 Feel the infectious South Indian & Global EDM Fusion Beat!' },
      { time: 40, text: '⚡ Dance, Jump, & Vibe to the Riddim ⚡' },
      { time: 60, text: '🔊 Bass Boost 320kbps Drop 🔊' },
      { time: 85, text: '💃 Maximum Energy Rave Sound 💃' },
      { time: 110, text: '✨ DJ Snake International Dance Party ✨' },
      { time: 140, text: '🎵 Relentless Groove & Festival Beat 🎵' },
      { time: 170, text: '💥 Outro - Magenta Riddim 💥' },
    ];
  }

  if (titleLower.includes('faded')) {
    return [
      { time: 0, text: 'You were the shadow to my light' },
      { time: 6, text: 'Did you feel us? Another start' },
      { time: 13, text: 'You fade away, afraid our aim is out of sight' },
      { time: 20, text: 'Wanna see us, alive' },
      { time: 27, text: 'Where are you now?' },
      { time: 34, text: 'Where are you now?' },
      { time: 41, text: 'Where are you now? Was it all in my fantasy?' },
      { time: 48, text: 'Where are you now? Were you only imaginary?' },
      { time: 55, text: 'Where are you now? Atlantis, under the sea, under the sea' },
      { time: 68, text: 'Where are you now? Another dream' },
      { time: 76, text: 'The monster\'s running wild inside of me' },
      { time: 82, text: 'I\'m faded, I\'m faded' },
      { time: 90, text: 'So lost, I\'m faded, I\'m faded' },
      { time: 98, text: 'So lost, I\'m faded' },
    ];
  }

  if (titleLower.includes('bones')) {
    return [
      { time: 0, text: 'Gimme, gimme, gimme some room to breathe' },
      { time: 4, text: 'Can\'t recognize the face looking back at me' },
      { time: 8, text: 'I got this feeling inside my bones' },
      { time: 12, text: 'It goes electric, wavy when I turn it on' },
      { time: 18, text: 'All through my city, all through my home' },
      { time: 22, text: 'We\'re flying up, no ceiling, when we\'re in our zone' },
      { time: 28, text: 'I got that sunshine in my pocket, got that good soul in my feet' },
      { time: 35, text: 'I feel that hot blood in my body when it drops, ooh' },
      { time: 42, text: 'I can\'t take my eyes up off it, moving so phenomenally' },
      { time: 49, text: 'Room on lock, the way we rock it, so don\'t stop' },
    ];
  }

  if (titleLower.includes('pushpa pushpa')) {
    return [
      { time: 0, text: 'Pushpa Pushpa Pushpa... Pushpa Raj!' },
      { time: 12, text: 'Charanam kalipithe thadabada ledu' },
      { time: 24, text: 'Thokkina thalapai vanukulu levu' },
      { time: 36, text: 'Gaddame leni pillaliki gatham telidu' },
      { time: 48, text: 'Ee Rajuki edure lene ledu!' },
      { time: 60, text: 'Taggede Le! Pushpa Raj!' },
      { time: 75, text: 'Fire ledu Wild Fire!' },
      { time: 90, text: 'Pushpa... Pushpa... Pushpa Pushpa Pushparaj!' },
    ];
  }

  const dur = song.durationSec || 220;
  const step = Math.floor(dur / 8);

  return [
    { time: 0, text: `🎵 [Intro - ${song.title}] 🎵` },
    { time: Math.min(step * 1, 15), text: `Vocals by ${song.artist}` },
    { time: Math.min(step * 2, 40), text: `Feel the energetic rhythm and vibe` },
    { time: Math.min(step * 3, 75), text: `Streaming full high-definition 320kbps audio` },
    { time: Math.min(step * 4, 110), text: `Every beat resonates with crystal clarity` },
    { time: Math.min(step * 5, 145), text: `✨ Experience the magic of music ✨` },
    { time: Math.min(step * 6, 175), text: `From album: ${song.album}` },
    { time: Math.min(step * 7, 205), text: `🎶 Charan Music Premium Sound 🎶` },
  ];
}
