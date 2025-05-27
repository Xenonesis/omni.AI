import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  useAdaptiveQuality,
  useReducedMotion,
} from "../../hooks/usePerformanceOptimization";

interface Skill3DLogoProps {
  skillName: string;
  logoColor: string;
  logoShape: "cube" | "sphere" | "cylinder" | "torus" | "octahedron";
  className?: string;
  size?: number;
  onInteraction?: () => void;
}

// Real technology logo URLs with fallback options
const getTechnologyLogoUrl = (skillName: string): string => {
  const logoMap: Record<string, string> = {
    React:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "Next.js":
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    "Tailwind CSS":
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
    TypeScript:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    JavaScript:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    Python:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    "Node.js":
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    MongoDB:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    Git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    AWS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
    Cybersecurity:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
    "Ethical Hacking":
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
  };

  return (
    logoMap[skillName] ||
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/code/code-original.svg"
  );
};

export default function Skill3DLogo({
  skillName,
  logoColor,
  logoShape,
  className = "",
  size = 60,
  onInteraction,
}: Skill3DLogoProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const textureRef = useRef<THREE.Texture | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const quality = useAdaptiveQuality();
  const shouldReduceMotion = useReducedMotion();

  const createGeometry = useCallback(
    (shape: string) => {
      const geometrySize = quality === "low" ? 0.8 : 1;

      switch (shape) {
        case "cube":
          return new THREE.BoxGeometry(
            geometrySize,
            geometrySize,
            geometrySize
          );
        case "sphere":
          return new THREE.SphereGeometry(
            geometrySize * 0.6,
            quality === "low" ? 16 : 32,
            quality === "low" ? 16 : 32
          );
        case "cylinder":
          return new THREE.CylinderGeometry(
            geometrySize * 0.5,
            geometrySize * 0.5,
            geometrySize,
            quality === "low" ? 8 : 16
          );
        case "torus":
          return new THREE.TorusGeometry(
            geometrySize * 0.5,
            geometrySize * 0.2,
            quality === "low" ? 8 : 16,
            quality === "low" ? 16 : 32
          );
        case "octahedron":
          return new THREE.OctahedronGeometry(geometrySize * 0.7);
        default:
          return new THREE.BoxGeometry(
            geometrySize,
            geometrySize,
            geometrySize
          );
      }
    },
    [quality]
  );

  const createMaterial = useCallback(
    (color: string) => {
      const materialProps = {
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.9,
      };

      if (quality === "low") {
        return new THREE.MeshBasicMaterial(materialProps);
      } else {
        return new THREE.MeshPhongMaterial({
          ...materialProps,
          shininess: 100,
          specular: new THREE.Color(0x222222),
          emissive: new THREE.Color(color).multiplyScalar(0.1),
        });
      }
    },
    [quality]
  );

  const createFallbackGeometry = useCallback(
    (scene: THREE.Scene) => {
      const geometry = createGeometry(logoShape);
      const material = createMaterial(logoColor);

      // Remove old mesh if exists
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((mat) => mat.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }

      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      scene.add(mesh);
      setLogoLoaded(true);
    },
    [logoShape, logoColor, createGeometry, createMaterial]
  );

  // Load real logo texture
  const loadLogoTexture = useCallback(
    (scene: THREE.Scene) => {
      const logoUrl = getTechnologyLogoUrl(skillName);
      const loader = new THREE.TextureLoader();

      // Set a timeout for loading
      const timeoutId = setTimeout(() => {
        console.warn(
          `⏰ Logo loading timeout for ${skillName}, using fallback`
        );
        createFallbackGeometry(scene);
      }, 5000);

      loader.load(
        logoUrl,
        (texture) => {
          clearTimeout(timeoutId);

          // Configure texture for optimal display
          texture.generateMipmaps = false;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;

          textureRef.current = texture;
          setLogoLoaded(true);

          // Create logo plane geometry
          const planeGeometry = new THREE.PlaneGeometry(1.5, 1.5);
          const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide,
          });

          // Remove old mesh if exists
          if (meshRef.current) {
            scene.remove(meshRef.current);
            meshRef.current.geometry.dispose();
            if (Array.isArray(meshRef.current.material)) {
              meshRef.current.material.forEach((mat) => mat.dispose());
            } else {
              meshRef.current.material.dispose();
            }
          }

          const logoMesh = new THREE.Mesh(planeGeometry, planeMaterial);
          meshRef.current = logoMesh;
          scene.add(logoMesh);

          console.log(`✅ Logo loaded for ${skillName}`);
        },
        (progress) => {
          if (progress.total > 0) {
            console.log(
              `📥 Loading ${skillName} logo: ${Math.round(
                (progress.loaded / progress.total) * 100
              )}%`
            );
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn(`❌ Failed to load logo for ${skillName}:`, error);
          // Fallback to geometric shape
          createFallbackGeometry(scene);
        }
      );
    },
    [skillName, createFallbackGeometry]
  );

  const createParticles = useCallback(
    (scene: THREE.Scene) => {
      if (quality === "low" || shouldReduceMotion) return null;

      const particleCount = 20;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const material = new THREE.PointsMaterial({
        color: logoColor,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      return particles;
    },
    [quality, shouldReduceMotion, logoColor]
  );

  useEffect(() => {
    if (!mountRef.current) return;

    // Check WebGL support
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      setWebglSupported(false);
      setIsLoaded(true);
      return;
    }

    try {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 3;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: quality !== "low",
        alpha: true,
        powerPreference: quality === "high" ? "high-performance" : "default",
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, quality === "low" ? 1 : 2)
      );
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      if (quality !== "low") {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(logoColor, 1, 100);
        pointLight.position.set(2, 2, 2);
        scene.add(pointLight);
      }

      // Load real logo texture
      loadLogoTexture(scene);

      // Create particles
      const particles = createParticles(scene);

      // Animation loop
      const animate = () => {
        if (!shouldReduceMotion) {
          const time = Date.now() * 0.001;

          // Auto rotation
          if (meshRef.current) {
            meshRef.current.rotation.x = time * 0.5;
            meshRef.current.rotation.y = time * 0.7;
          }

          // Mouse interaction
          if (isHovered && meshRef.current) {
            const targetRotationX = mouseRef.current.y * 0.01;
            const targetRotationY = mouseRef.current.x * 0.01;
            meshRef.current.rotation.x +=
              (targetRotationX - meshRef.current.rotation.x) * 0.1;
            meshRef.current.rotation.y +=
              (targetRotationY - meshRef.current.rotation.y) * 0.1;
          }

          // Particle animation
          if (particles) {
            particles.rotation.y = time * 0.2;
          }
        }

        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
      setIsLoaded(true);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Cleanup Three.js resources
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });

        renderer.dispose();
        if (
          mountRef.current &&
          renderer.domElement &&
          mountRef.current.contains(renderer.domElement)
        ) {
          try {
            mountRef.current.removeChild(renderer.domElement);
          } catch (error) {
            console.warn("Failed to remove renderer DOM element:", error);
          }
        }
      };
    } catch (error) {
      console.warn("Failed to initialize 3D logo:", error);
      setWebglSupported(false);
      setIsLoaded(true);
    }
  }, [
    skillName,
    logoColor,
    logoShape,
    size,
    quality,
    shouldReduceMotion,
    loadLogoTexture,
    createParticles,
  ]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const handleClick = useCallback(() => {
    if (meshRef.current && !shouldReduceMotion) {
      // Scale animation on click
      const originalScale = meshRef.current.scale.clone();
      meshRef.current.scale.setScalar(1.2);

      setTimeout(() => {
        if (meshRef.current) {
          meshRef.current.scale.copy(originalScale);
        }
      }, 150);
    }

    if (onInteraction) {
      onInteraction();
    }
  }, [shouldReduceMotion, onInteraction]);

  if (!webglSupported) {
    // Fallback 2D logo with real logo image
    return (
      <motion.div
        className={`relative rounded-lg overflow-hidden ${className}`}
        style={{
          width: size,
          height: size,
        }}
        whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
        whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
      >
        <img
          src={getTechnologyLogoUrl(skillName)}
          alt={`${skillName} logo`}
          className="w-full h-full object-contain p-2"
          style={{ backgroundColor: logoColor + "20" }}
          onError={(e) => {
            // Fallback to text if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-white font-bold text-xs" style="background-color: ${logoColor}">
                  ${skillName.slice(0, 2).toUpperCase()}
                </div>
              `;
            }
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={mountRef}
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.5 }}
      whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
      whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Accessibility label */}
      <span className="sr-only">{skillName} 3D Logo</span>

      {/* Glow effect */}
      {isHovered && quality !== "low" && (
        <div
          className="absolute inset-0 rounded-lg blur-md opacity-50 pointer-events-none"
          style={{
            backgroundColor: logoColor,
            transform: "scale(1.2)",
          }}
        />
      )}
    </motion.div>
  );
}
