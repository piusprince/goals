// Goal Templates - Predefined templates for quick goal creation

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  goalType: "binary" | "quantity" | "milestone";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  targetValue?: number;
  targetUnit?: string;
  milestones?: Array<{
    value: number;
    label: string;
  }>;
  icon: string;
  popular?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: GoalTemplate[];
}

export const GOAL_TEMPLATES: TemplateCategory[] = [
  {
    id: "health",
    name: "Health & Fitness",
    description: "Physical health and exercise goals",
    icon: "🏃",
    templates: [
      {
        id: "exercise-3x-week",
        name: "Exercise 3x per week",
        description: "Build a consistent workout routine",
        category: "health",
        goalType: "quantity",
        frequency: "weekly",
        targetValue: 3,
        targetUnit: "workouts",
        icon: "💪",
        popular: true,
      },
      {
        id: "drink-water-daily",
        name: "Drink 8 glasses of water",
        description: "Stay hydrated every day",
        category: "health",
        goalType: "quantity",
        frequency: "daily",
        targetValue: 8,
        targetUnit: "glasses",
        icon: "💧",
        popular: true,
      },
      {
        id: "walk-10000-steps",
        name: "Walk 10,000 steps daily",
        description: "Hit your daily step goal",
        category: "health",
        goalType: "quantity",
        frequency: "daily",
        targetValue: 10000,
        targetUnit: "steps",
        icon: "👟",
      },
      {
        id: "sleep-8-hours",
        name: "Sleep 8 hours",
        description: "Get quality rest every night",
        category: "health",
        goalType: "quantity",
        frequency: "daily",
        targetValue: 8,
        targetUnit: "hours",
        icon: "😴",
      },
      {
        id: "run-5k",
        name: "Run a 5K",
        description: "Train to complete a 5K run",
        category: "health",
        goalType: "milestone",
        frequency: "yearly",
        milestones: [
          { value: 1, label: "Run 1 km" },
          { value: 2, label: "Run 2 km" },
          { value: 3, label: "Run 3 km" },
          { value: 5, label: "Complete 5K" },
        ],
        icon: "🏃‍♂️",
      },
    ],
  },
  {
    id: "learning",
    name: "Learning & Skills",
    description: "Education and skill development",
    icon: "📚",
    templates: [
      {
        id: "read-30-mins",
        name: "Read 30 minutes daily",
        description: "Build a daily reading habit",
        category: "learning",
        goalType: "binary",
        frequency: "daily",
        icon: "📖",
        popular: true,
      },
      {
        id: "read-12-books",
        name: "Read 12 books this year",
        description: "One book per month challenge",
        category: "learning",
        goalType: "quantity",
        frequency: "yearly",
        targetValue: 12,
        targetUnit: "books",
        icon: "📚",
        popular: true,
      },
      {
        id: "learn-language",
        name: "Learn a new language",
        description: "Practice language learning daily",
        category: "learning",
        goalType: "binary",
        frequency: "daily",
        icon: "🗣️",
      },
      {
        id: "online-course",
        name: "Complete an online course",
        description: "Finish a course on Coursera, Udemy, etc.",
        category: "learning",
        goalType: "milestone",
        frequency: "yearly",
        milestones: [
          { value: 25, label: "25% complete" },
          { value: 50, label: "Halfway done" },
          { value: 75, label: "75% complete" },
          { value: 100, label: "Course completed" },
        ],
        icon: "🎓",
      },
      {
        id: "practice-skill",
        name: "Practice a skill",
        description: "Dedicate time to skill development",
        category: "learning",
        goalType: "quantity",
        frequency: "weekly",
        targetValue: 5,
        targetUnit: "hours",
        icon: "🎯",
      },
    ],
  },
  {
    id: "finance",
    name: "Finance & Savings",
    description: "Money management and savings goals",
    icon: "💰",
    templates: [
      {
        id: "save-emergency-fund",
        name: "Build emergency fund",
        description: "Save 3-6 months of expenses",
        category: "finance",
        goalType: "milestone",
        frequency: "yearly",
        milestones: [
          { value: 1000, label: "$1,000 saved" },
          { value: 3000, label: "$3,000 saved" },
          { value: 5000, label: "$5,000 saved" },
          { value: 10000, label: "$10,000 saved" },
        ],
        icon: "🏦",
        popular: true,
      },
      {
        id: "track-expenses",
        name: "Track expenses weekly",
        description: "Review and categorize spending",
        category: "finance",
        goalType: "binary",
        frequency: "weekly",
        icon: "📊",
      },
      {
        id: "no-spend-days",
        name: "10 no-spend days per month",
        description: "Practice mindful spending",
        category: "finance",
        goalType: "quantity",
        frequency: "monthly",
        targetValue: 10,
        targetUnit: "days",
        icon: "🚫💸",
      },
      {
        id: "save-percentage",
        name: "Save 20% of income",
        description: "Pay yourself first each month",
        category: "finance",
        goalType: "binary",
        frequency: "monthly",
        icon: "💵",
      },
      {
        id: "pay-off-debt",
        name: "Pay off debt",
        description: "Become debt-free",
        category: "finance",
        goalType: "milestone",
        frequency: "yearly",
        milestones: [
          { value: 25, label: "25% paid off" },
          { value: 50, label: "Halfway there" },
          { value: 75, label: "75% paid off" },
          { value: 100, label: "Debt free!" },
        ],
        icon: "🎉",
      },
    ],
  },
  {
    id: "wellness",
    name: "Wellness & Mindfulness",
    description: "Mental health and self-care",
    icon: "🧘",
    templates: [
      {
        id: "meditate-daily",
        name: "Meditate daily",
        description: "Practice mindfulness each day",
        category: "wellness",
        goalType: "binary",
        frequency: "daily",
        icon: "🧘",
        popular: true,
      },
      {
        id: "journal-daily",
        name: "Journal before bed",
        description: "Reflect on your day",
        category: "wellness",
        goalType: "binary",
        frequency: "daily",
        icon: "📝",
        popular: true,
      },
      {
        id: "gratitude-practice",
        name: "Practice gratitude",
        description: "Write 3 things you're grateful for",
        category: "wellness",
        goalType: "binary",
        frequency: "daily",
        icon: "🙏",
      },
      {
        id: "digital-detox",
        name: "Digital detox day",
        description: "One day per week without screens",
        category: "wellness",
        goalType: "binary",
        frequency: "weekly",
        icon: "📵",
      },
      {
        id: "therapy-sessions",
        name: "Attend therapy",
        description: "Regular mental health check-ins",
        category: "wellness",
        goalType: "quantity",
        frequency: "monthly",
        targetValue: 2,
        targetUnit: "sessions",
        icon: "💭",
      },
    ],
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Work and efficiency goals",
    icon: "⚡",
    templates: [
      {
        id: "inbox-zero",
        name: "Inbox zero weekly",
        description: "Clear your email inbox each week",
        category: "productivity",
        goalType: "binary",
        frequency: "weekly",
        icon: "📧",
        popular: true,
      },
      {
        id: "daily-planning",
        name: "Plan tomorrow today",
        description: "Prepare your next day each evening",
        category: "productivity",
        goalType: "binary",
        frequency: "daily",
        icon: "📋",
      },
      {
        id: "weekly-review",
        name: "Weekly review",
        description: "Reflect and plan each week",
        category: "productivity",
        goalType: "binary",
        frequency: "weekly",
        icon: "📊",
      },
      {
        id: "focus-blocks",
        name: "Deep work sessions",
        description: "Complete focused work blocks daily",
        category: "productivity",
        goalType: "quantity",
        frequency: "daily",
        targetValue: 2,
        targetUnit: "sessions",
        icon: "🎯",
      },
      {
        id: "ship-projects",
        name: "Ship side projects",
        description: "Complete and launch projects",
        category: "productivity",
        goalType: "quantity",
        frequency: "yearly",
        targetValue: 4,
        targetUnit: "projects",
        icon: "🚀",
      },
    ],
  },
  {
    id: "social",
    name: "Social & Relationships",
    description: "Connection and community goals",
    icon: "👥",
    templates: [
      {
        id: "call-family",
        name: "Call family weekly",
        description: "Stay connected with loved ones",
        category: "social",
        goalType: "binary",
        frequency: "weekly",
        icon: "📞",
      },
      {
        id: "meet-friends",
        name: "Meet friends monthly",
        description: "Regular social activities",
        category: "social",
        goalType: "quantity",
        frequency: "monthly",
        targetValue: 2,
        targetUnit: "meetups",
        icon: "🍻",
      },
      {
        id: "network-events",
        name: "Attend networking events",
        description: "Expand your professional network",
        category: "social",
        goalType: "quantity",
        frequency: "monthly",
        targetValue: 1,
        targetUnit: "events",
        icon: "🤝",
      },
      {
        id: "volunteer",
        name: "Volunteer in community",
        description: "Give back to your community",
        category: "social",
        goalType: "quantity",
        frequency: "monthly",
        targetValue: 4,
        targetUnit: "hours",
        icon: "❤️",
      },
    ],
  },
];

// Helper functions
export function getAllTemplates(): GoalTemplate[] {
  return GOAL_TEMPLATES.flatMap((category) => category.templates);
}

export function getPopularTemplates(): GoalTemplate[] {
  return getAllTemplates().filter((t) => t.popular);
}

export function getTemplateById(id: string): GoalTemplate | undefined {
  return getAllTemplates().find((t) => t.id === id);
}

export function getTemplatesByCategory(categoryId: string): GoalTemplate[] {
  const category = GOAL_TEMPLATES.find((c) => c.id === categoryId);
  return category?.templates || [];
}

export function searchTemplates(query: string): GoalTemplate[] {
  const lowerQuery = query.toLowerCase();
  return getAllTemplates().filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
  );
}
