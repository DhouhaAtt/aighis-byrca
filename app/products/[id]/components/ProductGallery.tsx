"use client";

import { useState } from "react";
import Image from "next/image";

import styles from "./ProductGallery.module.css";

interface Props {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0);

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
        <Image
          src={images[selected]}
          alt={name}
          width={740}
          height={944}
          className={styles.mainImage}
          priority
        />
      </div>
    </div>
  );
}
