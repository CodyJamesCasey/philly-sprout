"use client";

import { forwardRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureViewProps {
  onCapture: () => void;
  onCancel: () => void;
}

export const CameraCaptureView = forwardRef<HTMLVideoElement, CameraCaptureViewProps>(
  function CameraCaptureView({ onCapture, onCancel }, ref) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-black">
          <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={onCapture}
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </div>
    );
  }
);
