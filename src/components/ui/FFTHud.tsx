import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { fftDataArray } from '@/store/audioUniforms';

export default function FFTHud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioFileName = useAudioStore(s => s.audioFileName);

  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      // Clear
      ctx.clearRect(0, 0, width, height);
      
      // Draw minimal grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<height; i+=15) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
      for(let i=0; i<width; i+=15) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      ctx.stroke();

      // Draw FFT line
      ctx.beginPath();
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      
      const bars = 64;
      const barWidth = width / bars;
      
      for(let i = 0; i < bars; i++) {
          // Values are ~ -100 to 0
          const val = fftDataArray[i];
          const normalized = Math.max(0, (val + 100) / 100);
          const y = height - (normalized * height);
          
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * barWidth, y);
      }
      ctx.stroke();

      // Connect to bottom to fill area
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute left-6 bottom-6 z-20 flex flex-col items-start font-mono pointer-events-none">
       <div className="text-cyan-400 text-xs mb-2 tracking-widest bg-black/40 px-2 py-1 border border-cyan-500/30">
          SYS_AUD_LINK_ACTIVE: {audioFileName || "SYNTH_PROTOCOL"}
       </div>
       <div className="bg-black/60 backdrop-blur-md border border-cyan-500/50 p-2">
           <canvas ref={canvasRef} width={250} height={80} className="block" />
       </div>
    </div>
  );
}
