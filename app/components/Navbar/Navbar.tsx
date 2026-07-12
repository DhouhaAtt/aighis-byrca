"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";
import { BRAND_NAME } from "../../lib/constants";
import { getSlugFromLabel } from "../../lib/categories";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useLocale } from "../../context/LocaleContext";
import { allProducts, type Product } from "../NewArrivals/products";

interface Props {
  compact?: boolean;
}

export default function Navbar({ compact = false }: Props) {
  const { items: wishlistItems } = useWishlist();
  const { totalItems: cartItems } = useCart();
  const { t } = useLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }, [query]);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) setSearchOpen(false);
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen, menuOpen]);

  return (
    <header
      className={`${styles.navbar} ${compact ? styles.compact : ""}`}
    >
      {/* SEARCH OVERLAY */}
      {searchOpen && <div className={styles.searchOverlay} onClick={() => setSearchOpen(false)} />}

      {/* SEARCH PANEL */}
      <div className={`${styles.searchPanel} ${searchOpen ? styles.searchPanelOpen : ""}`}>
        <div className={styles.searchPanelHeader}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by category or product title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchClose} onClick={() => setSearchOpen(false)}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {!query.trim() ? (
          <div className={styles.searchCategories}>
            <p className={styles.searchCategoriesLabel}>Browse by Category</p>
            <div className={styles.searchCategoriesGrid}>
              {t.nav.center.map((item) => (
                <Link
                  key={item}
                  href={`/category/${getSlugFromLabel(item)}`}
                  className={styles.searchCategoryCard}
                  onClick={() => setSearchOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.searchResults}>
            {results.length === 0 ? (
              <p className={styles.searchNoResults}>No results found</p>
            ) : (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={styles.searchResultItem}
                  onClick={() => setSearchOpen(false)}
                >
                  <div className={styles.searchResultImage}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={50}
                      height={60}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className={styles.searchResultInfo}>
                    <span className={styles.searchResultName}>{product.name}</span>
                    <span className={styles.searchResultCategory}>{product.category}</span>
                    <span className={styles.searchResultPrice}>{product.price}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />}

      {/* MOBILE MENU PANEL */}
      <div className={`${styles.menuPanel} ${menuOpen ? styles.menuPanelOpen : ""}`}>
        <div className={styles.menuPanelHeader}>
          <span className={styles.menuPanelTitle}>{BRAND_NAME}</span>
          <button className={styles.menuClose} onClick={() => setMenuOpen(false)}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <nav className={styles.menuPanelNav}>
          <Link href="/" className={styles.menuPanelLink} onClick={() => setMenuOpen(false)}>
            {t.nav.home}
          </Link>
          {t.nav.top.map((item) => (
            <Link
              key={item}
              href={`/category/${getSlugFromLabel(item)}`}
              className={styles.menuPanelLink}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          {t.nav.center.map((item) => (
            <Link
              key={item}
              href={`/category/${getSlugFromLabel(item)}`}
              className={styles.menuPanelLink}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link href="/wishlist" className={styles.menuPanelLink} onClick={() => setMenuOpen(false)}>
            {t.nav.wishlist}
          </Link>
        </nav>
      </div>

      {/* TOP BAR */}

      <div className={styles.topBar}>
        <nav className={styles.leftMenu}>
          <Link href="/" className={styles.menuItem}>
            {t.nav.home}
          </Link>
          {t.nav.top.map((item) => (
            <Link
              key={item}
              href={`/category/${getSlugFromLabel(item)}`}
              className={styles.menuItem}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className={styles.rightMenu}>
          <button className={styles.iconLink} onClick={() => setSearchOpen(true)}>
            <Search size={18} strokeWidth={1.5} />
            <span>{t.nav.search}</span>
          </button>

          <Link href="#" className={styles.textLink}>
            {t.footer.orderTracking}
          </Link>
  <Link href="/wishlist" className={styles.wishlistLink}>
            <Heart size={18} strokeWidth={1.5} />

            <span>{t.nav.wishlist}</span>

            {wishlistItems.length > 0 && (
              <span className={styles.wishlistCount}>{wishlistItems.length}</span>
            )}
          </Link>
          <Link href="#" className={styles.bag}>
            <ShoppingBag size={20} strokeWidth={1.6} />

            {cartItems > 0 && (
              <span className={styles.cartCount}>{cartItems}</span>
            )}
          </Link>

          <button className={styles.mobile} onClick={() => setMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* LOGO */}

      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          {BRAND_NAME}
        </Link>
      </div>

      {/* SECOND MENU */}

      {!compact && (
        <div className={styles.bottomBar}>
          <nav className={styles.centerMenu}>
            {t.nav.center.map((item) => (
              <Link
                href={`/category/${getSlugFromLabel(item)}`}
                key={item}
                className={styles.bottomItem}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
