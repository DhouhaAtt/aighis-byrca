"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import styles from "./ProductFilterLayout.module.css";

import ProductCard from "../ProductCard/ProductCard";
import Pagination from "../Pagination/Pagination";
import type { Product } from "../NewArrivals/products";

const PER_PAGE = 8;

interface Filters {
  gender: string;
  category: string;
  priceMin: number;
  priceMax: number;
  size: string;
  color: string;
}

const INITIAL_FILTERS: Filters = {
  gender: "all",
  category: "all",
  priceMin: 0,
  priceMax: 999,
  size: "all",
  color: "all",
};

const GENDER_MAP: Record<string, string> = {
  Women: "women",
  Men: "men",
  Unisex: "unisex",
};

const CLOTHING_SIZES_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One Size"];

function parsePrice(product: Product): number {
  const match = product.price.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/* ===================== RANGE SLIDER ===================== */

function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"min" | "max" | null>(null);

  const toPercent = (v: number) =>
    max === min ? 0 : ((v - min) / (max - min)) * 100;

  const toValue = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return valueMin;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + pct * (max - min));
  };

  const handlePointerDown = useCallback(
    (which: "min" | "max") => (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = which;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const val = toValue(e.clientX);
      if (dragging.current === "min") {
        onChangeMin(Math.min(val, valueMax));
      } else {
        onChangeMax(Math.max(val, valueMin));
      }
    },
    [valueMin, valueMax, onChangeMin, onChangeMax]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  const leftPct = toPercent(valueMin);
  const rightPct = toPercent(valueMax);

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabels}>
        <span>{valueMin} Tnd</span>
        <span>{valueMax} Tnd</span>
      </div>

      <div
        ref={trackRef}
        className={styles.sliderTrack}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className={styles.sliderFill}
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />

        <div
          className={styles.sliderThumb}
          style={{ left: `${leftPct}%` }}
          onPointerDown={handlePointerDown("min")}
        />

        <div
          className={styles.sliderThumb}
          style={{ left: `${rightPct}%` }}
          onPointerDown={handlePointerDown("max")}
        />
      </div>
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */

interface Props {
  products: Product[];
  basePath: string;
}

export default function ProductFilterLayout({ products, basePath }: Props) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const priceBounds = useMemo(() => {
    const prices = products.map(parsePrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );

  const allSizes = useMemo(() => {
    const sizes = [...new Set(products.flatMap((p) => p.sizes || []))];
    const clothing = sizes.filter((s) => !/^\d+$/.test(s));
    return CLOTHING_SIZES_ORDER.filter((s) => clothing.includes(s));
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    products.forEach((p) =>
      (p.colors || []).forEach((c) => {
        if (!map.has(c.hex)) map.set(c.hex, c);
      })
    );
    return [...map.values()];
  }, [products]);

  const allGenders = useMemo(() => {
    const genders = [...new Set(products.map((p) => p.gender).filter(Boolean) as string[])];
    return genders.map((g) => {
      const label = Object.entries(GENDER_MAP).find(([, v]) => v === g)?.[0] || g;
      return { key: g, label };
    });
  }, [products]);

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.gender !== "all" && p.gender !== filters.gender) return false;
      if (filters.category !== "all" && p.category !== filters.category) return false;
      if (filters.size !== "all" && !(p.sizes || []).includes(filters.size)) return false;
      if (filters.color !== "all" && !(p.colors || []).some((c) => c.hex === filters.color)) return false;
      const price = parsePrice(p);
      if (price < filters.priceMin || price > filters.priceMax) return false;
      return true;
    });
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const hasActiveFilters =
    filters.gender !== "all" ||
    filters.category !== "all" ||
    filters.priceMin > priceBounds.min ||
    filters.priceMax < priceBounds.max ||
    filters.size !== "all" ||
    filters.color !== "all";

  const filterContent = (
    <>
      {allGenders.length > 1 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionTitle}>Gender</div>
          <div className={styles.filterSectionContent}>
            <button
              className={`${styles.filterItem} ${filters.gender === "all" ? styles.filterItemActive : ""}`}
              onClick={() => setFilter("gender", "all")}
            >
              All
            </button>
            {allGenders.map((g) => (
              <button
                key={g.key}
                className={`${styles.filterItem} ${filters.gender === g.key ? styles.filterItemActive : ""}`}
                onClick={() => setFilter("gender", g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* {allCategories.length > 1 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionTitle}>Category</div>
          <div className={styles.filterSectionContent}>
            <button
              className={`${styles.filterItem} ${filters.category === "all" ? styles.filterItemActive : ""}`}
              onClick={() => setFilter("category", "all")}
            >
              All
            </button>
            {allCategories.map((c) => (
              <button
                key={c}
                className={`${styles.filterItem} ${filters.category === c ? styles.filterItemActive : ""}`}
                onClick={() => setFilter("category", c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )} */}

      <div className={styles.filterSection}>
        <div className={styles.filterSectionTitle}>Price</div>
        <div className={styles.filterSectionContent}>
          <RangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            onChangeMin={(v) => setFilter("priceMin", v)}
            onChangeMax={(v) => setFilter("priceMax", v)}
          />
        </div>
      </div>

      {allSizes.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionTitle}>Size</div>
          <div className={styles.filterSectionContent}>
            <button
              className={`${styles.filterItem} ${filters.size === "all" ? styles.filterItemActive : ""}`}
              onClick={() => setFilter("size", "all")}
            >
              All
            </button>
            {allSizes.map((s) => (
              <button
                key={s}
                className={`${styles.filterItem} ${filters.size === s ? styles.filterItemActive : ""}`}
                onClick={() => setFilter("size", s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {allColors.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionTitle}>Color</div>
          <div className={styles.colorGrid}>
            <button
              className={`${styles.colorSwatch} ${filters.color === "all" ? styles.colorSwatchActive : ""}`}
              onClick={() => setFilter("color", "all")}
              title="All Colors"
            >
              <span
                className={styles.colorDot}
                style={{
                  background: "conic-gradient(#111 0deg 90deg, #f5f5f5 90deg 180deg, #d4b896 180deg 270deg, #1a2744 270deg 360deg)",
                }}
              />
            </button>
            {allColors.map((c) => (
              <button
                key={c.hex}
                className={`${styles.colorSwatch} ${filters.color === c.hex ? styles.colorSwatchActive : ""}`}
                onClick={() => setFilter("color", c.hex)}
                title={c.name}
              >
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button className={styles.resetBtn} onClick={resetFilters}>
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <section className={styles.wrapper}>
      {/* MOBILE FILTER BUTTON */}
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setDrawerOpen(true)}
      >
        <SlidersHorizontal size={16} strokeWidth={1.5} />
        Filters
        {hasActiveFilters && <span className={styles.filterBadge} />}
      </button>

      {/* DESKTOP SIDEBAR */}
      <aside className={styles.sidebar}>{filterContent}</aside>

      {/* MOBILE DRAWER */}
      <div
        className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayVisible : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Filters</span>
          <button
            className={styles.drawerClose}
            onClick={() => setDrawerOpen(false)}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className={styles.drawerContent}>{filterContent}</div>
      </aside>

      {/* PRODUCTS */}
      <main className={styles.main}>
        <div className={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </div>

        {paginated.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No products match your filters.</p>
            <button className={styles.resetBtn} onClick={resetFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={styles.products}>
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={basePath}
                />
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}
