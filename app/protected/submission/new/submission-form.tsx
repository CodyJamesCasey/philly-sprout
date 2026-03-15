"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, MapPin, Loader2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSubmission, type SubmissionState } from "./actions";

const CRITERIA_FIELDS = [
  { name: "pit_size", label: "Pit Size", description: "Tree pit is at least 3' × 3'" },
  { name: "pit_edge_clearance", label: "Pit Edge Clearance", description: "Pit edge is ≥ 2' from curb face" },
  { name: "no_obstructions", label: "No Obstructions", description: "No utilities, grates, or vaults in the pit" },
  { name: "driveway_clearance", label: "Driveway Clearance", description: "Pit is ≥ 3' from any driveway" },
  { name: "not_for_sale", label: "Not For Sale", description: "Property is not listed for sale or demolition" },
  { name: "corner_clearance", label: "Corner Clearance", description: "Pit is ≥ 25' from intersection" },
  { name: "pole_hydrant_clearance", label: "Pole / Hydrant Clearance", description: "≥ 10' from fire hydrant, ≥ 5' from utility pole" },
  { name: "tree_clearance", label: "Tree Clearance", description: "≥ 20' from nearest existing tree" },
] as const;

function CriteriaSelect({ name, label, description }: { name: string; label: string; description: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Select name={name}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pass">Pass</SelectItem>
          <SelectItem value="fail">Fail</SelectItem>
          <SelectItem value="unclear">Unclear</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function SubmissionForm() {
  const [state, formAction, isPending] = useActionState<SubmissionState, FormData>(
    createSubmission,
    {},
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    acquireLocation();
  }, []);

  function acquireLocation() {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }
    setLocatingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocatingGps(false);
      },
      (err) => {
        setGpsError(err.message);
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function clearPhoto() {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Hidden GPS fields */}
      <input type="hidden" name="latitude" value={location?.lat ?? ""} />
      <input type="hidden" name="longitude" value={location?.lng ?? ""} />

      {/* ── Photo Capture ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Site Photo
          </CardTitle>
          <CardDescription>
            Take a photo of the potential tree pit. AI analysis will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Site preview"
                className="w-full max-h-80 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearPhoto}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Tap to take a photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use your camera to capture the site
                </p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
        </CardContent>
      </Card>

      {/* ── Location ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            {locatingGps ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Acquiring GPS…</span>
              </>
            ) : location ? (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-foreground font-mono text-xs">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
              </>
            ) : gpsError ? (
              <div className="flex flex-col gap-2">
                <p className="text-destructive text-xs">{gpsError}</p>
                <Button type="button" variant="outline" size="sm" onClick={acquireLocation}>
                  Retry
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address (optional)</Label>
            <Input
              id="street_address"
              name="street_address"
              placeholder="e.g. 1234 Walnut St"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Site Criteria ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Criteria</CardTitle>
          <CardDescription>
            Evaluate the planting site against each criterion. These will eventually be
            pre-filled by AI from your photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CRITERIA_FIELDS.map((field) => (
              <CriteriaSelect key={field.name} {...field} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Overall Suitability ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Suitability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overall_suitability">Rating</Label>
            <Select name="overall_suitability">
              <SelectTrigger id="overall_suitability" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Likely Suitable">Likely Suitable</SelectItem>
                <SelectItem value="Possibly Suitable">Possibly Suitable</SelectItem>
                <SelectItem value="Likely Unsuitable">Likely Unsuitable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything else about this site…"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending || !location}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Site"
        )}
      </Button>
    </form>
  );
}
