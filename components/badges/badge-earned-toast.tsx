"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface BadgeEarnedToastProps {
  badges: Badge[];
  onDismiss?: () => void;
  duration?: number;
}

export function BadgeEarnedToast({
  badges,
  onDismiss,
  duration = 5000,
}: BadgeEarnedToastProps) {
  const [isVisible, setIsVisible] = useState(badges.length > 0);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (badges.length === 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const timer = setTimeout(() => {
      if (currentBadgeIndex < badges.length - 1) {
        setCurrentBadgeIndex((prev) => prev + 1);
      } else {
        setIsVisible(false);
        onDismiss?.();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [badges, currentBadgeIndex, duration, onDismiss]);

  if (badges.length === 0) return null;

  const currentBadge = badges[currentBadgeIndex];

  return (
    <AnimatePresence>
      {isVisible && currentBadge && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            {/* Sparkle particles */}
            <Sparkles />

            {/* Toast content */}
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl min-w-[17.5rem]">
              <div className="flex items-center gap-4">
                {/* Badge Icon with glow */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-lg animate-pulse" />
                  <div className="relative flex items-center justify-center w-14 h-14 bg-white/20 rounded-full text-3xl">
                    {currentBadge.icon}
                  </div>
                </motion.div>

                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs uppercase tracking-wider text-amber-100"
                  >
                    🎉 Badge Earned!
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="font-bold text-lg"
                  >
                    {currentBadge.name}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-amber-100"
                  >
                    {currentBadge.description}
                  </motion.div>
                </div>
              </div>

              {/* Badge counter for multiple badges */}
              {badges.length > 1 && (
                <div className="absolute top-2 right-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {currentBadgeIndex + 1} / {badges.length}
                </div>
              )}

              {/* Click to dismiss */}
              <button
                onClick={() => {
                  if (currentBadgeIndex < badges.length - 1) {
                    setCurrentBadgeIndex((prev) => prev + 1);
                  } else {
                    setIsVisible(false);
                    onDismiss?.();
                  }
                }}
                className="absolute inset-0 w-full h-full"
                aria-label="Dismiss"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Sparkle animation component with confetti effect
function Sparkles() {
  const particles = [
    { emoji: "✨", delay: 0 },
    { emoji: "🎉", delay: 0.05 },
    { emoji: "⭐", delay: 0.1 },
    { emoji: "🌟", delay: 0.15 },
    { emoji: "✨", delay: 0.2 },
    { emoji: "🎊", delay: 0.25 },
    { emoji: "⭐", delay: 0.3 },
    { emoji: "✨", delay: 0.35 },
    { emoji: "🌟", delay: 0.4 },
    { emoji: "🎉", delay: 0.45 },
    { emoji: "⭐", delay: 0.5 },
    { emoji: "✨", delay: 0.55 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((particle, i) => {
        // Randomize direction for each particle
        const angle = (i / particles.length) * 360;
        const radians = (angle * Math.PI) / 180;
        const distance = 80 + Math.random() * 70;
        const x = Math.cos(radians) * distance;
        const y = Math.sin(radians) * distance - 40; // Bias upward

        return (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              scale: 0,
              x: 0,
              y: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.8],
              x: x,
              y: y,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 1.2,
              delay: particle.delay,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-1/2 text-2xl"
          >
            {particle.emoji}
          </motion.div>
        );
      })}
      {/* Extra burst particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`burst-${i}`}
          initial={{
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: (Math.random() - 0.5) * 200,
            y: -50 - Math.random() * 100,
          }}
          transition={{
            duration: 0.8,
            delay: 0.1 + i * 0.1,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-1/2"
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              i % 3 === 0
                ? "bg-yellow-400"
                : i % 3 === 1
                ? "bg-orange-400"
                : "bg-amber-300"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Provider to use badge toasts globally
import { createContext, useContext, useCallback, ReactNode } from "react";

interface BadgeToastContextType {
  showBadgeToast: (badges: Badge[]) => void;
}

const BadgeToastContext = createContext<BadgeToastContextType | null>(null);

export function BadgeToastProvider({ children }: { children: ReactNode }) {
  const [toastBadges, setToastBadges] = useState<Badge[]>([]);

  const showBadgeToast = useCallback((badges: Badge[]) => {
    setToastBadges(badges);
  }, []);

  const handleDismiss = useCallback(() => {
    setToastBadges([]);
  }, []);

  return (
    <BadgeToastContext.Provider value={{ showBadgeToast }}>
      {children}
      <BadgeEarnedToast badges={toastBadges} onDismiss={handleDismiss} />
    </BadgeToastContext.Provider>
  );
}

export function useBadgeToast() {
  const context = useContext(BadgeToastContext);
  if (!context) {
    throw new Error("useBadgeToast must be used within a BadgeToastProvider");
  }
  return context;
}
