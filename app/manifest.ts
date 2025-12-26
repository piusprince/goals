import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Goals Tracker",
    short_name: "Goals",
    description:
      "Track your personal goals, build streaks, and achieve more with shared accountability.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#2A1F17",
    theme_color: "#C97A3D",
    orientation: "portrait",
    categories: ["productivity", "lifestyle", "health"],
    icons: [
      {
        src: "/icons/maskable_icon_x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable_icon_x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable_icon_x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable_icon_x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Dashboard showing your goals and progress",
      },
      {
        src: "/screenshots/goals.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Goals list with streak tracking",
      },
    ],
    shortcuts: [
      {
        name: "Add Goal",
        short_name: "Add",
        description: "Create a new goal",
        url: "/goals/new",
        icons: [{ src: "/icons/add-goal.png", sizes: "96x96" }],
      },
      {
        name: "Dashboard",
        short_name: "Home",
        description: "View your dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/dashboard.png", sizes: "96x96" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
