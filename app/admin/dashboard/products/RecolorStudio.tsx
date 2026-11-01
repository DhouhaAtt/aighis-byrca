"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { hexColorDistance } from "../../../lib/recolor/colorMath";
import {
  computeMaskedAverageColor,
  recolorImageWithMask,
} from "../../../lib/recolor/recolorImage";
import { segmentProduct } from "../../../lib/recolor/segmentation";
import { uploadDataUrl } from "../../../lib/recolor/imageUtils";
import type { ColorOption } from "../../../lib/productJson";
import type {
  RecolorEngine,
  RecolorMaskProfile,
} from "../../../lib/recolor/types";

import RecolorMaskEditor from "./RecolorMaskEditor";
import styles from "./RecolorStudio.module.css";

interface Props {
  image: string;
  colors: ColorOption[];
  profile: RecolorMaskProfile | null;
  onChangeMask: (profile: RecolorMaskProfile | null) => void;
  onSetColorImage: (hex: string, image: string | null) => void;
}

type BusyState = "detect" | "saving" | "preview" | null;

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  if (!response.ok) throw new Error("Image upload failed");
  const data = (await response.json()) as { urls?: string[] };
  const url = data.urls?.[0];
  if (!url) throw new Error("Image upload returned no URL");
  return url;
}

