import React from 'react';
import { X, Music2 } from 'lucide-react';
import { Song } from '../types';
import { getMockLyrics } from '../services/musicApi';

interface LyricsModalProps {
  song: Song;
  currentTime: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  song,
  currentTime,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const lyrics = getMockLyrics(song);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121218] border border-white/10 rounded-2xl w-full max-w-md p-6 max-h-[80vh] flex flex-col shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1db954]/10 text-[#1db954]">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base truncate max-w-[220px]">
                {song.title}
              </h3>
              <p className="text-xs text-zinc-400 truncate max-w-[220px]">
                {song.artist}
              </p>
            </div>
          </div>
          <button
            id="close-lyrics-modal"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-4 no-scrollbar">
          {lyrics.map((line, idx) => {
            const isActive =
              currentTime >= line.time &&
              (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].time);

            return (
              <div
                key={idx}
                className={`transition-all duration-300 py-1.5 px-3 rounded-lg ${
                  isActive
                    ? 'text-[#1db954] font-bold text-lg scale-105 bg-[#1db954]/10'
                    : 'text-zinc-400 text-sm hover:text-zinc-200'
                }`}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-white/10 text-center text-xs text-zinc-500">
          Synced with playback • Charan Music Live Engine
        </div>
      </div>
    </div>
  );
};
