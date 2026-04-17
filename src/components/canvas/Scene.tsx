import { extend } from '@react-three/fiber';
import { MeshBasicNodeMaterial, MeshPhysicalNodeMaterial } from 'three/webgpu';
import Terrain from './Terrain';
import CameraFlight from './CameraFlight';
import ArtifactSphere from './ArtifactSphere';
import StarSky from './StarSky';
import MagicParticles from './MagicParticles';
import AudioEngine from './AudioEngine';
import AuroraRibbon from './AuroraRibbon';
import HolographicMonoliths from './HolographicMonoliths';

extend({ MeshBasicNodeMaterial, MeshPhysicalNodeMaterial });

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#010308']} />
      {/* 浓郁的赛博/Lofi宇宙渐变深渊雾效 */}
      <fog attach="fog" args={['#010308', 30, 250]} />

      {/* 增强真实物理环境光，激发全息方碑材质属性 */}
      <ambientLight intensity={1.5} color="#ddddff" />
      <pointLight position={[0, 40, -150]} intensity={50000} distance={400} color="#00ffcc" />
      <pointLight position={[0, -10, 0]} intensity={20000} distance={100} color="#ff0088" />
      
      <AudioEngine />
      <AuroraRibbon />
      <HolographicMonoliths />
      <StarSky />
      <ArtifactSphere />
      <MagicParticles />
      <Terrain />
      <Terrain isCeiling={true} />

      <CameraFlight />
    </>
  );
}
