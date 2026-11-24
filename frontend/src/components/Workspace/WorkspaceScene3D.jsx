import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Agent 3D Profiles
 * Defines unique cinematic 3D environmental states, camera framing, lighting,
 * and narrative layer decomposition for each of the 4 autonomous agents.
 */
const AGENT_3D_CONFIG = {
  fundamental: {
    tag: "AGENT 01 // FUNDAMENTAL VALUATION & BALANCE SHEET",
    shortName: "FUNDAMENTAL",
    primaryColor: 0x00ff87,
    secondaryColor: 0x00b86b,
    accentHex: "#00ff87",
    cameraOffset: { x: -3.5, y: 3.5, z: 36 },
    lookAtOffset: { x: -1, y: 0, z: 0 },
    vesselRotSpeed: 0.08,
    railsScale: 1.05,
    platesSeparation: [1.8, 1.2, 0.4, -0.4, -1.0], // Upper valuation plates open
    coreEmissive: 1.4,
  },
  technical: {
    tag: "AGENT 02 // TECHNICAL PRICE ACTION & MOMENTUM SIGNALS",
    shortName: "TECHNICAL",
    primaryColor: 0x00e5ff,
    secondaryColor: 0x0077ff,
    accentHex: "#00e5ff",
    cameraOffset: { x: 3.8, y: -2.0, z: 32 },
    lookAtOffset: { x: 1.2, y: -0.5, z: 0 },
    vesselRotSpeed: 0.18, // High momentum spin
    railsScale: 1.35, // Expanded rails
    platesSeparation: [0.8, 2.2, 1.4, -0.8, -1.6], // Dynamic vector echelon
    coreEmissive: 2.0,
  },
  sentiment: {
    tag: "AGENT 03 // NEWS HEADLINES & REGULATORY MACRO SENTIMENT",
    shortName: "SENTIMENT",
    primaryColor: 0x2dd4bf,
    secondaryColor: 0x0d9488,
    accentHex: "#2dd4bf",
    cameraOffset: { x: -2.0, y: -4.0, z: 34 },
    lookAtOffset: { x: 0, y: -1.5, z: 0 },
    vesselRotSpeed: 0.06,
    railsScale: 1.18,
    platesSeparation: [0.4, 0.9, 2.5, 0.9, -0.4], // Center core plate levitates
    coreEmissive: 1.6,
  },
  risk: {
    tag: "AGENT 04 // VOLATILITY DRAWDOWN & RISK AUDIT",
    shortName: "RISK MANAGEMENT",
    primaryColor: 0xf59e0b,
    secondaryColor: 0xef4444,
    accentHex: "#f59e0b",
    cameraOffset: { x: 0.0, y: 5.2, z: 30 },
    lookAtOffset: { x: 0, y: 1.2, z: 0 },
    vesselRotSpeed: 0.04, // Stable containment
    railsScale: 0.94, // Protective containment rings
    platesSeparation: [-0.6, -0.2, 0.0, 1.8, 2.4], // Lower foundation plates lock in
    coreEmissive: 1.8,
  },
};

