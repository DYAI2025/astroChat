import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const ZODIAC_SIGNS = [
  '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'
];

const Ring = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Extremely slow, deliberate rotation of the wheel itself (Z-axis)
      // Simulating the slow march of the heavens.
      groupRef.current.rotation.z -= 0.0001;

      // Organic, chaotic drift on X and Y axes
      // Using multiple sine waves with different prime-based frequencies creates a non-repeating, fluid motion.
      // Increased intensity slightly and adjusted frequencies for a deeper, more mystical float.
      groupRef.current.rotation.x = 
        Math.sin(t * 0.11) * 0.12 + 
        Math.cos(t * 0.23) * 0.04 +
        Math.sin(t * 0.06) * 0.02;

      groupRef.current.rotation.y = 
        Math.cos(t * 0.13) * 0.12 + 
        Math.sin(t * 0.29) * 0.04 + 
        Math.cos(t * 0.08) * 0.02;
    }
  });

  const radius = 3.5;

  return (
    <group ref={groupRef}>
      {/* Thin Gold Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 16, 100]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.2} roughness={0.1} metalness={1} />
      </mesh>
      
      {/* Inner Ring - slightly thinner for elegance */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.85, 0.004, 16, 100]} />
        <meshStandardMaterial color="#B89A4A" transparent opacity={0.3} />
      </mesh>

      {/* Zodiac Symbols */}
      {ZODIAC_SIGNS.map((sign, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <group key={index} position={[x, y, 0]} rotation={[0, 0, angle - Math.PI / 2]}>
            <Text
              font="https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8_.woff"
              fontSize={0.35}
              color="#D4AF37"
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.8}
            >
              {sign}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

const OrbitingStars = () => {
  const count = 60;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  const orbits = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      radius: 4 + Math.random() * 4, // Orbiting outside the main ring (r=3.5)
      speed: (0.1 + Math.random() * 0.2) * 0.005 * (Math.random() > 0.5 ? 1 : -1), // Slow independent speed
      angle: Math.random() * Math.PI * 2,
      axis: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize(), // Random orbital plane
      size: 0.5 + Math.random() * 0.8
    }));
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    
    orbits.forEach((star, i) => {
      star.angle += star.speed;
      
      // Calculate position: Start at (radius, 0, 0), then rotate around the specific random axis
      pos.set(star.radius, 0, 0);
      pos.applyAxisAngle(star.axis, star.angle);
      
      dummy.position.copy(pos);
      const s = star.size;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color="#B89A4A" transparent opacity={0.8} />
    </instancedMesh>
  );
};

const Particles = () => {
  const count = 100;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      // Slowed down particle animation
      t = particle.t += speed / 3;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.02, 0]} />
      <meshBasicMaterial color="#B89A4A" transparent opacity={0.6} />
    </instancedMesh>
  );
};


const ThreeZodiac: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-[60vh] z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <fog attach="fog" args={['#06070A', 5, 15]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#D4AF37" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#2E3D2F" />
        
        {/* Refined Float parameters for subtle, breathing movement */}
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2} floatingRange={[-0.2, 0.2]}>
          <Ring />
        </Float>
        
        <OrbitingStars />
        <Particles />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      </Canvas>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#06070A] to-transparent" />
    </div>
  );
};

export default ThreeZodiac;