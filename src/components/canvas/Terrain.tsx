import { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import * as TSL from 'three/tsl';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { bassUniform } from '../../store/audioUniforms';

export default function Terrain({ isCeiling = false }: { isCeiling?: boolean }) {
  const meshRef = useRef<Mesh>(null);

  const terrainMaterial = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();

    const position = TSL.positionGeometry;
    // 天空倒影向反方向移动交错
    const timeSpeed = isCeiling ? -0.4 : 0.5;
    const time = TSL.time.mul(timeSpeed);
    
    const scaledXY = TSL.vec2(position.x.mul(0.1), position.y.mul(0.1));
    const waveX = TSL.sin(scaledXY.x.add(time));
    const waveY = TSL.cos(scaledXY.y.add(time.mul(0.8)));
    
    // 天蓬的起伏可以更夸张点，并加入音频 Bass 强度的直接干预
    const baseAmplitude = isCeiling ? 8.0 : 5.0;
    
    // 当重低音来袭时，让波峰瞬间暴涨 (0 到 15.0)
    const audioReactiveAmp = bassUniform.mul(15.0);
    const amplitude = TSL.float(baseAmplitude).add(audioReactiveAmp);
    
    const height = waveX.mul(waveY).mul(amplitude); 
    
    // 基础深色与亮色
    const baseColor = isCeiling ? 0x110022 : 0x020512;
    const peakColor = isCeiling ? 0xff0088 : 0x00d4ff;

    const color = TSL.mix(
      TSL.color(baseColor), 
      TSL.color(peakColor), 
      height.add(amplitude).div(amplitude.mul(2.0)).clamp(0, 1)
    );

    // 对于天花板，高度增量反向，这样看起来两边是对称包裹的
    const zOffset = isCeiling ? height.mul(-1.0) : height;

    mat.positionNode = TSL.vec3(position.x, position.y, position.z.add(zOffset));
    mat.colorNode = color;
    mat.wireframe = true;
    return mat;
  }, [isCeiling]);

  // 地面在 -5, 穹顶在 +35
  const yPos = isCeiling ? 35 : -5;
  // 倒转使其朝向内侧
  const rotation = isCeiling ? [Math.PI / 2, 0, 0] as const : [-Math.PI / 2, 0, 0] as const;

  return (
    <mesh ref={meshRef} material={terrainMaterial} rotation={rotation} position={[0, yPos, 0]}>
      <planeGeometry args={[250, 250, 150, 150]} />
    </mesh>
  );
}
