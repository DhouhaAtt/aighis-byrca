"use client";

import styles from "./VariantSelector.module.css";

interface Variant {
  name: string;
  hex: string;
}

interface Props {
  variants: Variant[];
  selected: Variant;
  onChange: (variant: Variant) => void;
  label: string;
}

export default function VariantSelector({
  variants,
  selected,
  onChange,
  label,
}: Props) {
  return (
    <div className={styles.selector}>
      <p className={styles.label}>
        {label}:{" "}
        <span className={styles.value}>{selected?.name ?? "-"}</span>
      </p>

      <div className={styles.swatches}>
        {variants.map((v) => (
          <button
            key={v.hex}
            onClick={() => onChange(v)}
            className={`${styles.swatch} ${
              v.hex === selected.hex ? styles.swatchActive : ""
            }`}
            aria-label={v.name}
            title={v.name}
          >
            <span
              className={styles.dot}
              style={{ backgroundColor: v.hex }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
