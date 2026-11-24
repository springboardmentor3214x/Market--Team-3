import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * FinancialScene3D (Login Page)
 * Reference-inspired 3D motion centerpiece for Market Intelligence AI:
 * Features a 5-layer reflective chrome and emerald glass artifact housing
 * an internal glowing Multi-Agent AI core, suspended above concentric metallic cyber rails,
 * accompanied by candlestick momentum graph, floating alpha nodes, and technical measurement HUD.
 */
export default function FinancialScene3D() {
  const containerRef = useRef(null);
  const [wireframe, setWireframe] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x05080e, 0.035);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. High-Tech Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x08261e, 2.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    mainKeyLight.position.set(5, 8, 6);
    scene.add(mainKeyLight);

    const emeraldRimLight = new THREE.PointLight(0x00ff87, 5.0, 35);
    emeraldRimLight.position.set(-4, 3, 4);
    scene.add(emeraldRimLight);

    const cyanFillLight = new THREE.PointLight(0x00e5ff, 3.5, 30);
    cyanFillLight.position.set(4, -3, 3);
    scene.add(cyanFillLight);

    const bottomGlow = new THREE.PointLight(0x00ff87, 4.0, 20);
    bottomGlow.position.set(0, -3.5, 1);
    scene.add(bottomGlow);

    // 3. Materials
    const chromePlateMat = new THREE.MeshPhysicalMaterial({
      color: 0xddede5,
      metalness: 0.96,
      roughness: 0.09,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      wireframe: false,
    });

    const glassCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ff87,
      emissive: 0x00b86b,
      emissiveIntensity: 0.6,
      roughness: 0.12,
      metalness: 0.2,
      transmission: 0.75,
      thickness: 1.2,
      transparent: true,
      opacity: 0.85,
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x3a4b42,
      metalness: 0.9,
      roughness: 0.25,
    });

    const greenCandleMat = new THREE.MeshStandardMaterial({
      color: 0x00ff87,
      emissive: 0x008f4c,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.9,
    });

    const redCandleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    // 4. Root Centerpiece Group
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0.9, 0.2, 0);
    rootGroup.scale.set(1.15, 1.15, 1.15);
    scene.add(rootGroup);

    // 5. 5-Layer Chrome & Glass Vessel (Market Intelligence Artifact)
    const plates = [];
    const plateCount = 5;
    const vesselHeight = 3.4;
    const sliceHeight = vesselHeight / plateCount;

    for (let i = 0; i < plateCount; i++) {
      const plateGroup = new THREE.Group();
      const yMin = 1.7 - (i + 1) * sliceHeight;
      const yMax = 1.7 - i * sliceHeight;
      const yMid = (yMin + yMax) / 2;

      const subPoints = [];
      const steps = 12;
      for (let s = 0; s <= steps; s++) {
        const y = yMax - (s / steps) * sliceHeight;
        const t = (1.7 - y) / 3.4;
        let r = 0.5 + Math.sin(t * Math.PI) * 0.95;
        if (t < 0.2) r = 0.22 + t * 4.0;
        if (t > 0.85) r = (1 - t) * 5.5;
        subPoints.push(new THREE.Vector2(Math.max(0.08, r), y - yMid));
      }

      const geom = new THREE.LatheGeometry(subPoints, 44);
      // Alternate between reflective chrome plates and emerald tinted glass
      const mat = i % 2 === 0 ? chromePlateMat.clone() : glassCoreMat.clone();
      const mesh = new THREE.Mesh(geom, mat);

      // Bevel seam ring
      const seamGeom = new THREE.TorusGeometry(
        subPoints[subPoints.length - 1].x,
        0.022,
        8,
        44
      );
      seamGeom.rotateX(Math.PI / 2);
      const seamMesh = new THREE.Mesh(
        seamGeom,
        new THREE.MeshStandardMaterial({
          color: 0x00ff87,
          emissive: 0x00ff87,
          emissiveIntensity: 0.4,
          metalness: 0.8,
        })
      );
      seamMesh.position.y = -sliceHeight / 2;
      mesh.add(seamMesh);

      plateGroup.position.y = yMid;
      plateGroup.userData = {
        baseY: yMid,
        index: i,
        separationDir: (2 - i) * 0.65,
      };

      plateGroup.add(mesh);
      rootGroup.add(plateGroup);
      plates.push(plateGroup);
    }

    // 6. Internal Glowing Multi-Agent AI Core (Octahedron/Neural Cluster)
    const coreGroup = new THREE.Group();
    const coreGeom = new THREE.OctahedronGeometry(0.72, 0);
    const coreMesh = new THREE.Mesh(
      coreGeom,
      new THREE.MeshStandardMaterial({
        color: 0x00ff87,
        emissive: 0x00ff87,
        emissiveIntensity: 1.1,
        metalness: 0.4,
        roughness: 0.2,
        wireframe: true,
      })
    );
    coreGroup.add(coreMesh);

    // Inner glowing sphere
    const innerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.4,
      })
    );
    coreGroup.add(innerSphere);
    rootGroup.add(coreGroup);

    // 7. Concentric Metallic Cyber Rails Suspended Underneath
    const ringsGroup = new THREE.Group();
    const ringRadii = [1.8, 2.3, 2.8, 3.4];
    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.028, 12, 64);
      ringGeom.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeom, railMat);
      ringMesh.position.y = -1.9 - idx * 0.05;
      ringsGroup.add(ringMesh);
    });
    rootGroup.add(ringsGroup);

    // 8. Candlestick Trajectory Group on Left
    const chartGroup = new THREE.Group();
    chartGroup.position.set(-2.8, -0.6, 0.5);
    scene.add(chartGroup);

    const candleCount = 10;
    const candleSpacing = 0.42;
    const baseWave = [1.0, 1.2, 1.1, 1.4, 1.3, 1.6, 1.85, 1.75, 2.1, 2.4];
    const trendPoints = [];

    for (let i = 0; i < candleCount; i++) {
      const isBull = i === 0 || baseWave[i] >= baseWave[i - 1];
      const h = Math.max(0.3, Math.abs(baseWave[i] - (i > 0 ? baseWave[i - 1] : 0.9)) + 0.25);
      const x = i * candleSpacing - (candleCount * candleSpacing) / 2;
      const y = (baseWave[i] - 1.6) * 0.8;

      const single = new THREE.Group();
      single.position.set(x, y, 0);

      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, h + 0.35, 6),
        isBull ? greenCandleMat : redCandleMat
      );
      single.add(wick);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, h, 0.22),
        isBull ? greenCandleMat : redCandleMat
      );
      single.add(body);
      chartGroup.add(single);

      trendPoints.push(new THREE.Vector3(x, y + h / 2 + 0.1, 0.02));
    }

    const curve = new THREE.CatmullRomCurve3(trendPoints);
    const splineMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.024, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0x00ff87,
        emissive: 0x00ff87,
        emissiveIntensity: 0.9,
      })
    );
    chartGroup.add(splineMesh);

    // 9. Floating Particle Dust
    const pCount = 350;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMesh = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x00ff87,
        size: 0.045,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(pMesh);

    // 10. Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.45;
      targetRotX = -y * 0.35;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 11. Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer rotation
      if (!prefersReducedMotion) {
        rootGroup.rotation.y += (targetRotY + elapsed * 0.05 - rootGroup.rotation.y) * 0.05;
        rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.05;

        // Subtle breathing decomposition cycle
        const decomp = (Math.sin(elapsed * 1.5) * 0.5 + 0.5) * 0.35;
        plates.forEach((p) => {
          p.position.y = p.userData.baseY + p.userData.separationDir * decomp;
        });

        // Core counter-rotation
        coreGroup.rotation.y = -elapsed * 0.4;
        coreGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.2;
        const breath = 1 + Math.sin(elapsed * 3.0) * 0.05;
        coreGroup.scale.set(breath, breath, breath);

        // Rails slow spin
        ringsGroup.rotation.y = elapsed * 0.03;

        // Candlestick float
        chartGroup.position.y = -0.6 + Math.sin(elapsed * 0.8) * 0.08;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="financial-scene-3d-root"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Technical Measurement HUD Callouts (Ballast-inspired) */}
      <div
        className="login-3d-hud"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {/* Top-Right Technical Callout */}
        <div
          style={{
            position: "absolute",
            top: "14%",
            right: "12%",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            color: "rgba(0, 255, 135, 0.75)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              background: "#00ff87",
              boxShadow: "0 0 6px #00ff87",
              display: "inline-block",
            }}
          />
          LAYER 01–02 // ALPHA ENGINE
        </div>

        {/* Mid-Right Technical Callout */}
        <div
          style={{
            position: "absolute",
            top: "52%",
            right: "8%",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            color: "rgba(0, 229, 255, 0.7)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              background: "#00e5ff",
              boxShadow: "0 0 6px #00e5ff",
              display: "inline-block",
            }}
          />
          CONCENTRIC ORBIT // v2.4 CONSENSUS
        </div>
      </div>
    </div>
  );
}
