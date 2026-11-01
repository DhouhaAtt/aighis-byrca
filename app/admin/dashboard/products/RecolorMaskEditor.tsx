"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { clamp } from "../../../lib/recolor/colorMath";
import {
  imageDataToDataUrl,
  loadMaskRaster,
  loadRaster,
  MAX_SEGMENTATION_DIMENSION,
} from "../../../lib/recolor/imageUtils";

import styles from "./RecolorStudio.module.css";

type Tool = "add" | "erase";

interface Props {
  image: string;
  maskDataUrl: string;
  onChange: (maskDataUrl: string) => void;
}

export default function RecolorMaskEditor({ image, maskDataUrl, onChange }: Props) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<Uint8ClampedArray | null>(null);
  const dimsRef = useRef({ width: 0, height: 0 });
  const paintingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastEmittedRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const [tool, setTool] = useState<Tool>("add");
  const [brush, setBrush] = useState(36);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rebuildOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const alpha = maskRef.current;
    const { width, height } = dimsRef.current;
    if (!overlay || !alpha || !width || !height) return;

    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width;
      overlay.height = height;
    }

    const context = overlay.getContext("2d");
    if (!context) return;
    const imageData = context.createImageData(width, height);
    const pixels = imageData.data;

    for (let p = 0; p < width * height; p += 1) {
      const offset = p * 4;
      pixels[offset] = 22;
      pixels[offset + 1] = 163;
      pixels[offset + 2] = 74;
      pixels[offset + 3] = Math.round(alpha[p] * 0.42);
    }

    context.putImageData(imageData, 0, 0);
  }, []);

  useEffect(() => {
    if (!image || !maskDataUrl) return;
    if (maskDataUrl === lastEmittedRef.current) return;

    let cancelled = false;
    setReady(false);
    setError(null);

    (async () => {
      try {
        const raster = await loadRaster(image, MAX_SEGMENTATION_DIMENSION);
        const alpha = await loadMaskRaster(maskDataUrl, raster.width, raster.height);
        if (cancelled) return;

        const base = baseRef.current;
        const overlay = overlayRef.current;
        if (!base || !overlay) return;

        base.width = raster.width;
        base.height = raster.height;
        overlay.width = raster.width;
        overlay.height = raster.height;

        const baseContext = base.getContext("2d");
        if (!baseContext) throw new Error("Canvas is not available");
        baseContext.drawImage(raster.canvas, 0, 0);

        const nextMask = new Uint8ClampedArray(raster.width * raster.height);
        for (let p = 0; p < nextMask.length; p += 1) {
          nextMask[p] = alpha[p * 4 + 3];
        }

        maskRef.current = nextMask;
        dimsRef.current = { width: raster.width, height: raster.height };
        rebuildOverlay();
        setReady(true);
      } catch {
        if (!cancelled) setError("Unable to load the mask for editing.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [image, maskDataUrl, rebuildOverlay]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const scheduleOverlay = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      rebuildOverlay();
    });
  }, [rebuildOverlay]);

  const paintCircle = useCallback(
    (cx: number, cy: number) => {
      const alpha = maskRef.current;
      const { width, height } = dimsRef.current;
      if (!alpha || !width || !height) return;

      const radius = Math.max(2, brush / 2);
      const feather = Math.max(1, radius * 0.35);
      const startX = Math.max(0, Math.floor(cx - radius - feather));
      const endX = Math.min(width - 1, Math.ceil(cx + radius + feather));
      const startY = Math.max(0, Math.floor(cy - radius - feather));
      const endY = Math.min(height - 1, Math.ceil(cy + radius + feather));

      for (let y = startY; y <= endY; y += 1) {
        for (let x = startX; x <= endX; x += 1) {
          const dx = x - cx;
          const dy = y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > radius + feather) continue;
          const coverage = clamp((radius + feather - distance) / feather, 0, 1);

          if (tool === "add") {
            const value = Math.round(255 * coverage);
            const p = y * width + x;
            if (value > alpha[p]) alpha[p] = value;
          } else {
            const value = Math.round(255 * (1 - coverage));
            const p = y * width + x;
            if (value < alpha[p]) alpha[p] = value;
          }
        }
      }

      scheduleOverlay();
    },
    [brush, tool, scheduleOverlay]
  );

  const paintLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const step = Math.max(2, brush / 4);
      const steps = Math.max(1, Math.ceil(distance / step));
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        paintCircle(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      }
    },
    [brush, paintCircle]
  );

  const pointFromEvent = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }, []);

  const emit = useCallback(() => {
    const alpha = maskRef.current;
    const { width, height } = dimsRef.current;
    if (!alpha || !width || !height) return;

    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let p = 0; p < width * height; p += 1) {
      const offset = p * 4;
      rgba[offset] = 255;
      rgba[offset + 1] = 255;
      rgba[offset + 2] = 255;
      rgba[offset + 3] = alpha[p];
    }

    const next = imageDataToDataUrl(rgba, width, height);
    lastEmittedRef.current = next;
    rebuildOverlay();
    onChange(next);
  }, [onChange, rebuildOverlay]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!ready) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const point = pointFromEvent(event);
      if (!point) return;
      paintingRef.current = true;
      lastPointRef.current = point;
      paintCircle(point.x, point.y);
    },
    [paintCircle, pointFromEvent, ready]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!paintingRef.current) return;
      const point = pointFromEvent(event);
      if (!point) return;
      const last = lastPointRef.current;
      if (last) paintLine(last, point);
      lastPointRef.current = point;
    },
    [paintLine, pointFromEvent]
  );

  const finishStroke = useCallback(() => {
    if (!paintingRef.current) return;
    paintingRef.current = false;
    lastPointRef.current = null;
    emit();
  }, [emit]);

  if (!image) {
    return (
      <p className={styles.hint}>
        Add the main product image first, then generate the segmentation mask.
      </p>
    );
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorToolbar}>
        <div className={styles.toolGroup}>
          <button
            type="button"
            className={`${styles.toolBtn} ${tool === "add" ? styles.toolBtnActive : ""}`}
            onClick={() => setTool("add")}
          >
            Add to product
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${tool === "erase" ? styles.toolBtnActive : ""}`}
            onClick={() => setTool("erase")}
          >
            Remove from product
          </button>
        </div>
        <label className={styles.brushControl}>
          Brush
          <input
            type="range"
            min={6}
            max={140}
            value={brush}
            onChange={(event) => setBrush(Number(event.target.value))}
          />
          <span>{brush}px</span>
        </label>
        <button type="button" className={styles.clearBtn} onClick={() => {
          const alpha = maskRef.current;
          if (!alpha) return;
          alpha.fill(0);
          scheduleOverlay();
          emit();
        }}>
          Clear mask
        </button>
      </div>

      <div className={styles.editorCanvasWrap}>
        <canvas ref={baseRef} className={styles.editorCanvas} />
        <canvas
          ref={overlayRef}
          className={`${styles.editorCanvas} ${styles.editorOverlay}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onPointerLeave={finishStroke}
        />
        {!ready && !error && <div className={styles.editorLoading}>Loading mask…</div>}
        {error && <div className={styles.editorError}>{error}</div>}
      </div>
      <p className={styles.hint}>
        Paint over the product to include it, or erase background that was detected by mistake.
      </p>
    </div>
  );
}
