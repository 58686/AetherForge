import { useMemo } from 'react';
import * as TSL from 'three/tsl';
import { PointsNodeMaterial } from 'three/webgpu';
import { extend } from '@react-three/fiber';

extend({ PointsNodeMaterial });

export default function StarSky() {
  const pointsCount = 3000;

  const positions = useMemo(() => {
    const arr = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      // Create a giant dome of stars
      const distance = 250 + Math.random() * 150;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // We only want stars above or slightly below horizon
      arr[i * 3 + 0] = distance * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = Math.abs(distance * Math.cos(phi)) - 20; 
      arr[i * 3 + 2] = distance * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [pointsCount]);

  const starMaterial = useMemo(() => {
    const mat = new PointsNodeMaterial();
    
    const time = TSL.time.mul(2.0);
    // Use vertex position to create random twinkle speeds
    const rand = TSL.positionGeometry.x.add(TSL.positionGeometry.y).mod(100).div(100.0);
    const twinkle = TSL.sin(time.add(rand.mul(Math.PI * 2.0))).add(1.0).mul(0.5);

    mat.colorNode = TSL.color(0xffffff).mul(twinkle.add(0.2));
    mat.size = 1.0;
    mat.sizeAttenuation = false;
    mat.transparent = true;
    
    return mat;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <primitive object={starMaterial} attach="material" />
    </points>
  );
}
