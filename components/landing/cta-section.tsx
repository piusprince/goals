"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 md:p-16">
          <motion.div
            className="relative z-10 mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Start Your Journey Today
            </h2>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Join thousands building better habits. Free forever, no credit
              card required.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="group w-full sm:w-auto" asChild>
                <Link href="/login">
                  Get Started Free
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              🔒 Your data is private and secure. Learn more about our{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                privacy policy
              </Link>
              .
            </p>
          </motion.div>

          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
