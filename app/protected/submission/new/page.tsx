import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionForm } from "./submission-form";

export default function NewSubmissionPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/protected">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            New Submission
          </h1>
          <p className="text-sm text-muted-foreground">
            Photograph and evaluate a potential street tree planting site.
          </p>
        </div>
      </div>

      <SubmissionForm />
    </div>
  );
}