export default function RecolorStudio({
  image,
  colors,
  profile,
  onChangeMask,
  onSetColorImage,
}: Props) {
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(() =>
    profile && profile.sourceImage === image ? profile.maskImage : null
  );
  const [engine, setEngine] = useState<RecolorEngine>(() =>
    profile && profile.sourceImage === image ? profile.engine : "local"
  );
  const [confidence, setConfidence] = useState(() =>
    profile && profile.sourceImage === image ? profile.confidence : 0
  );
  const [sourceColor, setSourceColor] = useState<string | null>(() =>
    profile && profile.sourceImage === image ? profile.sourceColor ?? null : null
  );
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState<BusyState>(null);
  const [error, setError] = useState<string | null>(() =>
    profile && profile.sourceImage !== image
      ? "The saved mask belongs to a different image. Generate a new one."
      : null
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [overrideBusy, setOverrideBusy] = useState<string | null>(null);

  const saveTimerRef = useRef<number | null>(null);
  const latestRef = useRef({
    maskDataUrl: null as string | null,
    engine: "local" as RecolorEngine,
    confidence: 0,
    sourceColor: null as string | null,
  });

  useEffect(() => {
    latestRef.current = { maskDataUrl, engine, confidence, sourceColor };
  }, [maskDataUrl, engine, confidence, sourceColor]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    },
    []
  );

  const persistMask = useCallback(
    async (
      dataUrl: string,
      nextEngine: RecolorEngine,
      nextConfidence: number,
      nextSourceColor: string | null
    ) => {
      setBusy("saving");
      setError(null);
      try {
        const maskImage = await uploadDataUrl(
          dataUrl,
          `recolor-mask-${Date.now()}.png`
        );
        onChangeMask({
          sourceImage: image,
          maskImage,
          engine: nextEngine,
          confidence: nextConfidence,
          sourceColor: nextSourceColor,
          createdAt: new Date().toISOString(),
        });
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Could not save the mask. Please try again."
        );
      } finally {
        setBusy(null);
      }
    },
    [image, onChangeMask]
  );

  const applyMask = useCallback(
    async (
      nextMask: string,
      nextEngine: RecolorEngine,
      nextConfidence: number,
      nextSourceColor: string | null,
      persist = true
    ) => {
      setMaskDataUrl(nextMask);
      setEngine(nextEngine);
      setConfidence(nextConfidence);
      setSourceColor(nextSourceColor);
      if (persist) {
        await persistMask(nextMask, nextEngine, nextConfidence, nextSourceColor);
      }
    },
    [persistMask]
  );

  const handleAutoDetect = useCallback(async () => {
    if (!image) return;
    setBusy("detect");
    setError(null);
    setWarnings([]);

    try {
      let maskDataUrl: string | null = null;
      let nextEngine: RecolorEngine = "local";
      let nextConfidence = 0;
      let nextSourceColor: string | null = null;
      let nextWarnings: string[] = [];

      try {
        const response = await fetch("/api/recolor/segment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: image }),
        });
        const data = (await response.json().catch(() => null)) as
          | {
              configured?: boolean;
              maskDataUrl?: string;
              engine?: string;
              confidence?: number;
              sourceColor?: string | null;
            }
          | null;

        if (response.ok && data?.configured && data.maskDataUrl) {
          maskDataUrl = data.maskDataUrl;
          nextEngine = "ai";
          nextConfidence =
            typeof data.confidence === "number" ? data.confidence : 0.85;
          nextSourceColor = data.sourceColor ?? null;
        }
      } catch {
        // Fall through to the on-device engine.
      }

      if (!maskDataUrl) {
        const result = await segmentProduct(image);
        maskDataUrl = result.maskDataUrl;
        nextEngine = "local";
        nextConfidence = result.confidence;
        nextSourceColor = result.sourceColor;
        nextWarnings = result.warnings;
      }

      if (!nextSourceColor) {
        nextSourceColor = await computeMaskedAverageColor(image, maskDataUrl).catch(
          () => null
        );
      }

      setWarnings(nextWarnings);
      await applyMask(
        maskDataUrl,
        nextEngine,
        nextConfidence,
        nextSourceColor,
        true
      );
    } catch (detectError) {
      setError(
        detectError instanceof Error
          ? detectError.message
          : "Automatic segmentation failed. You can paint the mask manually."
      );
    } finally {
      setBusy(null);
    }
  }, [applyMask, image]);

  const handleMaskEdit = useCallback(
    (nextMask: string) => {
      const nextSource = sourceColor;
      setMaskDataUrl(nextMask);
      setEngine("manual");
      setWarnings([]);
      latestRef.current = {
        maskDataUrl: nextMask,
        engine: "manual",
        confidence,
        sourceColor: nextSource,
      };

      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        const latest = latestRef.current;
        if (!latest.maskDataUrl) return;
        void persistMask(
          latest.maskDataUrl,
          "manual",
          latest.confidence,
          latest.sourceColor
        );
      }, 900);
    },
    [confidence, persistMask, sourceColor]
  );

  useEffect(() => {
    if (!image || !maskDataUrl || colors.length === 0) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setBusy((current) => current ?? "preview");
      const next: Record<string, string> = {};

      for (const [index, color] of colors.entries()) {
        if (cancelled) return;
        const key = color.hex.toLowerCase();
        if (color.image) {
          next[key] = color.image;
          setPreviews({ ...next });
          continue;
        }
        if (index === 0) {
          next[key] = image;
          setPreviews({ ...next });
          continue;
        }
        if (sourceColor && hexColorDistance(sourceColor, color.hex) < 3) {
          next[key] = image;
          setPreviews({ ...next });
          continue;
        }
        try {
          const result = await recolorImageWithMask({
            imageSource: image,
            maskSource: maskDataUrl,
            hex: color.hex,
            maxDimension: 420,
          });
          if (cancelled) return;
          next[key] = result.dataUrl;
          setPreviews({ ...next });
        } catch {
          // A single preview failing should not block the others.
        }
      }

      if (!cancelled) setBusy((current) => (current === "preview" ? null : current));
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [image, maskDataUrl, colors, sourceColor]);

  const handleOverrideUpload = useCallback(
    async (hex: string, file: File | null) => {
      if (!file) return;
      setOverrideBusy(hex);
      setError(null);
      try {
        const url = await uploadFile(file);
        onSetColorImage(hex, url);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error ? uploadError.message : "Override upload failed"
        );
      } finally {
        setOverrideBusy(null);
      }
    },
    [onSetColorImage]
  );

  const hasMask = Boolean(maskDataUrl);
  const isMaskPending = busy === "saving";
  const maskMismatch = Boolean(profile && profile.sourceImage !== image);

  return (
    <section className={styles.studio}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.title}>Automatic colour preview</h4>
          <p className={styles.hint}>
            Generate the product mask once. Every colour is then rendered from the
            original image without uploading a separate photo.
          </p>
        </div>
        <button
          type="button"
          className={styles.detectBtn}
          onClick={handleAutoDetect}
          disabled={!image || busy === "detect" || isMaskPending}
        >
          {busy === "detect"
            ? "Detecting product…"
            : hasMask
              ? "Regenerate mask"
              : "Detect & generate mask"}
        </button>
      </div>

      {!image && (
        <p className={styles.hint}>
          Upload the main product image first. The mask is created from that image.
        </p>
      )}

      {maskMismatch && (
        <p className={styles.warning}>
          The saved mask belongs to a different image. Generate a new mask before
          saving this product.
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {hasMask && (
        <>
          <div className={styles.maskMeta}>
            <span className={styles.badge}>Engine: {engine}</span>
            <span className={styles.badge}>
              Confidence: {Math.round(confidence * 100)}%
            </span>
            {sourceColor && (
              <span className={styles.badge}>
                Source
                <span
                  className={styles.sourceDot}
                  style={{ background: sourceColor }}
                />
              </span>
            )}
            {isMaskPending && <span className={styles.badge}>Saving mask…</span>}
            {busy === "preview" && <span className={styles.badge}>Rendering previews…</span>}
          </div>

          {confidence > 0 && confidence < 0.55 && (
            <p className={styles.warning}>
              Automatic detection confidence is low. Review the mask below and use
              the brush to correct it.
            </p>
          )}

          {warnings.map((warning) => (
            <p key={warning} className={styles.warning}>
              {warning}
            </p>
          ))}

          <RecolorMaskEditor
            image={image}
            maskDataUrl={maskDataUrl as string}
            onChange={handleMaskEdit}
          />

          <div className={styles.previews}>
            {colors.length === 0 ? (
              <p className={styles.hint}>
                Select at least one colour to preview the recoloured product.
              </p>
            ) : (
              colors.map((color) => {
                const key = color.hex.toLowerCase();
                const preview = previews[key];
                return (
                  <div key={color.hex} className={styles.previewCard}>
                    <div className={styles.previewThumb}>
                      {preview ? (
                        <img src={preview} alt={`${color.name} preview`} />
                      ) : (
                        <span className={styles.previewEmpty} />
                      )}
                    </div>
                    <div className={styles.previewMeta}>
                      <span className={styles.previewName}>
                        <span
                          className={styles.sourceDot}
                          style={{ background: color.hex }}
                        />
                        {color.name}
                      </span>
                      <span className={styles.previewHex}>{color.hex}</span>
                    </div>
                    <div className={styles.overrideRow}>
                      <label className={styles.overrideBtn}>
                        {overrideBusy === key
                          ? "Uploading…"
                          : color.image
                            ? "Replace override"
                            : "Manual image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleOverrideUpload(key, event.target.files?.[0] ?? null)
                          }
                          disabled={overrideBusy === key}
                        />
                      </label>
                      {color.image && (
                        <button
                          type="button"
                          className={styles.removeOverride}
                          onClick={() => onSetColorImage(key, null)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {color.image && (
                      <span className={styles.overrideNote}>
                        Uses a manually uploaded image for this colour.
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {!hasMask && image && (
        <p className={styles.hint}>
          No mask yet. Run detection, or paint the product manually after the first
          detection.
        </p>
      )}
    </section>
  );
}
