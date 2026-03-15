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
    <div className="flex items-center gap-2">
      {/* Email hidden on very small screens to save space */}
      <span className="text-white/70 text-xs hidden sm:inline truncate max-w-[140px]">
        {user.email as string}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/10 hover:text-white px-3"
      >
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="bg-green-500 hover:bg-green-400 text-white font-semibold px-3"
      >
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-white/10 bg-black/20 backdrop-blur-md safe-area-inset-top">
      <div className="w-full max-w-6xl flex justify-between items-center px-4 sm:px-5 py-3 min-h-[56px]">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base sm:text-lg text-white hover:text-green-300 transition-colors"
        >
          <Leaf className="h-5 w-5 text-green-400 flex-shrink-0" />
          <span>Philly Sprout</span>
        </Link>

        {/* Right side — theme switcher hidden on xs to save space */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          <Suspense>
            <NavAuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
