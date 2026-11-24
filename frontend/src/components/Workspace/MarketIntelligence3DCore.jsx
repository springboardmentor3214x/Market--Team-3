import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Cpu, Layers, Maximize2, RotateCw, Activity, ShieldCheck } from "lucide-react";

/**
 * MarketIntelligence3DCore
 * Dedicated 3D Interactive Motion Stage for Market Intelligence AI Workspace.
 * Directly integrates the 5-layer chrome and emerald glass artifact inspired by Ballast:
 * - 5 narrative plates separating on scroll (Fundamental, Technical, Sentiment, Risk, Supervisor)
 * - Concentric metallic orbital rails expanding and spinning with scroll depth
 * - Internal glowing multi-agent AI neural core
 * - Real-time scroll binding, mouse parallax, and interactive controls
 */
export default function MarketIntelligence3DCore() {
  const containerRef = useRef(null);
  const [wireframe, setWireframe] = useState(false);
  const [isDecomposed, setIsDecomposed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTier, setActiveTier] = useState("01 // MONOLITHIC CORE");

  const wireframeRef = useRef(wireframe);
  wireframeRef.current = wireframe;
  const manualDecompRef = useRef(isDecomposed);
  manualDecompRef.current = isDecomposed;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080e, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 8.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. High-Tech Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x08261e, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const emeraldLight = new THREE.PointLight(0x00ff87, 5.0, 30);
    emeraldLight.position.set(-5, 4, 4);
    scene.add(emeraldLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 4.0, 25);
    cyanLight.position.set(5, -3, 3);
    scene.add(cyanLight);

    const bottomGlow = new THREE.PointLight(0x00ff87, 4.5, 18);
    bottomGlow.position.set(0, -3.2, 1);
    scene.add(bottomGlow);

    // 3. Materials
    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xddede5,
      metalness: 0.96,
      roughness: 0.08,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      wireframe: wireframeRef.current,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ff87,
      emissive: 0x00b86b,
      emissiveIntensity: 0.65,
      roughness: 0.12,
      metalness: 0.25,
      transmission: 0.8,
      thickness: 1.3,
      transparent: true,
      opacity: 0.85,
      wireframe: wireframeRef.current,
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x364a40,
      metalness: 0.92,
      roughness: 0.22,
      wireframe: wireframeRef.current,
    });

    // 4. Root Centerpiece Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 5. Build the 5 Narrative Chrome & Glass Plates
    const plates = [];
    const plateCount = 5;
    const vesselHeight = 3.6;
    const sliceHeight = vesselHeight / plateCount;

    for (let i = 0; i < plateCount; i++) {
      const plateGroup = new THREE.Group();
      const yMin = 1.8 - (i + 1) * sliceHeight;
      const yMax = 1.8 - i * sliceHeight;
      const yMid = (yMin + yMax) / 2;

      const subPoints = [];
      const steps = 14;
      for (let s = 0; s <= steps; s++) {
        const y = yMax - (s / steps) * sliceHeight;
        const t = (1.8 - y) / 3.6;
        let r = 0.5 + Math.sin(t * Math.PI) * 1.05;
        if (t < 0.2) r = 0.2 + t * 4.5;
        if (t > 0.85) r = (1 - t) * 6.2;
        subPoints.push(new THREE.Vector2(Math.max(0.08, r), y - yMid));
      }

      const geom = new THREE.LatheGeometry(subPoints, 48);
      const mat = i % 2 === 0 ? chromeMat.clone() : glassMat.clone();
      const mesh = new THREE.Mesh(geom, mat);

      // Bevel seam ring
      const seamGeom = new THREE.TorusGeometry(
        subPoints[subPoints.length - 1].x,
        0.022,
        8,
        48
      );
      seamGeom.rotateX(Math.PI / 2);
      const seamMesh = new THREE.Mesh(
        seamGeom,
        new THREE.MeshStandardMaterial({
          color: 0x00ff87,
          emissive: 0x00ff87,
          emissiveIntensity: 0.5,
          metalness: 0.8,
        })
      );
      seamMesh.position.y = -sliceHeight / 2;
      mesh.add(seamMesh);

      plateGroup.position.y = yMid;
      plateGroup.userData = {
        baseY: yMid,
        index: i,
        // Center stays anchor, top plates separate upward, bottom separate downward
        separationDir: (2 - i) * 0.95,
      };

      plateGroup.add(mesh);
      rootGroup.add(plateGroup);
      plates.push(plateGroup);
    }

    // 6. Internal Glowing Multi-Agent AI Core (Icosahedron + Neural Nodes)
    const coreGroup = new THREE.Group();
    const coreGeom = new THREE.IcosahedronGeometry(0.75, 0);
    const coreMesh = new THREE.Mesh(
      coreGeom,
      new THREE.MeshStandardMaterial({
        color: 0x00ff87,
        emissive: 0x00ff87,
        emissiveIntensity: 1.2,
        wireframe: true,
        metalness: 0.5,
      })
    );
    coreGroup.add(coreMesh);

    const innerCoreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 18, 18),
      new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.5,
      })
    );
    coreGroup.add(innerCoreSphere);
    rootGroup.add(coreGroup);

    // 7. Concentric Metallic Cyber Rails
    const ringsGroup = new THREE.Group();
    const ringRadii = [2.0, 2.6, 3.2, 4.0];
    const ringMeshes = [];

    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.032, 12, 72);
      ringGeom.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeom, railMat.clone());
      ringMesh.position.y = -2.0 - idx * 0.06;
      ringsGroup.add(ringMesh);
      ringMeshes.push(ringMesh);
    });
    rootGroup.add(ringsGroup);

    // 8. Laser Connector Lines between separated plates
    const linesGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00ff87,
      transparent: true,
      opacity: 0.35,
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const pts = [
        new THREE.Vector3(Math.cos(angle) * 0.8, -1.8, Math.sin(angle) * 0.8),
        new THREE.Vector3(Math.cos(angle) * 0.8, 1.8, Math.sin(angle) * 0.8),
      ];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMesh = new THREE.Line(lineGeom, lineMat);
      linesGroup.add(lineMesh);
    }
    rootGroup.add(linesGroup);

    // 9. Floating Particle Aura
    const pCount = 200;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMesh = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x00ff87,
        size: 0.045,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(pMesh);

    // 10. Scroll & Mouse Tracking
    let targetScroll = 0;
    let currentScroll = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        targetScroll = Math.max(0, Math.min(1, window.scrollY / docHeight));
      }
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.6;
      targetRotX = -y * 0.45;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (window.lenis) {
      window.lenis.on("scroll", handleScroll);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 11. Animation Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth scroll progress
      currentScroll += (targetScroll - currentScroll) * 0.08;
      const sp = currentScroll;

      // Mouse parallax lerp
      rootGroup.rotation.y +=
        (targetRotY + elapsed * 0.06 + sp * 2.8 - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.06;

      // Dynamic Layer Decomposition Factor on Scroll:
      // Combines scroll progress with manual button toggle
      const baseScrollDecomp =
        sp < 0.65
          ? Math.sin((sp / 0.65) * Math.PI * 0.5) * 1.8
          : Math.max(0, 1.8 * Math.cos(((sp - 0.65) / 0.35) * Math.PI * 0.5));

      const totalDecomp = manualDecompRef.current
        ? 1.8
        : baseScrollDecomp;

      plates.forEach((p) => {
        p.position.y = p.userData.baseY + p.userData.separationDir * totalDecomp;
      });

      // Concentric rails expand on scroll
      const railScale = 1.0 + totalDecomp * 0.25;
      ringsGroup.scale.set(railScale, 1.0, railScale);
      ringsGroup.rotation.y = -elapsed * 0.05 - sp * 1.5;

      // Core pulsing
      coreGroup.rotation.y = -elapsed * 0.4;
      const breath = 1.0 + Math.sin(elapsed * 2.8) * 0.06;
      coreGroup.scale.set(breath, breath, breath);

      // Camera tilt on scroll
      camera.position.y = 1.2 - sp * 0.8;
      camera.position.z = 8.8 - sp * 1.2;

      // Wireframe state updates
      rootGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = wireframeRef.current;
        }
      });

      // Throttle HUD update state
      if (Math.floor(elapsed * 20) % 4 === 0) {
        setScrollProgress((sp * 100).toFixed(0));
        let tierLabel = "01 // MONOLITHIC QUANT CORE";
        if (totalDecomp > 0.4 && totalDecomp <= 0.9)
          tierLabel = "02 // PRICE & VOLUME MOMENTUM VECTORS";
        else if (totalDecomp > 0.9 && totalDecomp <= 1.4)
          tierLabel = "03 // MULTI-AGENT LANGGRAPH SUPERVISOR";
        else if (totalDecomp > 1.4)
          tierLabel = "04 // 5-TIER AUTONOMOUS DECOMPOSITION ACTIVE";
        setActiveTier(tierLabel);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (window.lenis) {
        window.lenis.off("scroll", handleScroll);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      className="ws-glass-card ws-3d-motion-deck"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.1 }}
      style={{
        position: "relative",
        overflow: "hidden",
        marginBottom: "24px",
        background:
          "linear-gradient(135deg, rgba(10, 18, 28, 0.82) 0%, rgba(5, 8, 14, 0.92) 100%)",
        border: "1px solid rgba(0, 255, 135, 0.25)",
        boxShadow:
          "0 12px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(0, 255, 135, 0.2)",
      }}
    >
      {/* Header Bar with Live Telemetry */}
      <div
        className="ws-card-header"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "rgba(0, 255, 135, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={16} color="#00ff87" />
          </div>
          <div>
            <span
              style={{
                fontFamily: "var(--ws-font-mono, monospace)",
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "#f8fafc",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Multi-Agent Intelligence Core // 3D Motion Stage
            </span>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#00ff87",
                  boxShadow: "0 0 6px #00ff87",
                  display: "inline-block",
                }}
              />
              <span>Scroll-Driven 5-Plate Decomposition Engine</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Chips & Control Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              fontFamily: "var(--ws-font-mono, monospace)",
              fontSize: "0.6875rem",
              background: "rgba(0, 255, 135, 0.08)",
              border: "1px solid rgba(0, 255, 135, 0.25)",
              padding: "4px 10px",
              borderRadius: "20px",
              color: "#00ff87",
            }}
          >
            SCROLL DEPTH: <strong>{scrollProgress}%</strong>
          </div>

          <button
            type="button"
            onClick={() => setIsDecomposed(!isDecomposed)}
            className="ws-btn-ghost"
            style={{
              padding: "5px 12px",
              fontSize: "0.6875rem",
              fontFamily: "var(--ws-font-mono, monospace)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isDecomposed
                ? "rgba(0, 255, 135, 0.18)"
                : "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(0, 255, 135, 0.3)",
              color: isDecomposed ? "#00ff87" : "#e2e8f0",
              cursor: "pointer",
              borderRadius: "4px",
            }}
            title="Toggle layer decomposition"
          >
            <Activity size={12} />
            {isDecomposed ? "Recombine Core" : "Decompose 5 Plates"}
          </button>

          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className="ws-btn-ghost"
            style={{
              padding: "5px 12px",
              fontSize: "0.6875rem",
              fontFamily: "var(--ws-font-mono, monospace)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: wireframe
                ? "rgba(0, 229, 255, 0.18)"
                : "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              color: wireframe ? "#00e5ff" : "#e2e8f0",
              cursor: "pointer",
              borderRadius: "4px",
            }}
            title="Toggle technical wireframe"
          >
            <Maximize2 size={12} />
            {wireframe ? "Shaded PBR" : "Wireframe Mode"}
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage Container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "280px",
          position: "relative",
          cursor: "grab",
        }}
      >
        {/* Technical HUD Overlay Callouts (Reference-inspired from Ballast) */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "20px",
            pointerEvents: "none",
            fontFamily: "var(--ws-font-mono, monospace)",
            fontSize: "0.6875rem",
            color: "rgba(0, 255, 135, 0.8)",
            letterSpacing: "0.08em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "4px",
                height: "4px",
                background: "#00ff87",
                display: "inline-block",
              }}
            />
            <span>STATE: {activeTier}</span>
          </div>
          <div
            style={{
              color: "rgba(148, 163, 184, 0.65)",
              fontSize: "0.625rem",
              marginTop: "4px",
            }}
          >
            [PLATES 01–05: QUANTITATIVE / TECHNICAL / FUNDAMENTAL / SENTIMENT / RISK]
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
            pointerEvents: "none",
            fontFamily: "var(--ws-font-mono, monospace)",
            fontSize: "0.625rem",
            color: "rgba(0, 229, 255, 0.75)",
            letterSpacing: "0.08em",
          }}
        >
          <span>CONCENTRIC METALLIC RAILS // ORBITAL VELOCITY: SYNCHRONIZED</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "20px",
            pointerEvents: "none",
            fontFamily: "var(--ws-font-mono, monospace)",
            fontSize: "0.625rem",
            color: "rgba(148, 163, 184, 0.5)",
          }}
        >
          SCROLL TO DECOMPOSE // HOVER TO TILT
        </div>
      </div>
    </motion.div>
  );
}
