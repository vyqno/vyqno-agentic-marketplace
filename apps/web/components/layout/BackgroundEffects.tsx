"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function BackgroundEffects() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-white">
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Auras */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-accent/20"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] bg-primary/5"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "20%",
          translateY: "-30%",
        }}
      />

      {/* Top Left Gradient */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[150px] bg-accent/10" />
      
      {/* Bottom Right Gradient */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[150px] bg-primary/5" />
    </div>
  );
}
