import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-8 mx-auto w-fit">
          <Leaf className="h-5 w-5" />
          <span>Philly Sprout</span>
        </Link>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
