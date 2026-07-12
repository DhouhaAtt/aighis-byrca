"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

import { BRAND_NAME } from "../../lib/constants";
import { useLocale } from "../../context/LocaleContext";

export default function Footer() {
  const { t, locale, setLocale } = useLocale();

  return (
    <footer className={styles.footer}>
      {/* ========================= TOP ========================= */}

      <div className={styles.top}>
        {/* Store Locator */}

        <div className={styles.column}>
          <h3 className={styles.heading}>{t.footer.storeLocator}</h3>

          <p className={styles.description}>{t.footer.storeLocatorDesc}</p>

          <form className={styles.form}>
            <input
              type="text"
              placeholder={t.footer.storeLocatorPlaceholder}
            />

            <button>{t.footer.search}</button>
          </form>
        </div>

        {/* Brand */}

        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            {BRAND_NAME}
          </Link>
        </div>

        {/* Newsletter */}

        <div className={styles.column}>
          <h3 className={styles.heading}>{t.footer.subscribe}</h3>

          <p className={styles.description}>{t.footer.subscribeDesc}</p>

          <form className={styles.form}>
            <input
              type="email"
              placeholder={t.footer.emailPlaceholder}
            />

            <button>{t.footer.confirm}</button>
          </form>

          <label className={styles.checkbox}>
            <input type="checkbox" />

            <span>{t.footer.privacyPolicy}</span>
          </label>
        </div>
      </div>

      {/* Divider */}

      <div className={styles.line}></div>
      {/* ================= NAVIGATION ================= */}

      <div className={styles.navigation}>
        <div className={styles.links}>
          <Link href="#" className={styles.footerLink}>
            {t.footer.services}
            <span>+</span>
          </Link>

          <Link href="#" className={styles.footerLink}>
            {t.footer.orderTracking}
          </Link>

          <Link href="#" className={styles.footerLink}>
            {t.footer.returns}
          </Link>

          

          <Link href="#" className={styles.footerLink}>
            {t.footer.legalArea}
            <span>+</span>
          </Link>

          <Link href="#" className={styles.footerLink}>
            {t.footer.contact}
            <span>+</span>
          </Link>

          <Link
            href="https://www.instagram.com/aighis_byrca/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            {t.footer.followUs}
            <span>+</span>
          </Link>
        </div>

        <div className={styles.language}>
          <span className={styles.countryTitle}>{t.footer.countryLanguage}</span>

          <button
            className={styles.languageButton}
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
          >
            {t.footer.tunisia}
            <span>/</span>
            {locale === "en" ? t.footer.english : t.footer.french}
          </button>
        </div>
      </div>

      <div className={styles.line}></div>

      {/* COPYRIGHT */}

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} {BRAND_NAME}. {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
