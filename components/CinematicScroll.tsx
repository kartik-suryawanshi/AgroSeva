"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";

// STEP 2 — CONFIGURATION OBJECT
const SCROLL_CONFIG = {
  frameCount: 60,
  folderPath: "/frames/",
  filePrefix: "frame-",
  filePadding: 3,
  fileExtension: ".webp",
  accentColor: "#C9A84C",
  theme: "dark" as "dark" | "light",
};

const getFrameUrl = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(SCROLL_CONFIG.filePadding, "0");
  return `${SCROLL_CONFIG.folderPath}${SCROLL_CONFIG.filePrefix}${paddedIndex}${SCROLL_CONFIG.fileExtension}`;
};

const Milestone = ({
  m,
  scrollYProgress,
}: {
  m: { start: number; end: number; text: string; subtext: string };
  scrollYProgress: any;
}) => {
  const opacity = useTransform(
    scrollYProgress,
    [
      m.start,
      m.start + (m.end - m.start) * 0.3,
      m.end - (m.end - m.start) * 0.3,
      m.end,
    ],
    [0, 1, 1, 0]
  );
  return (
    <motion.div style={{ opacity }} className="absolute shrink-0 max-w-2xl">
      <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight leading-tight">
        {m.text}
      </h2>
      <p className="text-xl md:text-2xl text-offwhite/90 mt-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {m.subtext}
      </p>
    </motion.div>
  );
};

