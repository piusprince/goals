"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Target01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { LinkButton } from "../ui/link-button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Target01Icon} className="h-4 w-4" />
              <span>Track Goals. Build Streaks. Achieve More.</span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Turn Your Goals Into{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Daily Habits
            </span>
          </motion.h1>

          <motion.p
            className="mb-8 text-lg text-muted-foreground sm:text-xl md:mb-12 md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Stay motivated with streak tracking, collaborate with friends, and
            celebrate your progress with a beautiful goal tracker designed for
            lasting change.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LinkButton href="/login" size="lg" className="w-full sm:w-auto">
              Get Started Free
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </LinkButton>

            <LinkButton
              href="#features"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              See How It Works
            </LinkButton>
          </motion.div>

          <motion.div
            className="mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p>✨ Free forever · No credit card required · Works offline</p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
