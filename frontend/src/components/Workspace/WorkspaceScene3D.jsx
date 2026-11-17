import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WorkspaceScene3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080e, 0.025);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x06281e, 2.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff87, 3.5, 90);
    pointLight1.position.set(20, 25, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00e5ff, 2.5, 80);
    pointLight2.position.set(-25, -15, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x10b981, 2.0, 70);
    pointLight3.position.set(0, 30, -20);
    scene.add(pointLight3);

    // 3. 3D Algorithmic Flow Mesh / Terrain
    // A wireframe wave plane in the background representing market data waves
    const planeWidth = 140;
    const planeHeight = 100;
    const widthSegments = 50;
    const heightSegments = 40;
    const planeGeo = new THREE.PlaneGeometry(
      planeWidth,
      planeHeight,
      widthSegments,
      heightSegments
    );
    planeGeo.rotateX(-Math.PI / 2.3);
    planeGeo.translate(0, -18, -10);

    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff87,
      emissive: 0x044a2b,
      emissiveIntensity: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const waveMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(waveMesh);

    // Keep vertex positions for real-time wave animation
    const positionAttr = planeGeo.attributes.position;
    const initialZ = new Float32Array(positionAttr.count);
    for (let i = 0; i < positionAttr.count; i++) {
      initialZ[i] = positionAttr.getY(i);
    }

    // 4. Floating 3D Geometric Crystals (Market Alpha Nodes)
    const crystalsGroup = new THREE.Group();
    scene.add(crystalsGroup);

    const crystalMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: 0x00ff87,
        emissive: 0x008f4c,
        emissiveIntensity: 0.35,
        roughness: 0.15,
        metalness: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x00e5ff,
        emissive: 0x005577,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.7,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x064e3b,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      }),
    ];

    const crystalGeos = [
      new THREE.IcosahedronGeometry(4.2, 0),
      new THREE.OctahedronGeometry(3.6, 0),
      new THREE.DodecahedronGeometry(3.2, 0),
      new THREE.TetrahedronGeometry(3.0, 0),
      new THREE.IcosahedronGeometry(2.8, 1),
    ];

    const crystalNodes = [];
    const nodeConfigs = [
      { x: -38, y: 14, z: -15, rotSpeed: 0.006, geo: 0, mat: 0 },
      { x: 38, y: 18, z: -20, rotSpeed: -0.007, geo: 1, mat: 1 },
      { x: -25, y: -8, z: -8, rotSpeed: 0.005, geo: 2, mat: 2 },
      { x: 32, y: -10, z: -12, rotSpeed: -0.008, geo: 3, mat: 0 },
      { x: 0, y: 22, z: -25, rotSpeed: 0.004, geo: 4, mat: 1 },
    ];

    nodeConfigs.forEach((cfg) => {
      const mesh = new THREE.Mesh(crystalGeos[cfg.geo], crystalMaterials[cfg.mat]);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      crystalsGroup.add(mesh);
      crystalNodes.push({ mesh, cfg, initialY: cfg.y });
    });

    // 5. Ambient Glowing Market Data Particle Cloud
    const particleCount = 650;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const greenColor = new THREE.Color(0x00ff87);
    const cyanColor = new THREE.Color(0x00e5ff);
    const emeraldColor = new THREE.Color(0x10b981);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 110;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 70;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 60;

      const rand = Math.random();
      const col = rand > 0.6 ? greenColor : rand > 0.3 ? cyanColor : emeraldColor;
      particleColors[i3] = col.r;
      particleColors[i3 + 1] = col.g;
      particleColors[i3 + 2] = col.b;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    // Circular particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(0, 255, 135, 0.8)");
    gradient.addColorStop(0.8, "rgba(0, 184, 107, 0.2)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 1.4,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Mouse & Scroll Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentScroll = 0;
    let targetScroll = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      targetScroll = window.scrollY || document.documentElement.scrollTop;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 7. Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation with scroll-reactive parallax
      if (!prefersReducedMotion) {
        targetX += (mouseX * 4 - targetX) * 0.03;
        targetY += (mouseY * 3 - targetY) * 0.03;
        currentScroll += (targetScroll - currentScroll) * 0.06;

        camera.position.x = targetX;
        camera.position.y = 15 + targetY - currentScroll * 0.015;
        camera.position.z = 45 + currentScroll * 0.01;
        camera.lookAt(0, -currentScroll * 0.008, 0);

        // Parallax shift crystals and particles with scroll
        crystalsGroup.position.y = -currentScroll * 0.012;
        particles.position.y = -currentScroll * 0.018;

        // Animate 3D market terrain wave
        const pos = planeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = (i % (widthSegments + 1)) / widthSegments;
          const v = Math.floor(i / (widthSegments + 1)) / heightSegments;
          const wave1 = Math.sin(u * 8 + elapsedTime * 1.2) * 2.5;
          const wave2 = Math.cos(v * 6 + elapsedTime * 0.8) * 2.0;
          const wave3 = Math.sin((u + v) * 5 + elapsedTime * 1.5) * 1.5;
          pos.setZ(i, initialZ[i] + wave1 + wave2 + wave3);
        }
        pos.needsUpdate = true;

        // Animate floating crystals
        crystalNodes.forEach(({ mesh, cfg, initialY }, idx) => {
          mesh.rotation.x += cfg.rotSpeed;
          mesh.rotation.y += cfg.rotSpeed * 1.3;
          mesh.rotation.z += cfg.rotSpeed * 0.7;
          mesh.position.y =
            initialY + Math.sin(elapsedTime * 1.2 + idx * 1.5) * 1.8;
        });

        // Slow rotate particles
        particles.rotation.y = elapsedTime * 0.02;
        particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      crystalGeos.forEach((g) => g.dispose());
      crystalMaterials.forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="workspace-3d-canvas-container"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    />
  );
}
