"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-base h-12"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Save New Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
