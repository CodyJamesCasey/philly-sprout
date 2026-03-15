"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, MapPin, Loader2, ImageIcon } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { CameraCaptureView } from "@/components/camera-capture-view";
import { CameraPermissionPrompt } from "@/components/camera-permission-prompt";
import { PhotoGallery, type PhotoEntry } from "@/components/photo-gallery";
import { createSubmission, type SubmissionState } from "./actions";

type GeoPermissionState = "unknown" | "granted" | "prompt" | "denied" | "unsupported";
type MobilePlatform = "ios" | "android" | "other";

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

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedPhotoIndex, setExpandedPhotoIndex] = useState<number | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showCameraPermissionUI, setShowCameraPermissionUI] = useState(false);
  const [requestingCamera, setRequestingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraUnsupported, setCameraUnsupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [geoPermission, setGeoPermission] = useState<GeoPermissionState>("unknown");
  const [platform, setPlatform] = useState<MobilePlatform>("other");
  const [isSafari, setIsSafari] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refreshGeoPermissionState(): Promise<GeoPermissionState> {
    if (!navigator.permissions?.query) {
      return "unknown";
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });
      const state = permissionStatus.state as GeoPermissionState;
      setGeoPermission(state);
      return state;
    } catch {
      return "unknown";
    }
  }

  function handleRetryLocation() {
    // Keep geolocation request directly in the user-gesture call stack.
    // Some mobile browsers suppress permission prompts if we await first.
    acquireLocation();

    // Refresh the permission state in parallel for UI messaging.
    void refreshGeoPermissionState();
  }

  function handleRetryRefresh() {
    window.location.reload();
  }

  useEffect(() => {
    const ua = navigator.userAgent;
    const isiOS =
      /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    const chrome = /Chrome|CriOS/.test(ua) && !/Edg|OPR|SamsungBrowser|DuckDuckGo/.test(ua);

    setPlatform(isiOS ? "ios" : isAndroid ? "android" : "other");
    setIsSafari(safari);
    setIsChrome(chrome);

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

  useEffect(() => {
    function syncOnReturn() {
      if (document.visibilityState === "hidden") return;
      void refreshGeoPermissionState();
    }

    window.addEventListener("focus", syncOnReturn);
    document.addEventListener("visibilitychange", syncOnReturn);

    return () => {
      window.removeEventListener("focus", syncOnReturn);
      document.removeEventListener("visibilitychange", syncOnReturn);
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
          if (platform === "ios" && isSafari) {
            setGpsError(
              "Location access is off for Safari on this iPhone/iPad. Turn it on in iOS Settings, then retry.",
            );
          } else if (platform === "android") {
            setGpsError(
              "Location access is off on this Android device. Enable it in browser/app permissions, then retry.",
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

  async function uploadPhotoFile(file: File): Promise<void> {
    setPhotoError(null);
    const preview = URL.createObjectURL(file);
    setPhotos((prev) => [...prev, { preview, url: null }]);
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setPhotoError("You must be signed in to upload a photo.");
        setPhotos((prev) => prev.filter((p) => p.preview !== preview));
        URL.revokeObjectURL(preview);
        return;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("tree-spots").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) {
        const needsBucket =
          error.message?.toLowerCase().includes("bucket") ||
          error.message?.toLowerCase().includes("not found") ||
          error.message?.includes("400");
        const hint = needsBucket
          ? " Ensure the tree-spots bucket has policies allowing authenticated uploads in Supabase Dashboard > Storage."
          : "";
        setPhotoError(`${error.message}${hint}`);
        setPhotos((prev) => prev.filter((p) => p.preview !== preview));
        URL.revokeObjectURL(preview);
        return;
      }
      const { data } = supabase.storage.from("tree-spots").getPublicUrl(path);
      setPhotos((prev) =>
        prev.map((p) => (p.preview === preview ? { ...p, url: data.publicUrl } : p)),
      );
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed.");
      setPhotos((prev) => prev.filter((p) => p.preview !== preview));
      URL.revokeObjectURL(preview);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      await uploadPhotoFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
    if (expandedPhotoIndex === index) {
      setExpandedPhotoIndex(null);
    } else if (expandedPhotoIndex !== null && expandedPhotoIndex > index) {
      setExpandedPhotoIndex(expandedPhotoIndex - 1);
    }
    setPhotoError(null);
  }

  async function handleTapToTakePhoto() {
    if (requestingCamera) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setShowCameraPermissionUI(false);
      setCameraUnsupported(true);
      setPhotoError("Camera is not supported. Use the button below to choose a photo from your device.");
      setRequestingCamera(false);
      return;
    }
    setRequestingCamera(true);
    setPhotoError(null);
    try {
      const facingMode = platform === "ios" || platform === "android" ? "environment" : "user";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
      });
      setShowCameraPermissionUI(false);
      setCameraStream(stream);
    } catch (err) {
      setShowCameraPermissionUI(false);
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setPhotoError(
        isDenied
          ? "Camera access denied. Use the button below to try again or choose a photo."
          : "Could not access camera. Use the button below to try again or choose a photo.",
      );
    } finally {
      setRequestingCamera(false);
    }
  }

  function closeCamera() {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  }

  function handleCapturePhoto() {
    const video = videoRef.current;
    if (!video || !cameraStream || video.readyState !== 4) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        closeCamera();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        await uploadPhotoFile(file);
      },
      "image/jpeg",
      0.9,
    );
  }

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Hidden fields */}
      <input type="hidden" name="latitude" value={location?.lat ?? ""} />
      <input type="hidden" name="longitude" value={location?.lng ?? ""} />
      {photos
        .filter((p) => p.url)
        .map((p) => (
          <input key={p.url!} type="hidden" name="photo_url" value={p.url!} />
        ))}

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
          {photoError && (
            <div className="space-y-3 mb-3">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {photoError}
              </div>
              <div className="flex gap-2">
                {!cameraUnsupported && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setPhotoError(null);
                      handleTapToTakePhoto();
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className={cameraUnsupported ? "w-full" : "flex-1"}
                  onClick={() => {
                    setPhotoError(null);
                    fileInputRef.current?.click();
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose photo
                </Button>
              </div>
            </div>
          )}
          {cameraStream ? (
            <CameraCaptureView
              ref={videoRef}
              onCapture={handleCapturePhoto}
              onCancel={closeCamera}
            />
          ) : photos.length > 0 ? (
            <div className="space-y-3">
              <PhotoGallery
                photos={photos}
                expandedIndex={expandedPhotoIndex}
                onExpand={setExpandedPhotoIndex}
                onClose={() => setExpandedPhotoIndex(null)}
                onRemove={removePhoto}
                uploading={uploadingPhoto}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCameraPermissionUI(true)}
                  disabled={uploadingPhoto}
                  className="w-full sm:w-auto"
                >
                  <Camera className="w-4 h-4 mr-2 shrink-0" />
                  Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full sm:w-auto"
                >
                  <ImageIcon className="w-4 h-4 mr-2 shrink-0" />
                  Upload
                </Button>
              </div>
            </div>
          ) : showCameraPermissionUI ? (
            <CameraPermissionPrompt
              onAllow={handleTapToTakePhoto}
              onCancel={() => setShowCameraPermissionUI(false)}
              isRequesting={requestingCamera}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowCameraPermissionUI(true)}
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
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose from device
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
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
                    {platform === "ios" && isSafari && (
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
                    {platform === "android" && (
                      <div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900">
                        <p className="font-medium">Location is currently blocked on Android</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-4">
                          {isChrome ? (
                            <>
                              <li>Open Chrome Settings</li>
                              <li>Go to Site settings -&gt; Location</li>
                              <li>Make sure Location is allowed</li>
                              <li>In this site&apos;s settings, set Location to Allow</li>
                            </>
                          ) : (
                            <>
                              <li>Open your browser&apos;s Site Settings</li>
                              <li>Set Location permission for this site to Allow</li>
                            </>
                          )}
                          <li>Open Android Settings -&gt; Apps -&gt; your browser -&gt; Permissions</li>
                          <li>Set Location to Allow while using the app</li>
                          <li>Enable precise/accurate location if available</li>
                        </ol>
                      </div>
                    )}
                  </>
                )}
                <Button type="button" variant="outline" size="sm" onClick={handleRetryRefresh}>
                  Retry
                </Button>
              </div>
            ) : geoPermission === "prompt" || geoPermission === "unknown" ? (
              <Button type="button" variant="outline" size="sm" onClick={handleRetryLocation}>
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
