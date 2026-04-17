import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as TSL from 'three/tsl';
import { MeshPhysicalNodeMaterial } from 'three/webgpu';
import { bassUniform } from '../../store/audioUniforms';

export default function HolographicMonoliths() {
  const groupRef = useRef<Group>(null);
  
  const monolithCount = 12;
  const radius = 70;

  const mat = useMemo(() => {
    // 顶级物理光栅材质
    const material = new MeshPhysicalNodeMaterial();
    
    material.colorNode = TSL.color(0x050510);
    
    // 玻璃/金属混合物理属性
    material.metalnessNode = TSL.float(0.8);
    material.roughnessNode = TSL.float(0.1);    // 极度平滑的表面
    material.transmissionNode = TSL.float(0.9); // 高强度透射玻璃感
    material.iorNode = TSL.float(2.0);          // 高折射率
    
    // 核心科技：全息色散膜 (Iridescence)
    material.iridescenceNode = TSL.float(1.0);
    
    // 随着时间改变物理薄膜的厚度和折射系数，产生流动的彩虹全息色散反光
    const time = TSL.time;
    material.iridescenceIORNode = TSL.float(1.3).add(TSL.sin(time).mul(0.4));
    
    // 将音乐跳动与薄膜厚度绑定，鼓点砸下时闪出剧变彩虹
    material.iridescenceThicknessNode = TSL.float(400.0)
      .add(TSL.cos(time.mul(2.0)).mul(150.0))
      .add(bassUniform.mul(300.0));
      
    // 让每一个方碑拥有个体微小的发光能量
    material.emissiveNode = TSL.color(0x00ffcc).mul(0.1);

    return material;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // 阵列围绕中心球体缓慢公转
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 40, -150]}>
      {Array.from({ length: monolithCount }).map((_, i) => {
        const angle = (i / monolithCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
           // 方碑随着角度自然面向中心
          <mesh 
            key={i} 
            position={[x, 0, z]} 
            rotation={[0, -angle, 0]} 
            material={mat}
          >
            {/* 顶天立地的赛博修长方碑 */}
            <boxGeometry args={[6, 120, 6]} />
          </mesh>
        );
      })}
    </group>
  );
}
