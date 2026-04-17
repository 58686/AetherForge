'use client';

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { WebGPURenderer } from 'three/webgpu';
import Scene from '@/components/canvas/Scene';
import { useAudioStore } from '@/store/audioStore';
import FFTHud from '@/components/ui/FFTHud';

export default function AetherForgeEntry() {
  const glConfig = useMemo(() => {
    return (props: any) => new WebGPURenderer({ 
      canvas: props.canvas, 
      antialias: true,
      powerPreference: 'high-performance'
    }) as any;
  }, []);

  const isReady = useAudioStore(s => s.isReady);
  const initAudio = useAudioStore(s => s.initAudio);
  const setAudioFile = useAudioStore(s => s.setAudioFile);
  const setAudioUrl = useAudioStore(s => s.setAudioUrl);
  
  const [isHovering, setIsHovering] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
      }
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black text-white"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Audio Initialize Overlay */}
      {!isReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
            AETHER FORGE
          </h1>
          <p className="text-cyan-400/70 mb-10 tracking-widest font-mono">PHASE 2: SYNESTHESIA ONLINE</p>
          <button 
            onClick={() => initAudio()}
            className="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-mono tracking-widest hover:bg-cyan-400 hover:text-black transition-all duration-300"
          >
            [ INITIALIZE AUDIO LINK ]
          </button>
          <div className="mt-8 flex flex-col items-center">
             <p className="text-white/40 text-sm font-mono text-center mb-3">
               OR DRAG & DROP ANY .MP3 FILE HERE<br/>
               OR PASTE A DIRECT BGM URL:
             </p>
             <input 
               type="text" 
               value={urlInput}
               onChange={(e) => setUrlInput(e.target.value)}
               onKeyDown={(e) => {
                 if(e.key === 'Enter' && urlInput.trim() !== '') {
                   setAudioUrl(urlInput.trim());
                 }
               }}
               placeholder="https://example.com/audio.mp3"
               className="w-80 px-4 py-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-300 font-mono text-xs outline-none placeholder:text-cyan-800 focus:border-cyan-400 transition-colors"
             />
          </div>
        </div>
      )}

      {/* Drag Hover Overlay */}
      {isHovering && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-cyan-900/50 backdrop-blur-sm border-8 border-dashed border-cyan-400 pointer-events-none transition-all duration-200">
           <h2 className="text-3xl text-cyan-300 font-bold tracking-[0.2em] animate-pulse shadow-cyan-400 drop-shadow-lg">DROP AUDIO TO RE-RENDER REALITY</h2>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 select-none pointer-events-none">
        <h1 className="text-2xl font-bold tracking-[0.2em] text-white/80 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">AETHER FORGE</h1>
        <p className="text-xs text-cyan-300/80 tracking-widest mt-1">PROCEDURAL VIBE WORLD // PHASE 4 : HYPER-DRIVE</p>
      </div>

      <FFTHud />

      <Leva collapsed={false} theme={{ colors: { highlight1: '#0ff', accent1: '#0ff' } }} />

      <Canvas
        gl={glConfig}
        camera={{ position: [0, 10, 20], fov: 70 }}
        className="w-full h-full"
      >
        <Scene />
      </Canvas>
      
      <div className="absolute bottom-4 right-4 z-10 text-xs text-white/30 pointer-events-none space-y-1 font-mono text-right">
        <p>W A S D - MOVE</p>
        <p>MOUSE - LOOK</p>
        <p className="text-cyan-400 font-bold tracking-widest">HOLD SHIFT - WARP JUMP</p>
      </div>
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
    </div>
  );
}
