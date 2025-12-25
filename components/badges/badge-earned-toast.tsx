"use client";

import {
  useEffect,
  useState,
  useMemo,
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface BadgeEarnedToastProps {
  readonly badges: Badge[];
  readonly onDismiss?: () => void;
  readonly duration?: number;
}

// Pre-calculate particle positions to avoid Math.random during render
function generateParticleData() {
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

  return particles.map((particle, i) => {
    const angle = (i / particles.length) * 360;
    const radians = (angle * Math.PI) / 180;
    const distance = 80 + Math.random() * 70;
    const x = Math.cos(radians) * distance;
    const y = Math.sin(radians) * distance - 40;
    const rotate = Math.random() * 360;
    return { ...particle, x, y, rotate, id: `particle-${i}` };
  });
}

function generateBurstData() {
  return Array.from({ length: 6 }, (_, i) => {
    let colorClass: string;
    if (i % 3 === 0) {
      colorClass = "bg-yellow-400";
    } else if (i % 3 === 1) {
      colorClass = "bg-orange-400";
    } else {
      colorClass = "bg-amber-300";
    }

    return {
      id: `burst-${i}`,
      x: (Math.random() - 0.5) * 200,
      y: -50 - Math.random() * 100,
      delay: 0.1 + i * 0.1,
      colorClass,
    };
  });
}

type ParticleData = ReturnType<typeof generateParticleData>;
type BurstData = ReturnType<typeof generateBurstData>;

export function BadgeEarnedToast({
  badges,
  onDismiss,
  duration = 5000,
}: BadgeEarnedToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  // Generate particle data once when badges change
  const particleData = useMemo(
    () => (badges.length > 0 ? generateParticleData() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [badges.length, currentBadgeIndex]
  );
  const burstData = useMemo(
    () => (badges.length > 0 ? generateBurstData() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [badges.length, currentBadgeIndex]
  );

  useEffect(() => {
    if (badges.length === 0) {
      return;
    }

    setIsVisible(true);
    setCurrentBadgeIndex(0);
  }, [badges]);

  useEffect(() => {
    if (!isVisible || badges.length === 0) return;

    const timer = setTimeout(() => {
      if (currentBadgeIndex < badges.length - 1) {
        setCurrentBadgeIndex((prev) => prev + 1);
      } else {
        setIsVisible(false);
        onDismiss?.();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, currentBadgeIndex, badges.length, duration, onDismiss]);

  const handleDismiss = useCallback(() => {
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex((prev) => prev + 1);
    } else {
      setIsVisible(false);
      onDismiss?.();
    }
  }, [currentBadgeIndex, badges.length, onDismiss]);

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
            {/* Confetti particles */}
            <Sparkles particleData={particleData} burstData={burstData} />

            {/* Toast content */}
            <div className="relative bg-linear-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl min-w-70">
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
                onClick={handleDismiss}
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
interface SparklesProps {
  readonly particleData: ParticleData;
  readonly burstData: BurstData;
}

function Sparkles({ particleData, burstData }: SparklesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particleData.map((particle) => (
        <motion.div
          key={particle.id}
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
            x: particle.x,
            y: particle.y,
            rotate: particle.rotate,
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
      ))}
      {/* Extra burst particles */}
      {burstData.map((burst) => (
        <motion.div
          key={burst.id}
          initial={{
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: burst.x,
            y: burst.y,
          }}
          transition={{
            duration: 0.8,
            delay: burst.delay,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-1/2"
        >
          <div className={cn("w-2 h-2 rounded-full", burst.colorClass)} />
        </motion.div>
      ))}
    </div>
  );
}

// Provider to use badge toasts globally
interface BadgeToastContextType {
  showBadgeToast: (badges: Badge[]) => void;
}

const BadgeToastContext = createContext<BadgeToastContextType | null>(null);

interface BadgeToastProviderProps {
  readonly children: ReactNode;
}

export function BadgeToastProvider({ children }: BadgeToastProviderProps) {
  const [toastBadges, setToastBadges] = useState<Badge[]>([]);

  const showBadgeToast = useCallback((badges: Badge[]) => {
    setToastBadges(badges);
  }, []);

  const handleDismiss = useCallback(() => {
    setToastBadges([]);
  }, []);

  const contextValue = useMemo(() => ({ showBadgeToast }), [showBadgeToast]);

  return (
    <BadgeToastContext.Provider value={contextValue}>
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
