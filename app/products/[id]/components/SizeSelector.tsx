"use client";

import styles from "./SizeSelector.module.css";
import { useLocale } from "../../../context/LocaleContext";

interface Props {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.selector}>
      <div className={styles.header}>
        <span className={styles.label}>{t.productDetail.size}</span>

        <button className={styles.guide}>{t.productDetail.sizeGuide}</button>
      </div>

      <div className={styles.grid}>
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`${styles.size} ${
              size === selected ? styles.sizeActive : ""
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
