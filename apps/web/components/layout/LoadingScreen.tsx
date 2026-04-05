"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("agentnet_loaded")) {
      setVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem("agentnet_loaded", "1");
          }, 400);
          return 100;
        }
        return p + Math.random() * 18 + 4;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
        >
          {/* Grid background */}
          <div className="absolute inset-0 bg-architect-grid opacity-30 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <span className="font-logo text-7xl md:text-8xl tracking-tighter text-black leading-none">
                agentnet
              </span>
              <span className="font-mono text-[9px] opacity-20 uppercase tracking-[0.5em] mt-1">
                Reality // Design
              </span>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-3 w-48"
            >
              <div className="w-full h-[1px] bg-black/10 overflow-hidden">
                <motion.div
                  className="h-full bg-black"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="flex justify-between w-full font-mono text-[9px] opacity-30 uppercase tracking-widest">
                <span>Initializing</span>
                <span>{Math.min(Math.round(progress), 100)}%</span>
              </div>
            </motion.div>

            {/* Cycling status messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-[8px] opacity-20 uppercase tracking-[0.3em]"
            >
              {progress < 30
                ? "[ LOADING_AGENT_REGISTRY ]"
                : progress < 60
                ? "[ SYNCING_KNOWLEDGE_BASE ]"
                : progress < 85
                ? "[ ESTABLISHING_X402_LAYER ]"
                : "[ ALL_SYSTEMS_OPERATIONAL ]"}
            </motion.div>
          </div>

          {/* Corner tags */}
          <div className="absolute bottom-8 left-8 font-mono text-[8px] opacity-15 uppercase tracking-widest">
            // PROTOCOL_SYS_V2
          </div>
          <div className="absolute bottom-8 right-8 font-mono text-[8px] opacity-15 uppercase tracking-widest">
            0x4A_73_96_C7
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
