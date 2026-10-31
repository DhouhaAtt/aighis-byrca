"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {currentPage > 1 ? (
        <button type="button" onClick={() => onPageChange(currentPage - 1)} className={styles.arrow} aria-label="Previous page">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
      ) : (
        <button type="button" className={`${styles.arrow} ${styles.disabled}`} aria-label="Previous page" disabled>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
      )}

      <div className={styles.pages}>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              type="button"
              key={p}
              className={`${styles.page} ${p === currentPage ? styles.active : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {String(p).padStart(2, "0")}
            </button>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <button type="button" onClick={() => onPageChange(currentPage + 1)} className={styles.arrow} aria-label="Next page">
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      ) : (
        <button type="button" className={`${styles.arrow} ${styles.disabled}`} aria-label="Next page" disabled>
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      )}
    </nav>
  );
}
