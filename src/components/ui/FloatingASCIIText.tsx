import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform float uTime;
uniform float uMouseX;
uniform float uMouseY;
uniform float uEnableWaves;
uniform float uIntensity;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    float time = uTime * 3.0;
    float waveFactor = uEnableWaves;
    float intensity = uIntensity;

    vec3 transformed = position;

    // Enhanced wave effects with multiple frequencies
    float wave1 = sin(time + position.x * 2.0) * 0.3;
    float wave2 = cos(time * 1.5 + position.y * 3.0) * 0.2;
    float wave3 = sin(time * 0.8 + position.z * 1.5) * 0.4;

    // Mouse influence
    float mouseInfluence = length(vec2(uMouseX, uMouseY)) * 0.001;

    // Apply transformations
    transformed.x += (wave1 + wave3 * 0.5) * waveFactor * intensity;
    transformed.y += (wave2 + sin(time * 2.0 + position.x) * 0.15) * waveFactor * intensity;
    transformed.z += (wave3 + cos(time * 1.2 + position.y) * 0.2) * waveFactor * intensity;

    // Add mouse-based distortion
    transformed.x += sin(uMouseX * 0.01 + time) * mouseInfluence * waveFactor;
    transformed.y += cos(uMouseY * 0.01 + time) * mouseInfluence * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform float uTime;
uniform float uMouseX;
uniform float uMouseY;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform float uGlow;

