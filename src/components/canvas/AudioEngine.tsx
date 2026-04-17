'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useFrame } from '@react-three/fiber';
import { useAudioStore } from '@/store/audioStore';
import { bassUniform, timePulseUniform, fftDataArray } from '@/store/audioUniforms';

export default function AudioEngine() {
  const isReady = useAudioStore(s => s.isReady);
  const audioFileUrl = useAudioStore(s => s.audioFileUrl);
  
  const fftRef = useRef<Tone.FFT | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);

  useEffect(() => {
    if (!isReady) return;

    let mounted = true;

    const initSynth = async () => {
      await Tone.start();
      if (!mounted) return;
      
      const fft = new Tone.FFT(64); // increased resolution for HUD
      fftRef.current = fft;

      let kickDrum: Tone.MembraneSynth | null = null;
      let drone: Tone.FMSynth | null = null;
      let loop: Tone.Loop | null = null;

      if (audioFileUrl) {
        // 用户自定义歌曲/URL模式
        // Note: For remote URLs, CORS must be allowed by the hosting server!
        const player = new Tone.Player({
          url: audioFileUrl,
          autostart: true,
          loop: true,
          onload: () => console.log('Audio Loaded: ', audioFileUrl),
          onerror: (e) => console.error('Audio Loading Error (CORS or Invalid format):', e)
        }).connect(fft).toDestination();
        playerRef.current = player;
      } else {
        // 内置 Synth 轨道模式
        kickDrum = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: "square" },
          envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 0.1 },
          volume: 8
        }).connect(fft).toDestination();

        drone = new Tone.FMSynth({
          harmonicity: 0.5,
          modulationIndex: 10,
          oscillator: { type: "sine" },
          modulation: { type: "sawtooth" },
          volume: -10
        }).connect(fft).toDestination();

        drone.triggerAttack("C1", Tone.now());

        loop = new Tone.Loop((time) => {
          kickDrum!.triggerAttackRelease("C1", "8n", time);
        }, "4n");

        Tone.Transport.bpm.value = 85; 
        Tone.Transport.start();
        loop.start(0);
      }

      return () => {
        Tone.Transport.stop();
        if (kickDrum) kickDrum.dispose();
        if (drone) drone.dispose();
        if (loop) loop.dispose();
        if (playerRef.current) {
           playerRef.current.stop();
           playerRef.current.dispose();
        }
        fft.dispose();
      };
    };

    let cleanupFn: (() => void) | undefined;
    initSynth().then(cleanup => {
       cleanupFn = cleanup;
    });

    return () => {
      mounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, [isReady]);

  useFrame((state) => {
    if (!isReady || !fftRef.current) return;
    
    // 获取 32 频段的数据 (dB 单位, 大约在 -100 到 0 之间)
    const values = fftRef.current.getValue();
    
    // Mutate global array without triggering react re-renders
    for(let i=0; i<64; i++) {
        fftDataArray[i] = values[i] as number;
    }
    
    // 单独拉出 0-2 低频（重低音/鼓点）作 Shader 参数
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        let val = (values[i] as number) + 120; // 根据实际信号拉伸阈值
        if (val < 0) val = 0;
        sum += val;
    }
    
    // 将低频强度规整化为一个动态乘数 (0.0 到 ~1.5左右)
    const normalizedBass = (sum / 3) / 100.0; 
    
    // 缓动更新 Uniform 避免强烈的硬切 (Lerp)
    bassUniform.value += (normalizedBass - bassUniform.value) * 0.4;
    timePulseUniform.value = state.clock.elapsedTime;
  });

  return null;
}
