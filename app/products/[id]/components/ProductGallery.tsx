"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { hexColorDistance } from "../../../lib/recolor/colorMath";
import { recolorImageWithMask } from "../../../lib/recolor/recolorImage";
import {
  parseRecolorMask,
  type RecolorMaskProfile,
} from "../../../lib/recolor/types";
import { useProductSelection } from "./ProductSelectionContext";
import RecoloredProductImage from "./RecoloredProductImage";

import styles from "./ProductGallery.module.css";

interface Props {
  images: string[];
  name: string;
  recolorMask?: string | null;
}

export default function ProductGallery({ images, name, recolorMask }: Props) {
  const [selected, setSelected] = useState(0);
  const { colors, selectedColor } = useProductSelection();

  const storedProfile = useMemo(
    () => parseRecolorMask(recolorMask),
    [recolorMask]
  );
  const sourceImage = images[0];
  const profile = useMemo(() => {
    if (storedProfile && storedProfile.sourceImage === sourceImage) {
      return storedProfile;
    }
    return null;
  }, [storedProfile, sourceImage]);

  const activeColor = selectedColor ?? colors[0] ?? null;
  const manualOverride = activeColor?.image?.trim() || null;
  const activeImage = images[selected] ?? sourceImage;

  const isPrimaryColor = Boolean(
    activeColor &&
      colors[0] &&
      activeColor.name === colors[0].name &&
      activeColor.hex === colors[0].hex
  );

  const canRecolor = Boolean(
    profile &&
      activeColor &&
      !isPrimaryColor &&
      !manualOverride &&
      activeImage === profile.sourceImage
  );

  useEffect(() => {
    if (!profile || profile.sourceImage !== images[0]) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const seen = new Set<string>();
      for (const color of colors.slice(0, 8)) {
        if (cancelled) return;
        if (!color.hex || color.image || seen.has(color.hex.toLowerCase())) continue;
        seen.add(color.hex.toLowerCase());
        if (profile.sourceColor && hexColorDistance(profile.sourceColor, color.hex) < 3) {
          continue;
        }
        try {
          await recolorImageWithMask({
            imageSource: profile.sourceImage,
            maskSource: profile.maskImage,
            hex: color.hex,
          });
        } catch {
          return;
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [colors, images, profile]);

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbs}>
        {images.map((src, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`${styles.thumb} ${
              idx === selected ? styles.thumbActive : ""
            }`}
          >
            <Image
              src={src}
              alt={`${name} view ${idx + 1}`}
              width={120}
              height={153}
              className={styles.thumbImage}
            />
          </button>
        ))}
      </div>

      <div className={styles.main}>
        {canRecolor && profile && activeColor ? (
          <RecoloredProductImage
            original={activeImage}
            alt={name}
            profile={profile}
            colorHex={activeColor.hex}
            colorName={activeColor.name}
            isPrimaryColor={activeColor.hex === colors[0]?.hex}
          />
        ) : (
          <Image
            src={manualOverride ?? activeImage}
            alt={name}
            width={740}
            height={944}
            className={styles.mainImage}
            priority
          />
        )}
      </div>
    </div>
  );
}
