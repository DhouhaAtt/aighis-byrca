"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import styles from "./ProductAccordion.module.css";
import type { ProductDetail } from "../../../lib/productData";
import { useLocale } from "../../../context/LocaleContext";

interface Props {
  product: ProductDetail;
}

export default function ProductAccordion({ product }: Props) {
  const [open, setOpen] = useState<string | null>("description");
  const { t } = useLocale();

  const toggle = (section: string) => {
    setOpen((prev) => (prev === section ? null : section));
  };

  const sections = [
    {
      id: "description",
      title: t.productDetail.description,
      content: <p className={styles.text}>{product.description}</p>,
    },
    {
      id: "details",
      title: t.productDetail.productDetails,
      content: (
        <div className={styles.detailsGrid}>
          <div>
            <span className={styles.detailLabel}>{t.productDetail.composition}</span>
            <p className={styles.detailText}>{product.composition}</p>
          </div>

          <div>
            <span className={styles.detailLabel}>{t.productDetail.fit}</span>
            <p className={styles.detailText}>{product.fit}</p>
          </div>

          <div>
            <span className={styles.detailLabel}>{t.productDetail.productCode}</span>
            <p className={styles.detailText}>{product.productCode}</p>
          </div>
        </div>
      ),
    },
    {
      id: "care",
      title: t.productDetail.compositionCare,
      content: (
        <div className={styles.careList}>
          <p className={styles.detailLabel}>{t.productDetail.composition}</p>
          <p className={styles.detailText}>{product.composition}</p>

          <p className={styles.detailLabel} style={{ marginTop: 16 }}>
            {t.productDetail.careInstructions}
          </p>

          <ul className={styles.care}>
            {product.careInstructions.map((instruction, idx) => (
              <li key={idx} className={styles.careItem}>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "shipping",
      title: t.productDetail.shippingReturns,
      content: (
        <div className={styles.shippingContent}>
          <p className={styles.detailLabel}>{t.productDetail.shipping}</p>
          <p className={styles.detailText}>{product.shipping}</p>

          <p className={styles.detailLabel} style={{ marginTop: 16 }}>
            {t.productDetail.returns}
          </p>
          <p className={styles.detailText}>{product.returns}</p>
        </div>
      ),
    },
  ];

  return (
    <section className={styles.accordion}>
      {sections.map((section) => {
        const isOpen = open === section.id;

        return (
          <div key={section.id} className={styles.section}>
            <button
              onClick={() => toggle(section.id)}
              className={styles.trigger}
              aria-expanded={isOpen}
            >
              <span>{section.title}</span>

              <ChevronDown
                size={16}
                strokeWidth={1.5}
                className={`${styles.chevron} ${
                  isOpen ? styles.chevronOpen : ""
                }`}
              />
            </button>

            <div
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
            >
              <div className={styles.panelInner}>{section.content}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
