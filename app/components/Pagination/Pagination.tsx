"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const getHref = (page: number) => {
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}page=${page}`;
  };

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
        <Link href={getHref(currentPage - 1)} className={styles.arrow}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
      ) : (
        <span className={`${styles.arrow} ${styles.disabled}`}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </span>
      )}

      <div className={styles.pages}>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <Link
              key={p}
              href={getHref(p)}
              className={`${styles.page} ${p === currentPage ? styles.active : ""}`}
            >
              {String(p).padStart(2, "0")}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link href={getHref(currentPage + 1)} className={styles.arrow}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      ) : (
        <span className={`${styles.arrow} ${styles.disabled}`}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </span>
      )}
    </nav>
  );
}
