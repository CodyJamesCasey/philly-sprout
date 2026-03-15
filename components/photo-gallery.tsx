"use client";

import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PhotoEntry = { preview: string; url: string | null };

/** Enlarged view of a single photo with close button */
export function PhotoExpandedView({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className="w-full max-h-80 object-contain rounded-lg border border-border bg-muted"
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={onClose}
        aria-label="Close enlarged view"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

/** Row of small photo thumbnails with remove buttons */
export function PhotoThumbnailRow({
  photos,
  onSelect,
  onRemove,
  disabled,
}: {
  photos: PhotoEntry[];
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {photos.map((photo, index) => (
        <div key={photo.preview} className="relative group shrink-0">
          <button
            type="button"
            onClick={() => onSelect(index)}
            className="block w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <img
              src={photo.preview}
              alt={`Site photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-90 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            disabled={disabled}
            aria-label={`Remove photo ${index + 1}`}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

/** Gallery that shows either expanded view or thumbnail row */
export function PhotoGallery({
  photos,
  expandedIndex,
  onExpand,
  onClose,
  onRemove,
  uploading,
}: {
  photos: PhotoEntry[];
  expandedIndex: number | null;
  onExpand: (index: number) => void;
  onClose: () => void;
  onRemove: (index: number) => void;
  uploading?: boolean;
}) {
  if (expandedIndex !== null && photos[expandedIndex]) {
    return (
      <PhotoExpandedView
        src={photos[expandedIndex].preview}
        alt={`Site photo ${expandedIndex + 1}`}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="space-y-3">
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading…</span>
        </div>
      )}
      <PhotoThumbnailRow
        photos={photos}
        onSelect={onExpand}
        onRemove={onRemove}
        disabled={uploading}
      />
    </div>
  );
}
