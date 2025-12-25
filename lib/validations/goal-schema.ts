import { z } from "zod";

/**
 * Goal form validation schema
 * Used for both creating and editing goals
 */
export const goalFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or less")
      .trim(),

    description: z
      .string()
      .max(1000, "Description must be 1000 characters or less")
      .trim()
      .optional()
      .nullable(),

    type: z.enum(["one-time", "target", "habit"], {
      message: "Please select a goal type",
    }),

    category: z
      .enum(["health", "finance", "learning", "personal", "career", "other"], {
        message: "Please select a category",
      })
      .optional()
      .nullable(),

    target_value: z
      .number({
        message: "Target must be a number",
      })
      .int("Target must be a whole number")
      .positive("Target must be a positive number")
      .optional()
      .nullable(),

    year: z
      .number()
      .int()
      .min(2020, "Year must be 2020 or later")
      .max(2100, "Year must be 2100 or earlier")
      .default(new Date().getFullYear()),
  })
  .refine(
    (data) => {
      // If type is 'target', target_value must be provided
      if (data.type === "target") {
        return data.target_value !== null && data.target_value !== undefined;
      }
      return true;
    },
    {
      message: "Target value is required for target goals",
      path: ["target_value"],
    }
  );

export type GoalFormData = z.infer<typeof goalFormSchema>;

/**
 * Category options for goal categorization
 */
export const GOAL_CATEGORIES = [
  { value: "health", label: "Health & Fitness", icon: "💪" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "learning", label: "Learning", icon: "📚" },
  { value: "personal", label: "Personal", icon: "🌟" },
  { value: "career", label: "Career", icon: "💼" },
  { value: "other", label: "Other", icon: "📌" },
] as const;

/**
 * Goal type options
 */
export const GOAL_TYPES = [
  { value: "one-time", label: "One-time", description: "Complete once" },
  { value: "target", label: "Target", description: "Reach a specific number" },
  { value: "habit", label: "Habit", description: "Build a daily habit" },
] as const;
