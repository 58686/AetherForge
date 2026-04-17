import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import * as TSL from 'three/tsl';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { bassUniform } from '../../store/audioUniforms';

export default function ArtifactSphere() {
  const sphereRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);

  const sphereMaterial = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    const coreColor = TSL.color(0x00ffff);
    const glowColor = TSL.color(0x00aaff);
    
    const time = TSL.time.mul(0.8);
    // 将普通的心跳 pulse 加上音频的重击力度
    const audioPulse = bassUniform.mul(2.0); 
    const pulse = TSL.sin(time).add(1.0).mul(0.5).add(audioPulse); 
    
    const normal = TSL.normalLocal;
    const viewVector = TSL.positionViewDirection;
    const rim = TSL.dot(normal, viewVector).clamp(0, 1).oneMinus();
    const rimPower = rim.pow(3.0); // 使边缘光更薄更亮
    
    mat.colorNode = TSL.mix(
      coreColor.mul(pulse).add(TSL.vec3(0.0)), 
      glowColor.mul(TSL.float(5.0).add(audioPulse.mul(5.0))), 
      rimPower
    );
    return mat;
  }, []);

  const ringMaterial = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = TSL.color(0x00ffcc).mul(3.0);
    mat.transparent = true;
    mat.side = 2; // DoubleSide
    
    mat.opacityNode = TSL.sin(TSL.positionGeometry.x.mul(0.5).add(TSL.time.mul(10.0))).add(1.0).mul(0.5);
    return mat;
  }, []);

  const ringMaterial2 = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = TSL.color(0xff00ff).mul(2.0); // 洋红色外环
    mat.transparent = true;
    mat.side = 2; // DoubleSide
    
    mat.opacityNode = TSL.cos(TSL.positionGeometry.y.mul(0.3).add(TSL.time.mul(5.0))).add(1.0).mul(0.5);
    mat.wireframe = true;
    return mat;
  }, []);

  useFrame((state, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 2.5;
      ring1Ref.current.rotation.y += delta * 1.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * 1.0;
      ring2Ref.current.rotation.z += delta * 3.0;
    }
    
    // Bind scale specifically to audio manually for objects 
    // Since TSL position scaling handles geometry, but manual scale is quick
    if (sphereRef.current) {
      // access the un-smoothed or smoothed bass value 
      // (Uniform value is accessible at runtime via .value)
      const scaleVal = 1.0 + (bassUniform.value * 0.5); 
      sphereRef.current.scale.setScalar(scaleVal);
    }
  });

  return (
    <group position={[0, 30, -150]}>
      {/* 中心球体 */}
      <mesh ref={sphereRef} material={sphereMaterial}>
        <sphereGeometry args={[25, 64, 64]} />
      </mesh>

      {/* 视界环 1 */}
      <mesh ref={ring1Ref} material={ringMaterial}>
        <torusGeometry args={[32, 0.5, 16, 100]} />
      </mesh>

      {/* 视界环 2 */}
      <mesh ref={ring2Ref} material={ringMaterial2}>
        <torusGeometry args={[40, 2, 16, 100]} />
      </mesh>
    </group>
  );
}
