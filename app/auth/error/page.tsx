import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import Link from "next/link";
import { Leaf, AlertTriangle } from "lucide-react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Error code: <span className="font-mono text-destructive">{params.error}</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred. Please try again.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mx-auto">
            <Leaf className="h-5 w-5" />
            <span>Philly Sprout</span>
          </Link>
          <Card className="border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
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
