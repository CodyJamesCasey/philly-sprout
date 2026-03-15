"use client";

import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraPermissionPromptProps {
  onAllow: () => void;
  onCancel: () => void;
  isRequesting?: boolean;
  title?: string;
  description?: string;
}

export function CameraPermissionPrompt({
  onAllow,
  onCancel,
  isRequesting = false,
  title = "Allow camera access",
  description = "This site needs camera permission to take a photo of the tree pit.",
}: CameraPermissionPromptProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
        <Camera className="w-6 h-6" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2 w-full">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isRequesting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onAllow}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opening…
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Allow & open camera
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
