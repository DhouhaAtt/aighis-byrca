"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./ProductGallery.module.css";
import { useProductSelection } from "./ProductSelectionContext";

interface Props {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0);
  const { selectedColor } = useProductSelection();
  const colorImage = selectedColor?.image?.trim();
  const galleryImages = colorImage ? [colorImage] : images;
  const activeIndex = Math.min(selected, Math.max(galleryImages.length - 1, 0));

  useEffect(() => {
    setSelected(0);
  }, [selectedColor?.hex, colorImage]);

  const imageAlt = selectedColor
    ? `${name} — ${selectedColor.name}`
    : name;

  return (
    <div className={styles.gallery}>
      {galleryImages.length > 0 && (
        <div className={styles.thumbs}>
          {galleryImages.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`${styles.thumb} ${
                idx === selected ? styles.thumbActive : ""
              }`}
            >
              <Image
                src={src}
                alt={`${imageAlt} — vue ${idx + 1}`}
                width={120}
                height={153}
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      )}

      <div className={styles.main}>
        <Image
          src={galleryImages[activeIndex] ?? images[0]}
          alt={imageAlt}
          width={740}
          height={944}
          className={styles.mainImage}
          priority
        />
      </div>
    </div>
  );
}
