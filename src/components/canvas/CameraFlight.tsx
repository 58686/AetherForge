import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3, MathUtils } from 'three';
import { useAudioStore } from '@/store/audioStore';
import { warpUniform } from '@/store/audioUniforms';

const SPEED = 25.0;
const WARP_SPEED_MULTIPLIER = 15.0;

export default function CameraFlight() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const setWarping = useAudioStore(s => s.setWarping);
  
  const moveState = useRef({
    forward: false, backward: false,
    left: false, right: false,
    up: false, down: false
  });

  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'Space': moveState.current.up = true; break;
        case 'KeyC': moveState.current.down = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': 
           setWarping(true); 
           break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyD': moveState.current.right = false; break;
        case 'Space': moveState.current.up = false; break;
        case 'KeyC': moveState.current.down = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': 
           setWarping(false); 
           break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    velocity.current.x -= velocity.current.x * 5.0 * delta;
    velocity.current.y -= velocity.current.y * 5.0 * delta;
    velocity.current.z -= velocity.current.z * 5.0 * delta;

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
    direction.current.y = Number(moveState.current.up) - Number(moveState.current.down);
    
    direction.current.normalize();

    const isWarping = useAudioStore.getState().isWarping;
    const currentSpeed = isWarping ? SPEED * WARP_SPEED_MULTIPLIER : SPEED;
    
    // Smoothly interpolate FOV for cinematic Warp effect
    const targetFov = isWarping ? 120 : 75;
    (camera as any).fov = MathUtils.lerp((camera as any).fov, targetFov, delta * 3.0);
    camera.updateProjectionMatrix();
    
    warpUniform.value = MathUtils.lerp(warpUniform.value, isWarping ? 1.0 : 0.0, delta * 3.0);

    if (moveState.current.forward || moveState.current.backward) velocity.current.z -= direction.current.z * currentSpeed * delta;
    if (moveState.current.left || moveState.current.right) velocity.current.x -= direction.current.x * currentSpeed * delta;
    if (moveState.current.up || moveState.current.down) velocity.current.y -= direction.current.y * currentSpeed * delta;

    controlsRef.current.moveRight(-velocity.current.x * delta);
    controlsRef.current.moveForward(-velocity.current.z * delta);
    
    // Auto drift forward natively inside warp speed if not manually pressing back
    if (isWarping && !moveState.current.backward) {
       controlsRef.current.moveForward(currentSpeed * 0.5 * delta);
    }
    
    camera.position.y += velocity.current.y * delta;
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
    </>
  );
}