export default function WorkspaceScene3D({ activeAgentId = "fundamental" }) {
  const containerRef = useRef(null);
  const activeAgentRef = useRef(activeAgentId);
  activeAgentRef.current = activeAgentId;

  const [hudState, setHudState] = useState({
    scrollProgress: 0,
    activeLayer: "01 // MONOLITHIC CORE",
    activeAgentTag: AGENT_3D_CONFIG.fundamental.tag,
    accentHex: AGENT_3D_CONFIG.fundamental.accentHex,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Three.js Scene, Camera, Renderer
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

    // 2. Dynamic Adaptive Lighting
    const ambientLight = new THREE.AmbientLight(0x06281e, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(25, 30, 25);
    scene.add(keyLight);

    // Dynamic reactive lights that smoothly color-shift per active agent
    const dynamicPrimaryLight = new THREE.PointLight(0x00ff87, 4.5, 75);
    dynamicPrimaryLight.position.set(15, 12, 20);
    scene.add(dynamicPrimaryLight);

    const dynamicSecondaryLight = new THREE.PointLight(0x00e5ff, 3.5, 65);
    dynamicSecondaryLight.position.set(-15, -10, 15);
    scene.add(dynamicSecondaryLight);

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
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x24332c,
      metalness: 0.92,
      roughness: 0.2,
    });

    // 4. Centerpiece 5-Layer Intelligence Vessel
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
      railsGroup.add(ringMesh);
      railMeshes.push(ringMesh);
    });
    vesselGroup.add(railsGroup);

    // 7. Data Wave Terrain
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

    // 8. Particle Cloud
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

    // 9. Interactive Variables & Lerp Tracking
    let targetScrollNorm = 0;
    let currentScrollNorm = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Agent transition interpolation state
    const currentPrimaryColor = new THREE.Color(0x00ff87);
    const currentSecondaryColor = new THREE.Color(0x00e5ff);
    const targetCameraPos = new THREE.Vector3(0, 4, 38);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);

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

    // 10. Animation Loop with Smooth State Blending
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth scroll progress interpolation
      currentScrollNorm += (targetScrollNorm - currentScrollNorm) * 0.08;
      const sp = currentScrollNorm;

      // Active agent configuration
      const activeConf =
        AGENT_3D_CONFIG[activeAgentRef.current] || AGENT_3D_CONFIG.fundamental;

      // Smooth color transition for environmental lighting
      currentPrimaryColor.lerp(new THREE.Color(activeConf.primaryColor), 0.045);
      currentSecondaryColor.lerp(new THREE.Color(activeConf.secondaryColor), 0.045);

      dynamicPrimaryLight.color.copy(currentPrimaryColor);
      dynamicSecondaryLight.color.copy(currentSecondaryColor);
      bottomGlow.color.copy(currentPrimaryColor);

      if (!prefersReducedMotion) {
        // --- 3D CAMERA ORBIT & BLENDED POSITIONING ---
        // Blends scroll-driven path with active agent's focused vantage point
        const agentCam = activeConf.cameraOffset;
        const targetX = targetMouseX - sp * 4 + agentCam.x * 0.7;
        const targetY = 4 + targetMouseY - sp * 10 + agentCam.y * 0.7;
        const targetZ = 38 - sp * 10 + (agentCam.z - 36) * 0.6;

        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.position.z += (targetZ - camera.position.z) * 0.05;

        const agentLook = activeConf.lookAtOffset;
        targetLookAt.set(
          agentLook.x,
          -sp * 5 + agentLook.y,
          agentLook.z
        );
        currentLookAt.lerp(targetLookAt, 0.05);
        camera.lookAt(currentLookAt);

        // --- VESSEL DECOMPOSITION & AGENT LAYER EMPHASIS ---
        const decompFactor =
          sp < 0.6
            ? Math.sin((sp / 0.6) * Math.PI * 0.5) * 2.2
            : Math.max(0, 2.2 * Math.cos(((sp - 0.6) / 0.4) * Math.PI * 0.5));

        plates.forEach((p, idx) => {
          const { baseY, separationDir } = p.userData;
          const agentSep = activeConf.platesSeparation[idx] || 0;
          const targetY = baseY + separationDir * decompFactor + agentSep * 0.6;
          p.position.y += (targetY - p.position.y) * 0.06;
        });

        // Centerpiece rotation & elevation
        vesselGroup.rotation.y = elapsed * activeConf.vesselRotSpeed + sp * 3.5;
        vesselGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.05 + sp * 0.3;
        vesselGroup.position.y = 4 - sp * 8;

        // Concentric rails expansion & rotation
        railsGroup.rotation.y = -elapsed * 0.05 - sp * 2.0;
        const targetRailScale = (1.0 + sp * 0.45) * activeConf.railsScale;
        railsGroup.scale.x += (targetRailScale - railsGroup.scale.x) * 0.04;
        railsGroup.scale.z = railsGroup.scale.x;

        // Internal AI core pulsing
        coreGroup.rotation.y = -elapsed * 0.6;
        const breath = 1.0 + Math.sin(elapsed * 2.8) * 0.09;
        coreGroup.scale.set(breath, breath, breath);
        coreMesh.material.emissive.copy(currentPrimaryColor);
        innerSphere.material.emissive.copy(currentSecondaryColor);

        // Algorithmic terrain wave
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
        planeMat.color.copy(currentPrimaryColor);

        // Particle field
        particles.rotation.y = elapsed * 0.015;
        particleMat.color.copy(currentPrimaryColor);

        // Telemetry Update Throttle
        if (Math.floor(elapsed * 20) % 4 === 0) {
          let layerName = "01 // MONOLITHIC CORE";
          if (sp > 0.15 && sp <= 0.38)
            layerName = "02 // PRICE & VOLUME VECTORS";
          else if (sp > 0.38 && sp <= 0.68)
            layerName = activeConf.tag;
          else if (sp > 0.68)
            layerName = "04 // FINANCIAL STATEMENTS & CASHFLOW";

          setHudState({
            scrollProgress: (sp * 100).toFixed(0),
            activeLayer: layerName,
            activeAgentTag: activeConf.tag,
            accentHex: activeConf.accentHex,
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
      scene.clear();
      renderer.dispose();
      chromeMat.dispose();
      glassMat.dispose();
      railMat.dispose();
      planeMat.dispose();
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
      {/* Scroll-Driven & Agent-Reactive Technical HUD Badge */}
      <div
        className="ws-scroll-hud-badge"
        style={{
          position: "fixed",
          bottom: "1.25rem",
          right: "1.5rem",
          zIndex: 40,
          background: "rgba(10, 18, 28, 0.88)",
          border: `1px solid ${hudState.accentHex}40`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${hudState.accentHex}25`,
          backdropFilter: "blur(14px)",
          padding: "0.55rem 0.95rem",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6875rem",
          color: "#94a3b8",
          pointerEvents: "auto",
          transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: hudState.accentHex,
            boxShadow: `0 0 10px ${hudState.accentHex}`,
            display: "inline-block",
            transition: "background 0.4s ease, box-shadow 0.4s ease",
          }}
        />
        <span>
          DEPTH:{" "}
          <strong style={{ color: hudState.accentHex }}>
            {hudState.scrollProgress}%
          </strong>
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={hudState.activeLayer}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            style={{ color: "#f8fafc", fontWeight: 500 }}
          >
            {hudState.activeLayer}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
