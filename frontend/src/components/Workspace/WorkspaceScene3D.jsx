import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * WorkspaceScene3D
 * Reference-inspired scroll-driven 3D motion animation for Market Intelligence AI Workspace.
 * Features:
 * - 5-Layer Chrome & Emerald Glass Intelligence Vessel that visibly separates into narrative layers as you scroll down through the dashboard.
 * - Suspended above concentric metallic cyber rails that expand and orbit with scroll depth.
 * - Glowing internal AI neural core and algorithmic data terrain wave.
 * - Camera orbit, parallax, and depth-of-field transition bound to normalized scroll progress.
 * - Reverses smoothly when scrolling back up, maintaining full physical continuity.
 */
export default function WorkspaceScene3D() {
  const containerRef = useRef(null);
  const [wireframe, setWireframe] = useState(false);
  const [hudState, setHudState] = useState({
    scrollProgress: 0,
    activeLayer: "01 // MONOLITHIC CORE",
  });

  const wireframeRef = useRef(wireframe);
  wireframeRef.current = wireframe;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080e, 0.012);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 38);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Cybernetic Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x06281e, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(25, 30, 25);
    scene.add(keyLight);

    const emeraldLight = new THREE.PointLight(0x00ff87, 4.5, 75);
    emeraldLight.position.set(15, 12, 20);
    scene.add(emeraldLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 3.5, 65);
    cyanLight.position.set(-15, -10, 15);
    scene.add(cyanLight);

    const bottomGlow = new THREE.PointLight(0x00ff87, 3.0, 40);
    bottomGlow.position.set(12, -15, 0);
    scene.add(bottomGlow);

    // 3. Materials
    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xccded5,
      metalness: 0.95,
      roughness: 0.1,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      wireframe: false,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ff87,
      emissive: 0x00b86b,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.3,
      transmission: 0.7,
      thickness: 1.5,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x24332c,
      metalness: 0.92,
      roughness: 0.2,
      wireframe: false,
    });

    // 4. Centerpiece Group: 5-Layer Market Intelligence Vessel
    const vesselGroup = new THREE.Group();
    vesselGroup.position.set(4, 0, -8);
    scene.add(vesselGroup);

    const plates = [];
    const plateCount = 5;
    const vesselHeight = 11.0;
    const sliceHeight = vesselHeight / plateCount;

    for (let i = 0; i < plateCount; i++) {
      const plateGroup = new THREE.Group();
      const yMin = 5.5 - (i + 1) * sliceHeight;
      const yMax = 5.5 - i * sliceHeight;
      const yMid = (yMin + yMax) / 2;

      const subPoints = [];
      const steps = 14;
      for (let s = 0; s <= steps; s++) {
        const y = yMax - (s / steps) * sliceHeight;
        const t = (5.5 - y) / 11.0;
        let r = 1.4 + Math.sin(t * Math.PI) * 2.8;
        if (t < 0.2) r = 0.6 + t * 9.0;
        if (t > 0.85) r = (1 - t) * 12.0;
        subPoints.push(new THREE.Vector2(Math.max(0.2, r), y - yMid));
      }

      const geom = new THREE.LatheGeometry(subPoints, 48);
      const mat = i % 2 === 0 ? chromeMat.clone() : glassMat.clone();
      const mesh = new THREE.Mesh(geom, mat);

      // Bevel seam ring
      const seamGeom = new THREE.TorusGeometry(
        subPoints[subPoints.length - 1].x,
        0.06,
        8,
        48
      );
      seamGeom.rotateX(Math.PI / 2);
      const seamMesh = new THREE.Mesh(
        seamGeom,
        new THREE.MeshStandardMaterial({
          color: 0x00ff87,
          emissive: 0x00ff87,
          emissiveIntensity: 0.6,
          metalness: 0.85,
        })
      );
      seamMesh.position.y = -sliceHeight / 2;
      mesh.add(seamMesh);

      plateGroup.position.y = yMid;
      plateGroup.userData = {
        baseY: yMid,
        index: i,
        // Center plate stays anchor, top moves up, bottom moves down
        separationDir: (2 - i) * 2.2,
      };

      plateGroup.add(mesh);
      vesselGroup.add(plateGroup);
      plates.push(plateGroup);
    }

    // 5. Internal Glowing Multi-Agent AI Core
    const coreGroup = new THREE.Group();
    const coreMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.2, 0),
      new THREE.MeshStandardMaterial({
        color: 0x00ff87,
        emissive: 0x00ff87,
        emissiveIntensity: 1.2,
        wireframe: true,
        metalness: 0.6,
      })
    );
    coreGroup.add(coreMesh);

    const innerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.5,
      })
    );
    coreGroup.add(innerSphere);
    vesselGroup.add(coreGroup);

    // 6. Concentric Metallic Cyber Rails
    const railsGroup = new THREE.Group();
    const railRadii = [5.5, 7.2, 9.0, 11.2, 13.8];
    const railMeshes = [];

    railRadii.forEach((r, idx) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.08, 12, 80);
      ringGeom.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeom, railMat.clone());
      ringMesh.position.y = -6.2 - idx * 0.15;
      ringMesh.userData = { baseRadius: r, index: idx };
      railsGroup.add(ringMesh);
      railMeshes.push(ringMesh);
    });
    vesselGroup.add(railsGroup);

    // 7. Background Algorithmic Data Wave Terrain
    const planeGeo = new THREE.PlaneGeometry(130, 90, 48, 36);
    planeGeo.rotateX(-Math.PI / 2.3);
    planeGeo.translate(0, -18, -15);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff87,
      emissive: 0x044a2b,
      emissiveIntensity: 0.35,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const waveMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(waveMesh);

    const posAttr = planeGeo.attributes.position;
    const initialZ = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      initialZ[i] = posAttr.getY(i);
    }

    // 8. Floating Market Data Particle Cloud
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 90;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0x00ff87,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Normalized Scroll Tracking & Mouse Parallax
    let targetScrollNorm = 0;
    let currentScrollNorm = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        targetScrollNorm = Math.max(
          0,
          Math.min(1, window.scrollY / docHeight)
        );
      }
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = mouseX * 2.5;
      targetMouseY = mouseY * 2.0;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (window.lenis) {
      window.lenis.on("scroll", handleScroll);
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth scroll progress interpolation
      currentScrollNorm += (targetScrollNorm - currentScrollNorm) * 0.08;
      const sp = currentScrollNorm;

      if (!prefersReducedMotion) {
        // --- SCROLL-DRIVEN MOTION BEHAVIOR ---
        // 1. Layer Decomposition based on scroll progress:
        // As you scroll from top (sp: 0) to middle (sp: 0.5), plates separate widely.
        // At the bottom (sp: 1), plates smoothly recombine into a sleek disk/stack.
        const decompFactor =
          sp < 0.6
            ? Math.sin((sp / 0.6) * Math.PI * 0.5) * 2.4
            : Math.max(0, 2.4 * Math.cos(((sp - 0.6) / 0.4) * Math.PI * 0.5));

        plates.forEach((p) => {
          const { baseY, separationDir } = p.userData;
          p.position.y = baseY + separationDir * decompFactor;
        });

        // 2. Camera Scroll Animation & Orbit:
        // Camera smoothly glides along X, Y, Z based on scroll depth
        camera.position.x = targetMouseX - sp * 4;
        camera.position.y = 4 + targetMouseY - sp * 10;
        camera.position.z = 38 - sp * 10;
        camera.lookAt(0, -sp * 5, 0);

        // 3. Centerpiece rotation and tilt
        vesselGroup.rotation.y = elapsed * 0.08 + sp * 3.5;
        vesselGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.05 + sp * 0.3;
        vesselGroup.position.y = 4 - sp * 8;

        // 4. Concentric rails expansion on scroll
        railsGroup.rotation.y = -elapsed * 0.05 - sp * 2.0;
        const railScale = 1.0 + sp * 0.45;
        railsGroup.scale.set(railScale, 1.0, railScale);

        // 5. Core pulsing and counter-spin
        coreGroup.rotation.y = -elapsed * 0.5;
        const breath = 1.0 + Math.sin(elapsed * 2.5) * 0.08;
        coreGroup.scale.set(breath, breath, breath);

        // 6. Terrain wave update
        const pos = planeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = (i % 49) / 48;
          const v = Math.floor(i / 49) / 36;
          const w =
            Math.sin(u * 7 + elapsed * 1.2) * 2.0 +
            Math.cos(v * 5 + elapsed * 0.9) * 1.6;
          pos.setZ(i, initialZ[i] + w);
        }
        pos.needsUpdate = true;

        // 7. Particle slow orbit
        particles.rotation.y = elapsed * 0.015;

        // Update HUD state once per frame throttle
        if (Math.floor(elapsed * 20) % 4 === 0) {
          let layerName = "01 // MONOLITHIC CORE";
          if (sp > 0.15 && sp <= 0.4) layerName = "02 // PRICE & VOLUME VECTORS";
          else if (sp > 0.4 && sp <= 0.7)
            layerName = "03 // 5-TIER MULTI-AGENT QUORUM";
          else if (sp > 0.7) layerName = "04 // FINANCIAL STATEMENTS & CASHFLOW";

          setHudState({
            scrollProgress: (sp * 100).toFixed(0),
            activeLayer: layerName,
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (window.lenis) {
        window.lenis.off("scroll", handleScroll);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      plates.forEach((p) => {
        p.traverse((c) => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="workspace-3d-canvas-container"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Scroll-Driven Technical HUD Badge (Reference-inspired) */}
      <div
        className="ws-scroll-hud-badge"
        style={{
          position: "fixed",
          bottom: "1.25rem",
          right: "1.5rem",
          zIndex: 40,
          background: "rgba(10, 18, 28, 0.85)",
          border: "1px solid rgba(0, 255, 135, 0.28)",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 255, 135, 0.15)",
          backdropFilter: "blur(14px)",
          padding: "0.5rem 0.85rem",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6875rem",
          color: "#94a3b8",
          pointerEvents: "auto",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#00ff87",
            boxShadow: "0 0 8px #00ff87",
            display: "inline-block",
          }}
        />
        <span>
          DEPTH: <strong style={{ color: "#00ff87" }}>{hudState.scrollProgress}%</strong>
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ color: "#f8fafc" }}>{hudState.activeLayer}</span>
      </div>
    </div>
  );
}
