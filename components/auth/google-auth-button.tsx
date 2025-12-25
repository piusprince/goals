"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";

interface GoogleAuthButtonProps {
  className?: string;
}

export function GoogleAuthButton({
  className,
}: Readonly<GoogleAuthButtonProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error.message);
        alert("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={className}
      size="lg"
      variant="outline"
    >
      {/* <GoogleLogo01Icon className="mr-2 h-5 w-5" /> */}
      <HugeiconsIcon icon={GoogleIcon} className="mr-2 h-5 w-5" />
      {isLoading ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}
