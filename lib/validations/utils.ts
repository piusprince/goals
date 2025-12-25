import type { z } from "zod";

/**
 * Converts Zod v4 issues to a field errors object
 * This replaces the deprecated .flatten() method
 */
export function getFieldErrors<T>(
  error: z.ZodError<T>
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path) {
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }
  }

  return fieldErrors;
}
