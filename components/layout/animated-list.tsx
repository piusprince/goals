"use client";

import { motion, type Variants } from "motion/react";

interface AnimatedListProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function AnimatedList({
  children,
  className,
  delay = 0,
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
