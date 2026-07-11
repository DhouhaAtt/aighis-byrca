"use client";

import Image from "next/image";
import styles from "./HeroImage.module.css";
import { useLocale } from "../../context/LocaleContext";

interface Props {
  image: string;

  position: "left" | "right";
}

export default function HeroImage({
  image,

  position,
}: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.wrapper}>
      <Image
        src={image}
        alt={t.home.heroAlt}
        fill
        priority
        sizes="50vw"
        className={`${styles.image} ${styles[position]}`}
      />

      <div className={styles.overlay} />
    </div>
  );
}
