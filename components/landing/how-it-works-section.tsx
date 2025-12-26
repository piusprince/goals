"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Create Your Goals",
    description:
      "Set up your goals in seconds. Choose between habits, milestones, or aspirations with customizable tracking.",
  },
  {
    number: "02",
    title: "Track Daily Progress",
    description:
      "Check in daily to mark completion. Build streaks and visualize your consistency over time.",
  },
  {
    number: "03",
    title: "Celebrate Success",
    description:
      "Unlock badges, share wins with friends, and watch your progress compound into lasting change.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-b bg-muted/20 py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Simple, Yet <span className="text-primary">Powerful</span>
            </h2>
            <p className="text-lg text-muted-foreground md:text-xl">
              Get started in minutes. No complicated setup, just pure focus on
              your goals.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {step.number}
                </div>
              </div>

              {/* Connecting line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-1 w-full -translate-x-1/2 translate-y-0 md:block">
                  <div className="h-full w-full border-t-2 border-dashed border-primary/30" />
                </div>
              )}

              <h3 className="mb-2 text-center text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-center text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
