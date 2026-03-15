"use client";

import { useCallback, useRef } from "react";
import { Camera, ImagePlus, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmission } from "@/lib/submission-context";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_PHOTOS = 8;

export function PhotoUploadManager() {
  const { state, addPhotos, deletePhoto, runAnalysis } = useSubmission();
  const { photos, analysis } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const valid = Array.from(files)
        .filter((f) => ACCEPTED.includes(f.type))
        .slice(0, MAX_PHOTOS - photos.length);
      if (valid.length > 0) addPhotos(valid);
    },
    [addPhotos, photos.length]
  );

  // Drag-and-drop
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const isAnalyzing = analysis.status === "loading";
  const canAnalyze = photos.length > 0 && !isAnalyzing;
  const hasAnalyzed = analysis.status === "done";

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone — hidden when at max */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="relative border-2 border-dashed border-border rounded-2xl p-6 text-center transition-colors hover:border-primary/50 bg-card"
        >
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ImagePlus className="w-8 h-8 text-primary/50" />
            <p className="text-sm font-medium">
              Drag photos here or choose an option below
            </p>
            <p className="text-xs">
              JPEG, PNG, WEBP, HEIC · up to {MAX_PHOTOS} photos
            </p>
          </div>

          <div className="flex gap-3 justify-center mt-4">
            {/* File picker */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4" />
              Choose Photos
            </Button>

            {/* Camera capture (mobile) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Thumbnail grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt="Site photo"
                className="w-full h-full object-cover rounded-xl border border-border"
              />
              {/* Delete button */}
              <button
                type="button"
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add more tile */}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Analyze button */}
      {photos.length > 0 && (
        <Button
          type="button"
          onClick={runAnalysis}
          disabled={!canAnalyze}
          className="w-full gap-2 min-h-[48px] text-base font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing {photos.length} photo{photos.length !== 1 ? "s" : ""}…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {hasAnalyzed
                ? `Re-analyze (${photos.length} photo${photos.length !== 1 ? "s" : ""})`
                : `Analyze ${photos.length} photo${photos.length !== 1 ? "s" : ""} with AI`}
            </>
          )}
        </Button>
      )}

      {/* Analysis error */}
      {analysis.status === "error" && analysis.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          Analysis failed: {analysis.error}
        </p>
      )}
    </div>
  );
}
