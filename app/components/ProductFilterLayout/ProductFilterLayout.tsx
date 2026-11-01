"use client";

import { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "../../context/LocaleContext";
import { SlidersHorizontal, X } from "lucide-react";
import styles from "./ProductFilterLayout.module.css";

import ProductCard from "../ProductCard/ProductCard";
import Pagination from "../Pagination/Pagination";
import type { Product } from "../NewArrivals/products";

const PER_PAGE = 8;
const PRICE_MIN = 0;
const PRICE_MAX = 499;

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
  priceMax: PRICE_MAX,
  size: "all",
  color: "all",
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
  const toPercent = (value: number) => max === min ? 0 : ((value - min) / (max - min)) * 100;
  const leftPercent = toPercent(valueMin);
  const rightPercent = toPercent(valueMax);

  const changeMin = (rawValue: string) => {
    const value = rawValue === "" ? min : Number(rawValue);
    if (Number.isFinite(value)) onChangeMin(Math.max(min, Math.min(value, valueMax)));
  };
  const changeMax = (rawValue: string) => {
    const value = rawValue === "" ? min : Number(rawValue);
    if (Number.isFinite(value)) onChangeMax(Math.min(max, Math.max(value, valueMin)));
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.priceInputs}>
        <label className={styles.priceInputGroup}>
          <span className={styles.priceInputLabel}>Min</span>
          <span className={styles.priceInputBox}>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={valueMax}
              step={1}
              value={valueMin}
              aria-label="Minimum price in TND"
              onChange={(event) => changeMin(event.target.value)}
            />
            <span>TND</span>
          </span>
        </label>
        <label className={styles.priceInputGroup}>
          <span className={styles.priceInputLabel}>Max</span>
          <span className={styles.priceInputBox}>
            <input
              type="number"
              inputMode="numeric"
              min={valueMin}
              max={max}
              step={1}
              value={valueMax}
              aria-label="Maximum price in TND"
              onChange={(event) => changeMax(event.target.value)}
            />
            <span>TND</span>
          </span>
        </label>
      </div>

      <div
        className={styles.sliderTrack}
        style={{ backgroundImage: `linear-gradient(to right, #dedede 0%, #dedede ${leftPercent}%, #111 ${leftPercent}%, #111 ${rightPercent}%, #dedede ${rightPercent}%, #dedede 100%)` }}
      >
        <input
          className={`${styles.sliderRange} ${styles.sliderRangeMin}`}
          type="range"
          min={min}
          max={max}
          step={1}
          value={valueMin}
          aria-label="Minimum price"
          onChange={(event) => onChangeMin(Math.min(Number(event.target.value), valueMax))}
        />
        <input
          className={`${styles.sliderRange} ${styles.sliderRangeMax}`}
          type="range"
          min={min}
          max={max}
          step={1}
          value={valueMax}
          aria-label="Maximum price"
          onChange={(event) => onChangeMax(Math.max(Number(event.target.value), valueMin))}
        />
      </div>
    </div>
  );
}
/* ===================== MAIN COMPONENT ===================== */

interface Props {
  products: Product[];
}

export default function ProductFilterLayout({ products }: Props) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const requestedPage = Number(pageParam);
  const initialPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      const label = t.filters.genders[g] || g;
      return { key: g, label };
    });
  }, [products, t.filters.genders]);

  const resetPageInUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("page")) return;
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      resetPageInUrl();
    },
    [resetPageInUrl]
  );

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    resetPageInUrl();
  }, [resetPageInUrl]);

  const resetPriceRange = useCallback(() => {
    setFilters((prev) => ({ ...prev, priceMin: PRICE_MIN, priceMax: PRICE_MAX }));
    resetPageInUrl();
  }, [resetPageInUrl]);

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
  const changePage = useCallback((nextPage: number) => {
    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.max(1, Math.min(nextPage, pageCount));
    const params = new URLSearchParams(searchParams.toString());
    if (safePage === 1) params.delete("page");
    else params.set("page", String(safePage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filtered.length, pathname, router, searchParams]);
  const currentPage = Math.min(initialPage, totalPages);
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const paginated = filtered.slice(startIndex, endIndex);

  const hasActiveFilters =
    filters.gender !== "all" ||
    filters.category !== "all" ||
    filters.priceMin > PRICE_MIN ||
    filters.priceMax < PRICE_MAX ||
    filters.size !== "all" ||
    filters.color !== "all";

  const filterContent = (
    <>
      {allGenders.length > 1 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionTitle}>{t.filters.gender}</div>
          <div className={styles.filterSectionContent}>
            <button
              className={`${styles.filterItem} ${filters.gender === "all" ? styles.filterItemActive : ""}`}
              onClick={() => setFilter("gender", "all")}
            >
              {t.filters.all}
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
        <div className={styles.filterSectionTitle}>{t.filters.price}</div>
        <div className={styles.filterSectionContent}>
          <RangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            onChangeMin={(v) => setFilter("priceMin", v)}
            onChangeMax={(v) => setFilter("priceMax", v)}
          />
          {(filters.priceMin !== PRICE_MIN || filters.priceMax !== PRICE_MAX) && (
            <button type="button" className={styles.priceResetBtn} onClick={resetPriceRange}>
              {t.filters.resetPrice}
            </button>
          )}
        </div>
      </div>

      {allSizes.length > 0 && (
        <div className={styles.filterSection}>
        <div className={styles.filterSectionTitle}>{t.filters.size}</div>
          <div className={styles.filterSectionContent}>
            <button
              className={`${styles.filterItem} ${filters.size === "all" ? styles.filterItemActive : ""}`}
              onClick={() => setFilter("size", "all")}
            >
              {t.filters.all}
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
          <div className={styles.filterSectionTitle}>{t.filters.color}</div>
          <div className={styles.colorGrid}>
            <button
              className={`${styles.colorSwatch} ${filters.color === "all" ? styles.colorSwatchActive : ""}`}
              onClick={() => setFilter("color", "all")}
              title={t.filters.allColors}
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
          {t.filters.clear}
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
        {t.filters.filters}
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
          <span className={styles.drawerTitle}>{t.filters.filters}</span>
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
          {filtered.length} {filtered.length === 1 ? t.filters.product : t.filters.products}
        </div>

        {paginated.length === 0 ? (
          <div className={styles.empty}>
          <p className={styles.emptyText}>{t.filters.noProducts}</p>
            <button className={styles.resetBtn} onClick={resetFilters}>
              {t.filters.clear}
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
                  onPageChange={changePage}
                />
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}