export default function CinematicScroll() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [shutterOpen, setShutterOpen] = useState(false);
  const [interactionReady, setInteractionReady] = useState(false);
  const [devFrameVal, setDevFrameVal] = useState(0);

  // Framer Motion Values
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // STEP 6 — SPRING PHYSICS FOR FRAME INDEX
  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 1.2,
  });

  const lenisRef = useRef<Lenis | null>(null);
  const mouseY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const cursorScale = useSpring(1, { stiffness: 150, damping: 20 });

  // STEP 3 — PROGRESSIVE FRAME LOADER
  useEffect(() => {
    let isCancelled = false;

    const loadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          framesRef.current[index] = img;
          resolve(img);
        };
        img.onerror = () => {
          // Create dummy image if fails to load so it doesn't break
          const canvas = document.createElement("canvas");
          canvas.width = 1920;
          canvas.height = 1080;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#1B4332";
            ctx.fillRect(0, 0, 1920, 1080);
            ctx.fillStyle = "#C9A84C";
            ctx.font = "bold 100px Arial";
            ctx.fillText(`Frame ${index}`, 800, 540);
          }
          const dummyImg = new Image();
          dummyImg.src = canvas.toDataURL();
          dummyImg.onload = () => {
            framesRef.current[index] = dummyImg;
            resolve(dummyImg);
          };
        };
      });
    };

    const runLoader = async () => {
      // Stage 1: Load frame 0 immediately
      await loadFrame(0);
      if (isCancelled) return;
      
      setLoadingProgress(10);
      setLoadingComplete(true);
      setTimeout(() => setShutterOpen(true), 100);

      // Stage 2: Load every 4th frame
      const stage2Indices = [];
      for (let i = 4; i < SCROLL_CONFIG.frameCount; i += 4) {
        stage2Indices.push(i);
      }
      
      for (let i = 0; i < stage2Indices.length; i += 10) {
        const batch = stage2Indices.slice(i, i + 10);
        await Promise.all(batch.map(loadFrame));
        if (isCancelled) return;
        setLoadingProgress(10 + Math.floor((i / stage2Indices.length) * 40));
      }
      
      setInteractionReady(true);

      // Stage 3: Load remaining frames
      const remainingIndices = [];
      for (let i = 1; i < SCROLL_CONFIG.frameCount; i++) {
        if (!framesRef.current[i]) remainingIndices.push(i);
      }

      for (let i = 0; i < remainingIndices.length; i += 8) {
        const batch = remainingIndices.slice(i, i + 8);
        await Promise.all(batch.map(loadFrame));
        if (isCancelled) return;
        
        await new Promise((r) => setTimeout(r, 50)); // 50ms delay to keep main thread free
        setLoadingProgress(50 + Math.floor((i / remainingIndices.length) * 50));
      }
      setLoadingProgress(100);
    };

    runLoader();
    return () => {
      isCancelled = true;
    };
  }, []);

  // STEP 5 — SMOOTH SCROLL INTEGRATION
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Degrade gracefully on low-end devices
    if (navigator.hardwareConcurrency <= 2) {
      document.documentElement.style.scrollBehavior = "smooth";
      return;
    }

    const lenis = new Lenis({
      lerp: 0.07,
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", () => {
      // Update things if needed
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Sync Lenis RAF with Framer Motion and handle generic RAF needs
  useAnimationFrame((time) => {
    if (lenisRef.current) {
      lenisRef.current.raf(time);
    }
  });

  // STEP 4 — CANVAS RENDERER
  useAnimationFrame(() => {
    if (!canvasRef.current || framesRef.current.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Map scrollYProgress to frame index
    const maxIndex = SCROLL_CONFIG.frameCount - 1;
    // Degrade to raw progress if not interactive yet
    const currentProgress = interactionReady ? smoothedProgress.get() : scrollYProgress.get();
    let frameIndex = Math.floor(currentProgress * maxIndex);
    
    // Bounds check
    if (frameIndex < 0) frameIndex = 0;
    if (frameIndex > maxIndex) frameIndex = maxIndex;
    
    // Dev counter update
    setDevFrameVal(frameIndex);

    // Fallback to closest loaded frame if not loaded yet
    while (!framesRef.current[frameIndex] && frameIndex > 0) {
      frameIndex--;
    }
    const img = framesRef.current[frameIndex];
    if (!img) return;

    // Manual object-fit contain math
    const canvas = canvasRef.current;
    
    // Only resize canvas if needed
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let renderWidth, renderHeight, x, y;

    if (canvasRatio > imgRatio) {
      renderWidth = canvas.width;
      renderHeight = canvas.width / imgRatio;
      x = 0;
      y = (canvas.height - renderHeight) / 2;
    } else {
      renderWidth = canvas.height * imgRatio;
      renderHeight = canvas.height;
      x = (canvas.width - renderWidth) / 2;
      y = 0;
    }

    ctx.drawImage(img, x, y, renderWidth, renderHeight);
  });

  // Cursor Follower Micro Interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // STEP 9 — SCROLLYTELLING TEXT OVERLAYS
  const milestones = [
    { start: 0.0, end: 0.15, text: "Empowering Farmers.", subtext: "Strengthening Agriculture." },
    { start: 0.2, end: 0.38, text: "Apply for schemes,", subtext: "track subsidies directly." },
    { start: 0.45, end: 0.62, text: "File grievances", subtext: "and get fast resolutions." },
    { start: 0.7, end: 0.88, text: "All in one place.", subtext: "AgroSeva Portal" },
  ];

  // Ambient Glow Transforms
  const glowX1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const glowY1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const glowX2 = useTransform(scrollYProgress, [0, 1], ["100%", "50%"]);
  const glowY2 = useTransform(scrollYProgress, [0, 1], ["100%", "70%"]);

  return (
    <div ref={containerRef} className="relative w-full bg-forest-dark" style={{ height: "900vh" }}>
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-[3px] z-[60] bg-gold"
        style={{ width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
      />

      {/* Frame Counter (Dev Mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-[60] font-mono text-white bg-black/50 px-2 py-1 rounded">
          {devFrameVal} / {SCROLL_CONFIG.frameCount}
        </div>
      )}

      {/* Cursor Follower */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[70] mix-blend-difference hidden md:block"
        style={{
          x: mouseX,
          y: mouseY,
          backgroundColor: SCROLL_CONFIG.accentColor,
          opacity: 0.3,
          scale: cursorScale,
        }}
      />

      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-forest-dark">
        
        {/* STEP 7 - AMBIENT GLOW */}
        <motion.div 
          className="absolute w-[80vw] h-[80vh] rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundColor: SCROLL_CONFIG.accentColor, x: glowX1, y: glowY1 }}
        />
        <motion.div 
          className="absolute w-[80vw] h-[80vh] rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundColor: "#2D6A4F", x: glowX2, y: glowY2, right: 0, bottom: 0 }}
        />

        {/* STEP 4 - CANVAS */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

        {/* STEP 7 - ENVIRONMENTAL AESTHETICS */}
        {/* Grain */}
        <svg className="fixed inset-0 w-full h-full z-50 pointer-events-none opacity-5">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Radial Vignette */}
        <div 
          className="fixed inset-0 z-49 pointer-events-none" 
          style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)" }}
        />

        {/* STEP 9 - SCROLLYTELLING MILESTONES */}
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end pb-[10vh] pl-[10vw]">
          {milestones.map((m, i) => (
            <Milestone key={i} m={m} scrollYProgress={scrollYProgress} />
          ))}
        </div>

        {/* STEP 8 - CINEMATIC LOADER UI */}
        {!shutterOpen && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: loadingComplete ? 0 : 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute inset-0 z-[100] bg-forest-dark flex flex-col items-center justify-center font-sans tracking-wide"
            onAnimationComplete={() => { if (loadingComplete) setShutterOpen(true); }}
          >
            <div className="text-gold text-2xl font-bold mb-4">AGROSEVA PORTAL</div>
            <div className="w-64 h-1 bg-white/10 rounded overflow-hidden">
              <motion.div 
                className="h-full bg-gold"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="text-white/50 text-sm mt-2">{loadingProgress}%</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
