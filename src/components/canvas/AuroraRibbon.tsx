import { useMemo, useRef } from 'react';
import { Mesh, CatmullRomCurve3, Vector3 } from 'three';
import * as TSL from 'three/tsl';
import { MeshBasicNodeMaterial } from 'three/webgpu';

export default function AuroraRibbon() {
  const meshRef = useRef<Mesh>(null);
  
  // 生成一条贯穿场景的抽象曲线 (从镜头前沿飞向深空)
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i < 30; i++) {
       points.push(new Vector3(
         Math.sin(i * 0.6) * 60, // 左右蜿蜒
         Math.cos(i * 0.4) * 20 + 20, // 上下游龙
         100 - i * 20 // 纵深拉伸
       ));
    }
    return new CatmullRomCurve3(points);
  }, []);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.side = 2; // DoubleSide
    mat.depthWrite = true; // 开启深度让其穿插有立体感
    
    const uv = TSL.uv();
    const time = TSL.time.mul(0.8);
    
    // 基于UV的流动波纹算法
    const wave = TSL.sin(uv.x.mul(15.0).add(time).add(uv.y.mul(8.0)));
    const wave2 = TSL.cos(uv.x.mul(25.0).sub(time.mul(1.5)));
    
    // 四色极光交织 (青、粉、黄、紫)
    const col1 = TSL.color(0x00ffcc); 
    const col2 = TSL.color(0xff00ff); 
    const col3 = TSL.color(0xffff00); 
    const col4 = TSL.color(0x5500ff); 
    
    const mix1 = TSL.mix(col1, col2, wave.add(1.0).mul(0.5));
    const mix2 = TSL.mix(col3, col4, wave2.add(1.0).mul(0.5));
    
    const finalMix = TSL.mix(mix1, mix2, TSL.sin(time.add(uv.x)).add(1.0).mul(0.5));
    
    // X轴方向逐渐消散的透明度，边缘平滑过度
    const edgeFade = TSL.sin(uv.y.mul(Math.PI));
    mat.opacityNode = edgeFade.pow(3.0).mul(0.6); // 更通透
    
    mat.colorNode = finalMix.mul(1.5); // 防止高光溢出变白

    // GPU顶点扭曲：让整个管道还在空间里随时间缓慢蠕动
    const pos = TSL.positionGeometry;
    const offset = TSL.sin(pos.z.mul(0.02).add(TSL.time.mul(0.5))).mul(8.0);
    mat.positionNode = TSL.vec3(pos.x.add(offset), pos.y.add(offset), pos.z);

    return mat;
  }, []);

  return (
    <mesh ref={meshRef} material={material}>
       {/* 构建长条管状极光体，把半径调细以增加轻盈感 */}
       <tubeGeometry args={[curve, 300, 2.5, 32, false]} />
    </mesh>
  );
}
