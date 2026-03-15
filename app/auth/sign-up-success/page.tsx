import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Leaf, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mx-auto">
            <Leaf className="h-5 w-5" />
            <span>Philly Sprout</span>
          </Link>

          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
                <MailCheck className="w-7 h-7" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                One more step to start planting
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a confirmation link to your email address.
                Click it to activate your Philly Sprout account and start
                submitting tree planting sites.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
