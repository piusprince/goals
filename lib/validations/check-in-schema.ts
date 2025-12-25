import { z } from "zod";

/**
 * Check-in form validation schema
 * Used for creating check-ins on goals
 */
export const checkInFormSchema = z.object({
  value: z
    .number({
      message: "Value must be a number",
    })
    .int("Value must be a whole number")
    .positive("Value must be a positive number")
    .max(10000, "Value cannot exceed 10,000")
    .default(1),

  note: z
    .string()
    .max(500, "Note must be 500 characters or less")
    .trim()
    .optional()
    .nullable(),
});

export type CheckInFormData = z.infer<typeof checkInFormSchema>;

/**
 * Quick check-in schema (for habits - no form data, just value = 1)
 */
export const quickCheckInSchema = z.object({
  goalId: z.string().uuid("Invalid goal ID"),
});

export type QuickCheckInData = z.infer<typeof quickCheckInSchema>;
