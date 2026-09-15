import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { sound } from '../services/audio';
import { api } from '../services/api';
import { Play, FastForward } from 'lucide-react';
import AppLogo from './AppLogo';

// Interactive Fluid Mouse Letter Component
function InteractiveLetter({ letter, mouseX, mouseY, containerRect, index, total }) {
  const letterRef = useRef(null);
  
  // Spring animation values
  const x = useSpring(0, { stiffness: 350, damping: 25, mass: 0.5 });
  const y = useSpring(0, { stiffness: 350, damping: 25, mass: 0.5 });
  const scale = useSpring(1, { stiffness: 350, damping: 25, mass: 0.5 });
  const rotate = useSpring(0, { stiffness: 300, damping: 20 });
  const glow = useSpring(0.7, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const handleUpdate = () => {
      if (!letterRef.current || !containerRect) return;
      const rect = letterRef.current.getBoundingClientRect();
      const letterCenterX = rect.left + rect.width / 2;
      const letterCenterY = rect.top + rect.height / 2;

      const currentMouseX = mouseX.get();
      const currentMouseY = mouseY.get();

      if (currentMouseX === null || currentMouseY === null) {
        x.set(0);
        y.set(0);
        scale.set(1);
        rotate.set(0);
        glow.set(0.7);
        return;
      }

      const dx = currentMouseX - letterCenterX;
      const dy = currentMouseY - letterCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 160;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist);
        // Fluid repulsion and float in circular angle
        const angle = Math.atan2(dy, dx);
        const repelX = -Math.cos(angle) * force * 24;
        const repelY = -Math.sin(angle) * force * 28;
        const rotAngle = (dx / maxDist) * 22;

        x.set(repelX);
        y.set(repelY);
        scale.set(1 + force * 0.35);
        rotate.set(rotAngle);
        glow.set(0.7 + force * 0.6);
      } else {
        x.set(0);
        y.set(0);
        scale.set(1);
        rotate.set(0);
        glow.set(0.7);
      }
    };

    const unsubscribeX = mouseX.on("change", handleUpdate);
    const unsubscribeY = mouseY.on("change", handleUpdate);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, containerRect]);

  return (
    <motion.span
      ref={letterRef}
      style={{ x, y, scale, rotate }}
      className="text-5xl sm:text-7xl font-bold tracking-widest text-white inline-block select-none cursor-pointer will-change-transform"
      animate={{
        textShadow: [
          '0 0 15px rgba(255,255,255,0.6)',
          '0 0 30px rgba(255,255,255,0.9)',
          '0 0 15px rgba(255,255,255,0.6)'
        ]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {letter}
    </motion.span>
  );
}

export default function IntroScreen({ onComplete }) {
  const [stage, setStage] = useState('prompt'); // 'prompt' | 'playing' | 'fading'
  const [canSkip, setCanSkip] = useState(false);
  const [introType, setIntroType] = useState('video'); // 'video' | 'canvas'
  const [videoSrc, setVideoSrc] = useState('/into.mp4');
  const [videoError, setVideoError] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  // Mouse tracking for fluid interactive SPACE title
  const mouseX = useMotionValue(null);
  const mouseY = useMotionValue(null);

  // Read intro preference and server active intro
  useEffect(() => {
    const savedIntro = localStorage.getItem('space_intro_preference') || 'video';
    setIntroType(savedIntro);

    api.getSystemConfig()
      .then(cfg => {
        if (cfg && cfg.active_intro) {
          setVideoSrc(cfg.active_intro);
        }
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (!containerRect && containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(null);
    mouseY.set(null);
  };

  const startIntro = () => {
    sound.init();
    setStage('playing');

    // Show Skip button after exactly 2 seconds in both modes
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 2000);

    if (introType === 'canvas' || videoError) {
      sound.playIntroCinematic();
      const endTimer = setTimeout(() => {
        finishIntro();
      }, 6000);

      return () => {
        clearTimeout(skipTimer);
        clearTimeout(endTimer);
      };
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          setVideoError(true);
          sound.playIntroCinematic();
        });
      }
    }

    return () => {
      clearTimeout(skipTimer);
    };
  };

  const finishIntro = () => {
    setStage('fading');
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  // Starfield procedural canvas fallback
  useEffect(() => {
    if (stage !== 'playing' || (introType === 'video' && !videoError)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const numStars = 400;
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      size: Math.random() * 1.5 + 0.5,
    }));

    let speed = 2;
    let startTime = Date.now();

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      speed = Math.min(35, 2 + Math.pow(elapsed, 2.2) * 4);

      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const prevK = 250 / (star.z + speed * 1.5);
          const prevPx = star.x * prevK + cx;
          const prevPy = star.y * prevK + cy;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, (1 - star.z / width) * 0.9)})`;
          ctx.lineWidth = star.size * Math.max(0.6, 1 - star.z / width);
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [stage, introType, videoError]);

  const letters = ['S', 'P', 'A', 'C', 'E'];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 z-50 bg-[#050507] flex items-center justify-center overflow-hidden select-none"
    >
      {/* 4K Ultra-Crisp Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        preload="auto"
        onEnded={finishIntro}
        onError={() => setVideoError(true)}
        className={`absolute inset-0 w-full h-full object-cover z-0 will-change-transform transition-opacity duration-700 ${
          stage === 'playing' && introType === 'video' && !videoError ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Canvas for procedural warp intro */}
      {stage === 'playing' && (introType === 'canvas' || videoError) && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      )}

      {/* Ambient background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

      {/* Stage: Prompt */}
      {stage === 'prompt' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center px-6 z-10"
        >
          {/* App Logo from icon.png */}
          <div className="mb-6 flex items-center justify-center">
            <AppLogo className="w-16 h-16 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
          </div>

          {/* Ultra-Smooth Magnetic Interactive SPACE Letters */}
          <div
            ref={containerRef}
            className="flex items-center justify-center gap-3 sm:gap-4 py-4 select-none"
          >
            {letters.map((char, index) => (
              <InteractiveLetter
                key={index}
                letter={char}
                index={index}
                total={letters.length}
                mouseX={mouseX}
                mouseY={mouseY}
                containerRect={containerRect}
              />
            ))}
          </div>

          <p className="text-xs text-zinc-400 mb-9 tracking-[0.3em] uppercase mt-2 font-mono">
            SECURE ENVIRONMENT PLATFORM
          </p>

          {/* Glowing Luminous Enter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={startIntro}
            className="group relative px-10 py-4 bg-white text-zinc-950 font-bold text-xs tracking-[0.25em] uppercase rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:shadow-[0_0_50px_rgba(255,255,255,0.95)] hover:bg-zinc-50 active:scale-95"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>Enter</span>
          </motion.button>

          <div className="mt-14 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
            INITIALIZING SPACE OS KERNEL • {introType.toUpperCase()} READY
          </div>
        </motion.div>
      )}

      {/* Stage: Playing */}
      {stage === 'playing' && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none">
          {(introType === 'canvas' || videoError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center select-none"
            >
              <motion.h1
                initial={{ letterSpacing: "0.3em" }}
                animate={{ letterSpacing: "0.55em" }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="text-4xl sm:text-6xl font-light text-white tracking-widest pl-2 mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                SPACE
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-xs text-zinc-400 font-mono tracking-widest uppercase"
              >
                Establishing Secure Tunnel...
              </motion.p>
            </motion.div>
          )}

          {/* Skip Button (2 seconds countdown) */}
          <AnimatePresence>
            {canSkip && (
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                onClick={finishIntro}
                className="pointer-events-auto absolute bottom-10 right-10 px-6 py-3 rounded-2xl border border-white/20 bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2.5 backdrop-blur-xl shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-200"
              >
                <span>Skip</span>
                <FastForward className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer copyright */}
      <div className="absolute bottom-4 text-center w-full pointer-events-none text-[11px] text-zinc-600 font-sans tracking-wide">
        copyright by 505 Studio's
      </div>
    </div>
  );
}
