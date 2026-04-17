import * as TSL from 'three/tsl';

// 全局音频交互 Uniform 节点，可在任何材质中注入以驱动画面
export const bassUniform = TSL.uniform(0.0);
export const timePulseUniform = TSL.uniform(0.0);
export const fftDataArray = new Float32Array(64);
export const warpUniform = TSL.uniform(0.0);
