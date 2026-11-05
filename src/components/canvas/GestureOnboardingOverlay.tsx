'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GestureOnboardingOverlayProps {
  onDismiss: () => void;
}

export function GestureOnboardingOverlay({ onDismiss }: GestureOnboardingOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 5 seconds if the user doesn't interact

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for exit animation
  };

  // Auto-dismiss after 5 seconds if the user doesn't interact
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm pointer-events-auto flex flex-col justify-center items-center"
          onClick={handleDismiss} // 1-tap dismiss anywhere
        >
          <div className="relative w-full h-full max-w-[430px] flex">
            {/* Left Zone */}
            <div className="flex-1 h-full border-r border-white/10 flex items-center justify-center relative">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute text-white/80 font-medium text-sm flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/50 animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 bg-white/50 rounded-full" />
                </div>
                <span>← Tap Left</span>
                <span className="text-xs text-white/50">Previous</span>
              </motion.div>
            </div>

            {/* Center Zone (Hold to pause) */}
            <div className="w-[40%] h-full flex flex-col items-center justify-center relative">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute text-white/80 font-medium text-sm flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white/50 animate-[ping_2s_ease-in-out_infinite] flex items-center justify-center relative">
                  <div className="w-8 h-8 rounded-full bg-white/20 absolute" />
                </div>
                <span>Hold Screen</span>
                <span className="text-xs text-white/50">Pause Story</span>
              </motion.div>
            </div>

            {/* Right Zone */}
            <div className="flex-1 h-full border-l border-white/10 flex items-center justify-center relative">
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute text-white/80 font-medium text-sm flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/50 animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 bg-white/50 rounded-full" />
                </div>
                <span>Tap Right →</span>
                <span className="text-xs text-white/50">Next</span>
              </motion.div>
            </div>
          </div>

          {/* Dismiss hint */}
          <div className="absolute bottom-12 text-white/40 text-xs tracking-widest uppercase">
            Tap anywhere to start
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
