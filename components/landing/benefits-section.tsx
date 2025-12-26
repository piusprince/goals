"use client";

import { motion } from "motion/react";
import {
  TrendUpIcon,
  UserGroupIcon,
  SparklesIcon,
  TimeScheduleIcon,
  ChartIcon,
  MedalIcon,
} from "@hugeicons/react";

const benefits = [
  {
    icon: TrendUpIcon,
    title: "Consistent Progress",
    description:
      "Build lasting habits through daily check-ins and streak tracking. Small steps lead to big achievements.",
  },
  {
    icon: UserGroupIcon,
    title: "Community Support",
    description:
      "Share goals with friends and family. Stay motivated together and celebrate each other's wins.",
  },
  {
    icon: SparklesIcon,
    title: "Personalized Insights",
    description:
      "Get smart analytics and recommendations based on your progress patterns and habits.",
  },
  {
    icon: TimeScheduleIcon,
    title: "Flexible Scheduling",
    description:
      "Choose daily, weekly, or monthly goals. Set your own pace and adjust as you grow.",
  },
  {
    icon: ChartIcon,
    title: "Visual Analytics",
    description:
      "See your progress at a glance with beautiful charts and comprehensive dashboards.",
  },
  {
    icon: MedalIcon,
    title: "Earn Achievements",
    description:
      "Unlock badges and milestones as you hit your targets. Celebrate every victory, big or small.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-orange-50/30 dark:to-orange-950/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              Goals
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to turn your aspirations into achievements
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
            <SparklesIcon className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Join thousands of users already achieving their goals
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
