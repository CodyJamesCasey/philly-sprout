import Link from "next/link";
import { Suspense } from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { Leaf } from "lucide-react";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

async function NavAuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-white/70 hidden sm:inline">{user.email as string}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/10 hover:text-white"
      >
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="bg-green-500 hover:bg-green-400 text-white font-semibold"
      >
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="w-full max-w-6xl flex justify-between items-center px-5 py-3">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-white hover:text-green-300 transition-colors"
        >
          <Leaf className="h-5 w-5 text-green-400" />
          <span>Philly Sprout</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Suspense>
            <NavAuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
