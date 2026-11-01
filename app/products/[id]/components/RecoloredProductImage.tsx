"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { hexColorDistance } from "../../../lib/recolor/colorMath";
import { recolorImageWithMask } from "../../../lib/recolor/recolorImage";
import type { RecolorMaskProfile } from "../../../lib/recolor/types";

import styles from "./ProductGallery.module.css";

interface Props {
  original: string;
  alt: string;
  profile: RecolorMaskProfile;
  colorHex: string;
  colorName: string;
  isPrimaryColor: boolean;
}

export default function RecoloredProductImage({
  original,
  alt,
  profile,
  colorHex,
  colorName,
  isPrimaryColor,
}: Props) {
  const [recolored, setRecolored] = useState<{ hex: string; url: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const isSourceColor =
    isPrimaryColor ||
    (profile.sourceColor
      ? hexColorDistance(profile.sourceColor, colorHex) < 3
      : false);
  const currentImage =
    !isSourceColor && recolored?.hex === colorHex ? recolored.url : null;

  useEffect(() => {
    if (isSourceColor) return;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setFailed(false);

      recolorImageWithMask({
        imageSource: original,
        maskSource: profile.maskImage,
        hex: colorHex,
      })
        .then((result) => {
          if (!cancelled) setRecolored({ hex: colorHex, url: result.dataUrl });
        })
        .catch(() => {
          if (!cancelled) {
            setFailed(true);
            setRecolored(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 40);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [original, profile.maskImage, colorHex, isSourceColor]);

  return (
    <>
      <Image
        src={currentImage ?? original}
        alt={currentImage ? `${alt} in ${colorName}` : alt}
        width={740}
        height={944}
        className={styles.mainImage}
        priority
        unoptimized
      />
      {!isSourceColor && loading && !currentImage && (
        <span className={styles.recolorLoading} aria-hidden="true" />
      )}
      {!isSourceColor && failed && !currentImage && (
        <span className={styles.recolorError}>
          Colour preview unavailable
        </span>
      )}
    </>
  );
}
