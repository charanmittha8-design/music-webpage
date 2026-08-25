import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  WifiOff,
  CheckCircle2,
  Loader2,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { Song } from '../types';
import { downloadSong } from '../services/musicApi';
import { saveSongOffline, formatBytes } from '../services/offlineStorage';

interface DownloadModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadedOffline?: (song: Song) => void;
  onShowToast?: (msg: string) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  song,
  isOpen,
  onClose,
  onDownloadedOffline,
  onShowToast,
}) => {
  const [downloadMode, setDownloadMode] = useState<'both' | 'app' | 'mobile'>('both');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [completedType, setCompletedType] = useState<'app' | 'mobile' | 'both' | null>(null);

  if (!isOpen || !song) return null;

  const handleStartDownload = async (modeOverride?: 'both' | 'app' | 'mobile') => {
    const selectedMode = modeOverride || downloadMode;
    setIsProcessing(true);
    setProgress(15);
    setCompletedType(null);

    try {
      if (selectedMode === 'app' || selectedMode === 'both') {
        setStatusMessage('Saving full audio into Offline Vault (0 Data)...');
        setProgress(30);

        const offlineResult = await saveSongOffline(song, (p) => {
          setProgress(Math.round(20 + p * 0.4));
        });

        if (offlineResult.success) {
          onDownloadedOffline?.(song);
          onShowToast?.(`📱 "${song.title}" saved to Web App Offline Vault!`);
        } else {
          console.warn('Offline storage notice:', offlineResult.error);
        }
      }

      if (selectedMode === 'mobile' || selectedMode === 'both') {
        setStatusMessage('Preparing 320kbps MP3 for Mobile/Device storage...');
        setProgress(70);

        const fileResult = await downloadSong(song, (p) => {
          setProgress(Math.round(60 + p * 0.4));
        });

        if (fileResult) {
          onShowToast?.(`💾 "${song.title}.mp3" saved to your device Downloads!`);
        }
      }

      setProgress(100);
      setCompletedType(selectedMode);
      setStatusMessage('Done! Ready to listen anywhere.');

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        setCompletedType(null);
        setProgress(0);
      }, 1600);
    } catch (err: any) {
      console.error('Download action error:', err);
      setIsProcessing(false);
      onShowToast?.(`❌ Download encountered an issue: ${err.message || 'Network error'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121218] border border-white/15 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1db954] to-emerald-400 flex items-center justify-center text-black shadow-md">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Download Options</h3>
              <p className="text-[11px] text-zinc-400">Save for offline playback & device storage</p>
            </div>
          </div>
          <button
            id="close-download-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Song Preview Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1c1c24] border border-white/5">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30 flex-shrink-0">
                320kbps
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-1">
              <span>{song.duration}</span>
              <span>•</span>
              <span>{song.album}</span>
            </div>
          </div>
        </div>

        {/* Download Selection Choices */}
        {!isProcessing && !completedType ? (
          <div className="space-y-2.5">
            {/* Option 1: Both (Recommended) */}
            <div
              id="opt-download-both"
              onClick={() => setDownloadMode('both')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                downloadMode === 'both'
                  ? 'bg-gradient-to-r from-emerald-950/60 to-[#121218] border-[#1db954] shadow-lg ring-1 ring-[#1db954]/40'
                  : 'bg-[#181820] hover:bg-[#20202a] border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1db954] text-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">⚡ Download to App & Mobile (Recommended)</span>
                    <span className="text-[10px] font-extrabold bg-[#1db954] text-black px-2 py-0.5 rounded-full">
                      BEST
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Saves inside this webpage for <strong>zero-data offline playback</strong> AND downloads the <strong>.mp3 file to your phone</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Web App Offline Folder (Zero Data) */}
            <div
              id="opt-download-app"
              onClick={() => setDownloadMode('app')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                downloadMode === 'app'
                  ? 'bg-gradient-to-r from-emerald-950/60 to-[#121218] border-[#1db954] shadow-lg ring-1 ring-[#1db954]/40'
                  : 'bg-[#181820] hover:bg-[#20202a] border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">📱 Save to Webpage (Offline Mode • 0 Data)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Stored directly inside your browser. Listen anywhere in low network areas or flight mode without using data.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 3: Mobile / PC Downloads Folder */}
            <div
              id="opt-download-mobile"
              onClick={() => setDownloadMode('mobile')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                downloadMode === 'mobile'
                  ? 'bg-gradient-to-r from-emerald-950/60 to-[#121218] border-[#1db954] shadow-lg ring-1 ring-[#1db954]/40'
                  : 'bg-[#181820] hover:bg-[#20202a] border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">💾 Save MP3 to Phone / PC Downloads</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Downloads the raw 320kbps <code>{song.title}.mp3</code> file to your device storage to play in music apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Downloading Progress UI */
          <div className="py-6 px-3 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center mx-auto text-[#1db954]">
              {completedType ? (
                <CheckCircle2 className="w-8 h-8 text-[#1db954] animate-bounce" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                {completedType ? 'Download Complete! 🎉' : 'Downloading 320kbps Track...'}
              </h4>
              <p className="text-xs text-zinc-400">{statusMessage}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#1db954] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#1db954] font-bold">{progress}%</span>
          </div>
        )}

        {/* Action Button Footer */}
        {!isProcessing && !completedType && (
          <div className="flex items-center gap-3 pt-2">
            <button
              id="cancel-download-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-download-btn"
              type="button"
              onClick={() => handleStartDownload()}
              className="flex-[2] py-2.5 rounded-xl bg-[#1db954] hover:bg-[#22c55e] text-black font-extrabold text-xs transition-all shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadMode === 'both'
                  ? 'Download to App & Phone'
                  : downloadMode === 'app'
                  ? 'Save to App (Offline)'
                  : 'Save MP3 to Phone'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
