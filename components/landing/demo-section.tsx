"use client";

import { motion } from "motion/react";
import {
  Target01Icon,
  ChartHistogramIcon,
  UserGroupIcon,
  MedalIcon,
} from "@hugeicons/react";

const features = [
  {
    icon: Target01Icon,
    title: "Goal Dashboard",
    description: "Track all your goals in one beautiful, intuitive interface",
  },
  {
    icon: ChartHistogramIcon,
    title: "Progress Analytics",
    description: "Visualize your journey with detailed charts and insights",
  },
  {
    icon: UserGroupIcon,
    title: "Shared Goals",
    description: "Collaborate with others and stay accountable together",
  },
  {
    icon: MedalIcon,
    title: "Achievement Badges",
    description: "Earn rewards and celebrate your milestones",
  },
];

export function DemoSection() {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See It In{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              Action
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of habit tracking with our intuitive interface
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-800 shadow-2xl">
              {/* Browser Chrome */}
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white dark:bg-gray-700 px-4 py-1 rounded text-xs text-muted-foreground">
                    goals.app/dashboard
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 aspect-[4/3]">
                <div className="space-y-4">
                  {/* Mock Goal Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                          <Target01Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-600 rounded" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        7
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "70%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>7 day streak</span>
                        <span>70% complete</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-6 w-8 bg-orange-100 dark:bg-orange-900/30 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl -z-10" />
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Works seamlessly across all your devices
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-sm font-medium text-orange-900 dark:text-orange-100">
                  📱 Mobile
                </div>
                <div className="px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-sm font-medium text-orange-900 dark:text-orange-100">
                  💻 Desktop
                </div>
                <div className="px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-sm font-medium text-orange-900 dark:text-orange-100">
                  🌐 Web
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
