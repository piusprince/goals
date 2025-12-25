"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().email({ message: "Please enter a valid email address" });

interface MagicLinkFormProps {
  onSuccess?: () => void;
}

export function MagicLinkForm({ onSuccess }: Readonly<MagicLinkFormProps>) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate email
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setError(emailValidation.error.issues[0].message);
      return;
    }

    try {
      setIsLoading(true);
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${globalThis.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
        <p className="text-sm text-green-800 dark:text-green-200">
          Check your email! We sent a magic link to <strong>{email}</strong>
        </p>
        <p className="mt-2 text-xs text-green-700 dark:text-green-300">
          Click the link in the email to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
