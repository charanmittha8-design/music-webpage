import React, { useState } from 'react';
import { X, ListMusic, Play, Trash2, Music, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { downloadSong } from '../services/musicApi';

interface QueueModalProps {
  queue: Song[];
  currentSong: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  onRemoveFromQueue: (songId: string) => void;
  onClearQueue: () => void;
  onShowToast?: (msg: string) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  queue,
  currentSong,
  isOpen,
  onClose,
  onSelectSong,
  onRemoveFromQueue,
  onClearQueue,
  onShowToast,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121218] border border-white/10 rounded-2xl w-full max-w-md p-5 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold">
            <ListMusic className="w-5 h-5 text-[#1db954]" />
            <span>Play Queue ({queue.length} Full Tracks)</span>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                id="clear-queue-btn"
                onClick={onClearQueue}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              id="close-queue-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs text-zinc-600 mt-1">Play any track to start a session</p>
            </div>
          ) : (
            queue.map((song, index) => {
              const isPlaying = currentSong?.id === song.id;
              const isThisDownloading = downloadingId === song.id;
              const isDownloaded = downloadedIds.has(song.id);

              return (
                <div
                  key={`${song.id}-${index}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isPlaying
                      ? 'bg-[#1db954]/15 border border-[#1db954]/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() => onSelectSong(song)}
                  >
                    <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-4 h-4 text-[#1db954] fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isPlaying ? 'text-[#1db954]' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-zinc-500 hidden sm:inline">{song.duration}</span>

                    {/* Download Button in Queue */}
                    <button
                      id={`queue-download-${song.id}`}
                      onClick={(e) => handleDownload(e, song)}
                      disabled={isThisDownloading}
                      className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${
                        isDownloaded
                          ? 'text-emerald-400'
                          : isThisDownloading
                          ? 'text-[#1db954] animate-pulse'
                          : 'text-zinc-500 hover:text-[#1db954]'
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

                    <button
                      id={`remove-queue-${song.id}`}
                      onClick={() => onRemoveFromQueue(song.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
