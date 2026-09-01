'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroCanvasEffect() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    // 2. High-End 2D Aurora & Particle Cyber Shader (No 3D vertex displacement tearing)
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;

      // Simplex Noise Function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ) );
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        st.x *= uResolution.x / uResolution.y;

        // Dark Premium Cyber Base Palette
        vec3 bgDark = vec3(0.035, 0.035, 0.045); // #09090b
        vec3 cyanBlue = vec3(0.14, 0.45, 0.95);  // #2563eb
        vec3 deepPurple = vec3(0.48, 0.28, 0.92); // #7c3aed
        vec3 emeraldGlow = vec3(0.06, 0.72, 0.50); // #10b981

        // Smooth fluid aurora motion
        float n1 = snoise(vUv * 2.0 + vec2(uTime * 0.1, uTime * 0.05));
        float n2 = snoise(vUv * 3.5 - vec2(uTime * 0.12, -uTime * 0.08));

        // Blend aurora light waves
        float wave = smoothstep(-0.3, 0.7, n1 * 0.5 + n2 * 0.5);
        vec3 color = mix(bgDark, deepPurple, wave * 0.25);
        color = mix(color, cyanBlue, smoothstep(0.2, 0.9, vUv.y + n1 * 0.2) * 0.2);

        // Dynamic Mouse Radial Spotlight
        float mouseDist = distance(vUv, uMouse);
        float mouseGlow = smoothstep(0.45, 0.0, mouseDist) * 0.35;
        color += cyanBlue * mouseGlow;

        // Micro cyber grid lines
        vec2 gridUv = fract(vUv * 50.0);
        float grid = (step(0.97, gridUv.x) + step(0.97, gridUv.y)) * 0.03;
        color += vec3(grid);

        // Smooth Vignette
        float vignette = 1.0 - smoothstep(0.4, 1.2, length(vUv - vec2(0.5)));
        color *= vignette;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(width, height) }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false
    });

    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    // Mouse Tracking
    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const currentMouse = new THREE.Vector2(0.5, 0.5);

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse coordinates smoothly
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      uniforms.uTime.value = elapsedTime;
      uniforms.uMouse.value.copy(currentMouse);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none" />;
}

export default HeroCanvasEffect;
