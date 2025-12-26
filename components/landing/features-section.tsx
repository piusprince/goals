"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target01Icon,
  FireIcon,
  UserMultiple02Icon,
  ChartLineData01Icon,
  Award02Icon,
  SmartPhone02Icon,
} from "@hugeicons/core-free-icons";

const features = [
  {
    icon: Target01Icon,
    title: "Multiple Goal Types",
    description:
      "Track habits, one-time milestones, or long-term aspirations. Customize your goals to fit your lifestyle.",
  },
  {
    icon: FireIcon,
    title: "Streak Tracking",
    description:
      "Build momentum with visual streak counters. Never break the chain and watch your consistency grow.",
  },
  {
    icon: UserMultiple02Icon,
    title: "Shared Accountability",
    description:
      "Invite friends and family to join your goals. Stay motivated together with shared progress tracking.",
  },
  {
    icon: ChartLineData01Icon,
    title: "Progress Insights",
    description:
      "Visualize your journey with detailed analytics. See patterns, celebrate wins, and stay on track.",
  },
  {
    icon: Award02Icon,
    title: "Gamified Experience",
    description:
      "Earn badges for milestones. Unlock achievements and make progress fun with gamification.",
  },
  {
    icon: SmartPhone02Icon,
    title: "Works Offline",
    description:
      "Progressive Web App that works anywhere. Track goals even without internet, sync when connected.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything You Need to{" "}
              <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground md:text-xl">
              Powerful features designed to help you build lasting habits and
              achieve your goals.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <HugeiconsIcon icon={feature.icon} className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
