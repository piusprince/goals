"use client";

import { motion } from "motion/react";
import { QuoteUpIcon } from "@hugeicons/react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fitness Enthusiast",
    content:
      "Goals completely transformed how I approach my fitness journey. The streak system keeps me motivated every single day!",
    avatar: "SC",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Entrepreneur",
    content:
      "As a busy founder, I needed something simple yet powerful. Goals helps me stay on track with both personal and business objectives.",
    avatar: "MJ",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Teacher",
    content:
      "I love the shared goals feature! My students and I track learning goals together. It's been amazing for accountability.",
    avatar: "ER",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Software Developer",
    content:
      "The analytics and insights are incredible. Being able to see my progress patterns helps me optimize my habits continuously.",
    avatar: "DK",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Content Creator",
    content:
      "Finally, a goal tracker that doesn't feel like work! The interface is beautiful and the badges make every milestone feel special.",
    avatar: "AP",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Student",
    content:
      "Using Goals for my study habits has improved my grades significantly. The daily check-ins keep me consistent with my learning.",
    avatar: "JW",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-orange-50/30 to-background dark:from-orange-950/20 dark:to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our community has to say about their journey with Goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-orange-500/20 group-hover:text-orange-500/30 transition-colors">
                <QuoteUpIcon className="w-8 h-8" />
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-orange-500">
                    ⭐
                  </span>
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity -z-10" />
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">50K+</div>
              <div className="text-sm text-muted-foreground">
                Goals Completed
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">4.9/5</div>
              <div className="text-sm text-muted-foreground">
                Average Rating
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