void main() {
    float time = uTime * 2.0;
    vec2 pos = vUv;

    // Enhanced chromatic aberration
    float aberration = 0.005 + sin(time) * 0.003;
    float mouseEffect = length(vec2(uMouseX, uMouseY)) * 0.00001;

    // Dynamic distortion based on position and time
    vec2 distortion = vec2(
        sin(time + pos.x * 10.0) * 0.01,
        cos(time + pos.y * 8.0) * 0.008
    ) * uIntensity;

    // Color separation with enhanced effects
    float r = texture2D(uTexture, pos + distortion + vec2(aberration + mouseEffect, 0.0)).r;
    float g = texture2D(uTexture, pos + distortion * 0.5).g;
    float b = texture2D(uTexture, pos + distortion - vec2(aberration + mouseEffect, 0.0)).b;
    float a = texture2D(uTexture, pos).a;

    // Add glow effect
    vec3 color = vec3(r, g, b);
    float glow = uGlow * (1.0 + sin(time * 3.0) * 0.3);
    color += glow * 0.1 * vec3(0.4, 0.6, 1.0);

    // Enhance contrast and saturation
    color = mix(color, color * color * (3.0 - 2.0 * color), 0.3);

    gl_FragColor = vec4(color, a);
}
`;

function map(
  n: number,
  start: number,
  stop: number,
  start2: number,
  stop2: number
) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

const PX_RATIO = typeof window !== "undefined" ? window.devicePixelRatio : 1;

interface AsciiFilterOptions {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
}

class AsciiFilter {
  renderer!: THREE.WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  deg: number;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width: number = 0;
  height: number = 0;
  center: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { x: number; y: number } = { x: 0, y: 0 };
  cols: number = 0;
  rows: number = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    { fontSize, fontFamily, charset, invert }: AsciiFilterOptions = {}
  ) {
    this.renderer = renderer;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.style.top = "0";
    this.domElement.style.left = "0";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";

    this.pre = document.createElement("pre");
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset =
      charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    if (this.context) {
      this.context.imageSmoothingEnabled = false;
      this.context.imageSmoothingEnabled = false;
    }

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener("mousemove", this.onMouseMove);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    if (this.context) {
      this.context.font = `${this.fontSize}px ${this.fontFamily}`;
      const charWidth = this.context.measureText("A").width;

      this.cols = Math.floor(
        this.width / (this.fontSize * (charWidth / this.fontSize))
      );
      this.rows = Math.floor(this.height / this.fontSize);

      this.canvas.width = this.cols;
      this.canvas.height = this.rows;
      this.pre.style.fontFamily = this.fontFamily;
      this.pre.style.fontSize = `${this.fontSize}px`;
      this.pre.style.margin = "0";
      this.pre.style.padding = "0";
      this.pre.style.lineHeight = "1em";
      this.pre.style.position = "absolute";
      this.pre.style.left = "50%";
      this.pre.style.top = "50%";
      this.pre.style.transform = "translate(-50%, -50%)";
      this.pre.style.zIndex = "9";
      this.pre.style.backgroundAttachment = "fixed";
      this.pre.style.mixBlendMode = "difference";
    }
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.context) {
      this.context.clearRect(0, 0, w, h);
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
      this.asciify(this.context, w, h);
      this.hue();
    }
  }

  onMouseMove(e: MouseEvent) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;

    // Enhanced visual effects
    const brightness = 1 + Math.sin(Date.now() * 0.003) * 0.1;
    const contrast = 1.2 + Math.cos(Date.now() * 0.002) * 0.2;
    const saturation = 1.3 + Math.sin(Date.now() * 0.004) * 0.3;

    this.domElement.style.filter = `
      hue-rotate(${this.deg.toFixed(1)}deg)
      brightness(${brightness.toFixed(2)})
      contrast(${contrast.toFixed(2)})
      saturate(${saturation.toFixed(2)})
      drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))
    `;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let str = "";
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x * 4 + y * 4 * w;
        const [r, g, b, a] = [
          imgData[i],
          imgData[i + 1],
          imgData[i + 2],
          imgData[i + 3],
        ];

        if (a === 0) {
          str += " ";
          continue;
        }

        let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) idx = this.charset.length - idx - 1;
        str += this.charset[idx];
      }
      str += "\n";
    }
    this.pre.innerHTML = str;
  }

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMove);
  }
}

interface CanvasTxtOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

class CanvasTxt {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  txt: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  font: string;

  constructor(
    txt: string,
    {
      fontSize = 200,
      fontFamily = "Arial",
      color = "#6366f1",
    }: CanvasTxtOptions = {}
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    if (this.context) {
      this.context.font = this.font;
      const metrics = this.context.measureText(this.txt);

      const textWidth = Math.ceil(metrics.width) + 20;
      const textHeight =
        Math.ceil(
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        ) + 20;

      this.canvas.width = textWidth;
      this.canvas.height = textHeight;
    }
  }

  render() {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = this.color;
      this.context.font = this.font;

      const metrics = this.context.measureText(this.txt);
      const yPos = 10 + metrics.actualBoundingBoxAscent;

      this.context.fillText(this.txt, 10, yPos);
    }
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

interface CanvAsciiOptions {
  text: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  enableWaves: boolean;
}

class CanvAscii {
  textString: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  container: HTMLElement;
  width: number;
  height: number;
  enableWaves: boolean;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  mouse: { x: number; y: number };
  textCanvas!: CanvasTxt;
  texture!: THREE.CanvasTexture;
  geometry: THREE.PlaneGeometry | undefined;
  material: THREE.ShaderMaterial | undefined;
  mesh!: THREE.Mesh;
  renderer!: THREE.WebGLRenderer;
  filter!: AsciiFilter;
  center: { x: number; y: number } = { x: 0, y: 0 };
  animationFrameId: number = 0;
  particles: THREE.Points | undefined;
  particleGeometry: THREE.BufferGeometry | undefined;
  particleMaterial: THREE.PointsMaterial | undefined;
  lights: THREE.Light[] = [];
  mouseVelocity: { x: number; y: number } = { x: 0, y: 0 };
  lastMousePos: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    {
      text,
      asciiFontSize,
      textFontSize,
      textColor,
      planeBaseHeight,
      enableWaves,
    }: CanvAsciiOptions,
    containerElem: HTMLElement,
    width: number,
    height: number
  ) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      1000
    );
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();
    this.mouse = { x: 0, y: 0 };

    this.onMouseMove = this.onMouseMove.bind(this);

    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: "IBM Plex Mono",
      color: this.textColor,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 64, 64);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uMouseX: { value: 0 },
        uMouseY: { value: 0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
        uIntensity: { value: 1.0 },
        uGlow: { value: 1.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // Add particle system
    this.createParticles();

    // Add dynamic lighting
    this.createLights();
  }

  createParticles() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.particleGeometry.setAttribute(
      "velocity",
      new THREE.BufferAttribute(velocities, 3)
    );

    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial
    );
    this.scene.add(this.particles);
  }

  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Point lights
    const pointLight1 = new THREE.PointLight(0x6366f1, 1, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    this.lights.push(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.8, 100);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);
    this.lights.push(pointLight2);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: "IBM Plex Mono",
      fontSize: this.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    this.container.addEventListener("mousemove", this.onMouseMove);
    this.container.addEventListener("touchmove", this.onMouseMove);
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.filter.setSize(w, h);

    this.center = { x: w / 2, y: h / 2 };
  }

  load() {
    this.animate();
  }

  onMouseMove(evt: MouseEvent | TouchEvent) {
    const e = (evt as TouchEvent).touches
      ? (evt as TouchEvent).touches[0]
      : (evt as MouseEvent);
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  render() {
    const time = new Date().getTime() * 0.001;

    this.textCanvas.render();
    this.texture.needsUpdate = true;

    // Update shader uniforms
    const material = this.mesh.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = time;
    material.uniforms.uMouseX.value = this.mouse.x;
    material.uniforms.uMouseY.value = this.mouse.y;
    material.uniforms.uIntensity.value = 1.0 + Math.sin(time * 2) * 0.3;
    material.uniforms.uGlow.value = 1.0 + Math.cos(time * 1.5) * 0.5;

    // Update mouse velocity
    this.mouseVelocity.x = this.mouse.x - this.lastMousePos.x;
    this.mouseVelocity.y = this.mouse.y - this.lastMousePos.y;
    this.lastMousePos = { ...this.mouse };

    // Animate particles
    this.updateParticles(time);

    // Animate lights
    this.updateLights(time);

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateParticles(time: number) {
    if (!this.particles || !this.particleGeometry) return;

    const positions = this.particleGeometry.attributes.position
      .array as Float32Array;
    const velocities = this.particleGeometry.attributes.velocity
      .array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      // Apply velocity
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Add wave motion
      positions[i] += Math.sin(time + i * 0.1) * 0.01;
      positions[i + 1] += Math.cos(time + i * 0.1) * 0.01;

      // Mouse attraction
      const mouseForce = 0.0001;
      const dx = this.mouse.x * 0.1 - positions[i];
      const dy = this.mouse.y * 0.1 - positions[i + 1];
      positions[i] += dx * mouseForce;
      positions[i + 1] += dy * mouseForce;

      // Boundary wrapping
      if (positions[i] > 25) positions[i] = -25;
      if (positions[i] < -25) positions[i] = 25;
      if (positions[i + 1] > 15) positions[i + 1] = -15;
      if (positions[i + 1] < -15) positions[i + 1] = 15;
    }

    this.particleGeometry.attributes.position.needsUpdate = true;

    // Animate particle material
    if (this.particleMaterial) {
      this.particleMaterial.opacity = 0.3 + Math.sin(time * 3) * 0.3;
      this.particleMaterial.size = 0.1 + Math.cos(time * 2) * 0.05;
    }
  }

  updateLights(time: number) {
    if (this.lights.length >= 2) {
      // Animate point lights
      const light1 = this.lights[1] as THREE.PointLight;
      const light2 = this.lights[2] as THREE.PointLight;

      light1.position.x = Math.sin(time) * 15;
      light1.position.y = Math.cos(time * 1.2) * 10;
      light1.intensity = 0.8 + Math.sin(time * 2) * 0.4;

      light2.position.x = Math.cos(time * 0.8) * 12;
      light2.position.z = Math.sin(time * 1.5) * 8;
      light2.intensity = 0.6 + Math.cos(time * 1.8) * 0.3;
    }
  }

  updateRotation() {
    const time = new Date().getTime() * 0.001;
    const x = map(this.mouse.y, 0, this.height, 0.3, -0.3);
    const y = map(this.mouse.x, 0, this.width, -0.3, 0.3);

    // Enhanced rotation with easing and auto-rotation
    const targetRotationX = x + Math.sin(time * 0.5) * 0.1;
    const targetRotationY = y + Math.cos(time * 0.3) * 0.1;

    this.mesh.rotation.x += (targetRotationX - this.mesh.rotation.x) * 0.08;
    this.mesh.rotation.y += (targetRotationY - this.mesh.rotation.y) * 0.08;
    this.mesh.rotation.z = Math.sin(time * 0.4) * 0.05;

    // Add subtle camera movement
    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.position.y = Math.cos(time * 0.15) * 1;
    this.camera.lookAt(this.mesh.position);

    // Scale effect based on mouse velocity
    const velocityMagnitude = Math.sqrt(
      this.mouseVelocity.x ** 2 + this.mouseVelocity.y ** 2
    );
    const targetScale = 1 + velocityMagnitude * 0.001;
    this.mesh.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  }

  clear() {
    this.scene.traverse((object) => {
      const obj = object as unknown as THREE.Mesh;
      if (!obj.isMesh) return;
      [obj.material].flat().forEach((material) => {
        material.dispose();
        Object.keys(material).forEach((key) => {
          const matProp = material[key as keyof typeof material];
          if (
            matProp &&
            typeof matProp === "object" &&
            "dispose" in matProp &&
            typeof matProp.dispose === "function"
          ) {
            matProp.dispose();
          }
        });
      });
      obj.geometry.dispose();
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.filter.dispose();
    this.container.removeChild(this.filter.domElement);
    this.container.removeEventListener("mousemove", this.onMouseMove);
    this.container.removeEventListener("touchmove", this.onMouseMove);
    this.clear();
    this.renderer.dispose();
  }
}

interface FloatingASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
  enableParticles?: boolean;
  enableSound?: boolean;
  intensity?: number;
  className?: string;
  onComplete?: () => void;
  onInteraction?: () => void;
}

export default function FloatingASCIIText({
  text = "Hey: I'm Aditya",
  asciiFontSize = 6,
  textFontSize = 120,
  textColor = "#6366f1",
  planeBaseHeight = 8,
  enableWaves = true,
  enableParticles = true,
  enableSound = false,
  intensity = 1.0,
  className = "",
  onComplete,
  onInteraction,
}: FloatingASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<CanvAscii | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for WebGL support
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      // Fallback for devices without WebGL support
      setWebglSupported(false);
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
      return;
    }

    const { width, height } = containerRef.current.getBoundingClientRect();

    try {
      asciiRef.current = new CanvAscii(
        {
          text,
          asciiFontSize,
          textFontSize,
          textColor,
          planeBaseHeight,
          enableWaves,
        },
        containerRef.current,
        width,
        height
      );
      asciiRef.current.load();

      // Call onComplete after a short delay to simulate animation completion
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }

      const ro = new ResizeObserver((entries) => {
        if (!entries[0]) return;
        const { width: w, height: h } = entries[0].contentRect;
        asciiRef.current?.setSize(w, h);
      });
      ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
        asciiRef.current?.dispose();
      };
    } catch (error) {
      console.warn(
        "FloatingASCIIText: Failed to initialize 3D animation, using fallback"
      );
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    }
  }, [
    text,
    asciiFontSize,
    textFontSize,
    textColor,
    planeBaseHeight,
    enableWaves,
    onComplete,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{
        minHeight: "400px",
      }}
    >
      {!webglSupported && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {text}
            </h2>
            <p className="text-neutral-600 text-sm">
              3D animation not supported on this device
            </p>
          </div>
        </div>
      )}
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap');

                .floating-ascii canvas {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    image-rendering: optimizeSpeed;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: -o-crisp-edges;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: optimize-contrast;
                    image-rendering: crisp-edges;
                    image-rendering: pixelated;
                }

                .floating-ascii pre {
                    margin: 0;
                    user-select: none;
                    padding: 0;
                    line-height: 1em;
                    text-align: left;
                    position: absolute;
                    left: 0;
                    top: 0;
                    background-image: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
                    background-attachment: fixed;
                    -webkit-text-fill-color: transparent;
                    -webkit-background-clip: text;
                    background-clip: text;
                    z-index: 9;
                    mix-blend-mode: difference;
                }

                @media (prefers-reduced-motion: reduce) {
                    .floating-ascii * {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
    </div>
  );
}
