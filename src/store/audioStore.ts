import { create } from 'zustand';

interface AudioState {
  isReady: boolean;
  isWarping: boolean;
  audioFileUrl: string | null;
  audioFileName: string | null;
  fftData: Float32Array | null;
  setFftData: (data: Float32Array) => void;
  initAudio: () => void;
  setAudioFile: (file: File) => void;
  setAudioUrl: (url: string) => void;
  setWarping: (warp: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isReady: false,
  isWarping: false,
  audioFileUrl: null,
  audioFileName: null,
  fftData: null,
  setFftData: (data) => set({ fftData: data }),
  initAudio: () => set({ isReady: true }),
  setAudioFile: (file: File) => {
    const url = URL.createObjectURL(file);
    set({ audioFileUrl: url, audioFileName: file.name, isReady: true });
  },
  setAudioUrl: (url: string) => {
    // For external URLs, we just show a truncated name
    const shortName = url.includes('/') ? url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 16) + '...' : 'REMOTE_STREAM';
    set({ audioFileUrl: url, audioFileName: shortName, isReady: true });
  },
  setWarping: (warp) => set({ isWarping: warp })
}));
