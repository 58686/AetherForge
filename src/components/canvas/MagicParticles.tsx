import { useMemo } from 'react';
import * as TSL from 'three/tsl';
import { PointsNodeMaterial } from 'three/webgpu';
import { warpUniform } from '../../store/audioUniforms';

export default function MagicParticles() {
  const particleCount = 10000;
  const cometCount = 300; // 流星数量

  const initialPositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 200; 
      arr[i * 3 + 1] = Math.random() * 40;          
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200; 
    }
    return arr;
  }, [particleCount]);

  const cometPositions = useMemo(() => {
    const arr = new Float32Array(cometCount * 3);
    for (let i = 0; i < cometCount; i++) {
      // 流星在更高的高空生成，更广阔的范围
      arr[i * 3 + 0] = (Math.random() - 0.5) * 300; 
      arr[i * 3 + 1] = 50 + Math.random() * 50;          
      arr[i * 3 + 2] = (Math.random() - 0.5) * 300; 
    }
    return arr;
  }, [cometCount]);

  const material = useMemo(() => {
    const mat = new PointsNodeMaterial();
    const basePos = TSL.positionGeometry;
    const time = TSL.time.mul(0.3);
    const localTime = time.add(basePos.x.add(basePos.z).mod(100.0).div(100.0));
    
    const driftY = TSL.time.mul(2.0).mod(40.0);
    const driftX = TSL.sin(basePos.y.mul(0.1).add(time)).mul(4.0);
    const driftZ = TSL.cos(basePos.y.mul(0.1).add(time.mul(0.8))).mul(4.0);
    
    // 漂浮与重置高度
    const newY = basePos.y.add(driftY).mod(40.0);

    mat.positionNode = TSL.vec3(basePos.x.add(driftX), newY, basePos.z.add(driftZ));
    mat.colorNode = TSL.mix(TSL.color(0x00d4ff), TSL.color(0xff00ff), TSL.sin(localTime.mul(5.0)));
    mat.size = 1.5;
    mat.sizeAttenuation = true;
    mat.transparent = true;
    mat.depthWrite = false;
    return mat;
  }, []);

  const cometMaterial = useMemo(() => {
    const mat = new PointsNodeMaterial();
    const basePos = TSL.positionGeometry;
    
    // 极速流体速度，再加上光速跃迁的恐怖倍率
    const speed = basePos.x.mod(5.0).add(15.0).add(warpUniform.mul(200.0)); // 随机高速
    const distanceTraveled = TSL.time.mul(speed);
    
    // 朝向某个透视方向极速坠落
    const newX = basePos.x.add(distanceTraveled);
    const newY = basePos.y.sub(distanceTraveled.mul(0.5));
    const newZ = basePos.z.add(distanceTraveled);

    // 循环重置使得流星不断从远方划来
    mat.positionNode = TSL.vec3(
      newX.mod(400.0).sub(200.0), 
      newY.mod(100.0), 
      newZ.mod(400.0).sub(200.0)
    );

    // 高亮度极速尾迹质感，跃迁时更蓝更亮
    mat.colorNode = TSL.color(0xffffff).mul(TSL.float(3.0).add(warpUniform.mul(10.0)));
    
    // 跃迁时产生强烈的拉扯拉近体积效应
    ;(mat as any).sizeNode = TSL.float(2.0).add(warpUniform.mul(5.0));
    mat.sizeAttenuation = true;
    mat.transparent = true;
    return mat;
  }, []);

  return (
    <group>
      {/* 慢速环境魔法尘埃 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>

      {/* 高速流星群 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cometPositions, 3]} />
        </bufferGeometry>
        <primitive object={cometMaterial} attach="material" />
      </points>
    </group>
  );
}
