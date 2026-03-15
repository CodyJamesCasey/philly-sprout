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

type GeoPermissionState = "unknown" | "granted" | "prompt" | "denied" | "unsupported";

const CRITERIA_FIELDS = [
  { name: "pit_size", label: "Pit Size", description: "Tree pit is at least 3' × 3'" },
  { name: "pit_edge_clearance", label: "Pit Edge Clearance", description: "Pit edge is ≥ 2' from curb face" },
  { name: "no_obstructions", label: "No Obstructions", description: "No utilities, grates, or vaults in the pit" },
  { name: "driveway_clearance", label: "Driveway Clearance", description: "Pit is ≥ 3' from any driveway" },
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
  const [requestingCamera, setRequestingCamera] = useState(false);
  const [geoPermission, setGeoPermission] = useState<GeoPermissionState>("unknown");
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isiOS =
      /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    setIsIOSSafari(isiOS && isSafari);

    if (!navigator.geolocation) {
      setGeoPermission("unsupported");
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }

    if (!window.isSecureContext) {
      setGpsError("Location access requires HTTPS. Open this site over a secure connection.");
      return;
    }

    if (!navigator.permissions?.query) {
      setGeoPermission("prompt");
      return;
    }

    let isMounted = true;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (!isMounted) return;
        const state = permissionStatus.state as GeoPermissionState;
        setGeoPermission(state);

        if (state === "granted") {
          acquireLocation();
        }

        permissionStatus.onchange = () => {
          const nextState = permissionStatus.state as GeoPermissionState;
          setGeoPermission(nextState);
          if (nextState === "granted") {
            acquireLocation();
          }
        };
      })
      .catch(() => {
        if (!isMounted) return;
        // Some mobile browsers do not fully support permissions.query.
        setGeoPermission("prompt");
      });

    return () => {
      isMounted = false;
    };
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
        setGeoPermission("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoPermission("denied");
          if (isIOSSafari) {
            setGpsError(
              "Location access is off for Safari on this iPhone/iPad. Turn it on in iOS Settings, then retry.",
            );
          } else {
            setGpsError(
              "Location permission is blocked. Tap Allow in the browser prompt, or enable Location for this site in your browser settings.",
            );
          }
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError("Unable to determine your location right now. Move to an open area and retry.");
        } else if (err.code === err.TIMEOUT) {
          setGpsError("Timed out while getting your location. Please retry.");
        } else {
          setGpsError(err.message);
        }
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
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

  async function handleTapToTakePhoto() {
    if (requestingCamera) return;
    setRequestingCamera(true);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // Permission denied or unsupported — still open file input as fallback
    } finally {
      setRequestingCamera(false);
      fileInputRef.current?.click();
    }
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
              onClick={handleTapToTakePhoto}
              disabled={requestingCamera}
              className="w-full flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                {requestingCamera ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {requestingCamera ? "Requesting camera…" : "Tap to take a photo"}
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
                {geoPermission === "denied" && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      If no prompt appears, open your browser site settings and set Location to
                      Allow, then return and retry.
                    </p>
                    {isIOSSafari && (
                      <div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900">
                        <p className="font-medium">Safari location is currently disabled</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-4">
                          <li>Open iPhone Settings</li>
                          <li>Go to Privacy &amp; Security -&gt; Location Services</li>
                          <li>Select Safari Websites</li>
                          <li>Choose Ask Next Time or When I Share</li>
                          <li>Enable Precise Location</li>
                        </ol>
                      </div>
                    )}
                  </>
                )}
                <Button type="button" variant="outline" size="sm" onClick={acquireLocation}>
                  Retry
                </Button>
              </div>
            ) : geoPermission === "prompt" || geoPermission === "unknown" ? (
              <Button type="button" variant="outline" size="sm" onClick={acquireLocation}>
                Use current location
              </Button>
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
