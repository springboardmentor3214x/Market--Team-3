import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FinancialScene3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080e, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x08261e, 2.0);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff87, 4.5, 30);
    pointLight1.position.set(3, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x059669, 3.0, 25);
    pointLight2.position.set(-4, -2, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00e5ff, 2.0, 30);
    pointLight3.position.set(0, 5, -2);
    scene.add(pointLight3);

    // 3. Materials
    const greenBullishMat = new THREE.MeshStandardMaterial({
      color: 0x00ff87,
      emissive: 0x008f4c,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.92,
    });

    const redPullbackMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    const glassCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x00ff87,
      emissiveIntensity: 0.2,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 1.2,
      transparent: true,
      opacity: 0.65,
      reflectivity: 0.9,
    });

    const wireframeLineMat = new THREE.LineBasicMaterial({
      color: 0x00ff87,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.85,
    });

    // 4. 3D Candlestick Graph Group
    const chartGroup = new THREE.Group();
    chartGroup.position.set(-0.5, -0.6, 0);
    scene.add(chartGroup);

    // Generate upward trending candlestick series with realistic fluctuation
    const candleCount = 13;
    const candleSpacing = 0.52;
    const startX = -((candleCount - 1) * candleSpacing) / 2;
    const candleMeshes = [];
    const trendPoints = [];

    // Base price wave pattern simulating bullish stock breakout
    const baseWave = [
      1.1, 1.25, 1.15, 1.45, 1.35, 1.7, 1.9, 1.8, 2.15, 2.4, 2.25, 2.65, 2.9,
    ];

    for (let i = 0; i < candleCount; i++) {
      const isBullish = i === 0 || baseWave[i] >= baseWave[i - 1];
      const candleHeight = Math.max(
        0.35,
        Math.abs(baseWave[i] - (i > 0 ? baseWave[i - 1] : 0.9)) + 0.3
      );
      const wickHeight = candleHeight + 0.45 + Math.random() * 0.3;
      const x = startX + i * candleSpacing;
      const y = (baseWave[i] - 1.8) * 0.9;

      const singleCandleGroup = new THREE.Group();
      singleCandleGroup.position.set(x, y, 0);

      // Wick
      const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, wickHeight, 8);
      const wickMesh = new THREE.Mesh(
        wickGeo,
        isBullish ? greenBullishMat : redPullbackMat
      );
      singleCandleGroup.add(wickMesh);

      // Body
      const bodyGeo = new THREE.BoxGeometry(0.28, candleHeight, 0.28);
      const bodyMesh = new THREE.Mesh(
        bodyGeo,
        isBullish ? greenBullishMat : redPullbackMat
      );
      singleCandleGroup.add(bodyMesh);

      chartGroup.add(singleCandleGroup);

      candleMeshes.push({
        group: singleCandleGroup,
        baseY: y,
        phase: i * 0.45,
        speed: 1.2 + (i % 3) * 0.2,
      });

      trendPoints.push(
        new THREE.Vector3(x, y + candleHeight / 2 + 0.15, 0.05)
      );
    }

    // 5. 3D Glowing Market Trendline (CatmullRom Spline)
    const curve = new THREE.CatmullRomCurve3(trendPoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.032, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff87,
      emissive: 0x00ff87,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.9,
    });
    const trendlineMesh = new THREE.Mesh(tubeGeo, tubeMat);
    chartGroup.add(trendlineMesh);

    // Glowing nodal spheres at key peak points
    const sphereNodeGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const peakIndices = [3, 6, 9, 12];
    peakIndices.forEach((idx) => {
      if (trendPoints[idx]) {
        const peakSphere = new THREE.Mesh(sphereNodeGeo, tubeMat);
        peakSphere.position.copy(trendPoints[idx]);
        chartGroup.add(peakSphere);
      }
    });

    // 6. Floating 3D Geometric Objects (Holographic Crystal Prisms & Orbs)
    // Main Futuristic Crystal Cube (Inspired by user's reference image)
    const mainCubeGroup = new THREE.Group();
    mainCubeGroup.position.set(2.4, 1.2, 0.5);

    const mainCubeGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const mainCubeMesh = new THREE.Mesh(mainCubeGeo, glassCrystalMat);
    mainCubeGroup.add(mainCubeMesh);

    // Wireframe glowing cage around the cube
    const cubeEdges = new THREE.EdgesGeometry(mainCubeGeo);
    const cubeWireframe = new THREE.LineSegments(cubeEdges, wireframeLineMat);
    mainCubeGroup.add(cubeWireframe);

    // Inner glowing core
    const innerCoreGeo = new THREE.OctahedronGeometry(0.5, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00ff87,
      emissive: 0x00ff87,
      emissiveIntensity: 1.2,
      wireframe: true,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    mainCubeGroup.add(innerCoreMesh);

    scene.add(mainCubeGroup);

    // Secondary Floating Icosahedron Crystal
    const icoGroup = new THREE.Group();
    icoGroup.position.set(-2.6, 1.6, -0.5);
    const icoGeo = new THREE.IcosahedronGeometry(0.85, 0);
    const icoMesh = new THREE.Mesh(icoGeo, glassCrystalMat);
    icoGroup.add(icoMesh);
    const icoEdges = new THREE.EdgesGeometry(icoGeo);
    const icoWire = new THREE.LineSegments(icoEdges, wireframeLineMat);
    icoGroup.add(icoWire);
    scene.add(icoGroup);

    // Tertiary Small Floating Diamond (Octahedron)
    const diamondGroup = new THREE.Group();
    diamondGroup.position.set(1.6, -1.8, 1.2);
    const diamondGeo = new THREE.OctahedronGeometry(0.45, 0);
    const diamondMesh = new THREE.Mesh(diamondGeo, glassCrystalMat);
    diamondGroup.add(diamondMesh);
    const diamondEdges = new THREE.EdgesGeometry(diamondGeo);
    const diamondWire = new THREE.LineSegments(diamondEdges, wireframeLineMat);
    diamondGroup.add(diamondWire);
    scene.add(diamondGroup);

    // 7. Floating Emerald Glowing Orbs (From reference image top-right)
    const orb1Geo = new THREE.SphereGeometry(0.55, 32, 32);
    const orb1Mat = new THREE.MeshPhysicalMaterial({
      color: 0x00ff87,
      emissive: 0x059669,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.75,
    });
    const orb1 = new THREE.Mesh(orb1Geo, orb1Mat);
    orb1.position.set(-2.8, -1.2, 0.8);
    scene.add(orb1);

    const orb2Geo = new THREE.SphereGeometry(0.35, 24, 24);
    const orb2 = new THREE.Mesh(orb2Geo, orb1Mat);
    orb2.position.set(3.1, -1.0, 1.1);
    scene.add(orb2);

    // 8. 3D Particle Starfield / Financial Data Dust
    const particleCount = 750;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      particleScales[i] = Math.random() * 0.04 + 0.01;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x00ff87,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Mouse Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.5;
      targetY = -y * 1.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 10. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 11. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const speedMultiplier = prefersReducedMotion ? 0.15 : 1.0;

      // Mouse Lerp Smooth Parallax
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      camera.position.x = mouseX * 0.8;
      camera.position.y = 1.2 + mouseY * 0.6;
      camera.lookAt(0, 0.4, 0);

      // Rotate Main Crystal Cube
      mainCubeGroup.rotation.x = elapsedTime * 0.25 * speedMultiplier;
      mainCubeGroup.rotation.y = elapsedTime * 0.35 * speedMultiplier;
      mainCubeGroup.position.y =
        1.2 + Math.sin(elapsedTime * 1.1) * 0.15 * speedMultiplier;

      innerCoreMesh.rotation.x = -elapsedTime * 0.6 * speedMultiplier;
      innerCoreMesh.rotation.y = elapsedTime * 0.5 * speedMultiplier;

      // Rotate Secondary Crystals
      icoGroup.rotation.x = elapsedTime * 0.2 * speedMultiplier;
      icoGroup.rotation.z = elapsedTime * 0.25 * speedMultiplier;
      icoGroup.position.y =
        1.6 + Math.cos(elapsedTime * 0.9) * 0.12 * speedMultiplier;

      diamondGroup.rotation.y = elapsedTime * 0.4 * speedMultiplier;
      diamondGroup.position.y =
        -1.8 + Math.sin(elapsedTime * 1.3) * 0.1 * speedMultiplier;

      // Floating Orbs Movement
      orb1.position.y =
        -1.2 + Math.sin(elapsedTime * 0.95 + 1) * 0.2 * speedMultiplier;
      orb1.position.x =
        -2.8 + Math.cos(elapsedTime * 0.7) * 0.15 * speedMultiplier;

      orb2.position.y =
        -1.0 + Math.cos(elapsedTime * 1.2) * 0.15 * speedMultiplier;

      // Animate Candlesticks breathing wave
      candleMeshes.forEach((candle) => {
        const floatOffset =
          Math.sin(elapsedTime * candle.speed + candle.phase) *
          0.06 *
          speedMultiplier;
        candle.group.position.y = candle.baseY + floatOffset;
      });

      // Slowly rotate chart group slightly
      chartGroup.rotation.y =
        Math.sin(elapsedTime * 0.3) * 0.06 * speedMultiplier;

      // Particle Drift
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.003 * speedMultiplier;
        if (positions[i * 3 + 1] > 7) {
          positions[i * 3 + 1] = -7;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
