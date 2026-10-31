"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Footer.module.css";

import { BRAND_NAME } from "../../lib/constants";
import { useLocale } from "../../context/LocaleContext";

export default function Footer() {
  const { t, locale, setLocale } = useLocale();
  const [city, setCity] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterNotice, setNewsletterNotice] = useState("");

  const searchStores = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = encodeURIComponent(`Aighis Byrca ${city.trim()}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };

  const requestNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("Newsletter subscription request");
    const body = encodeURIComponent(`Please subscribe this email address to the Aighis Byrca newsletter: ${newsletterEmail}`);
    window.location.href = `mailto:contact@aighisbyrca.com?subject=${subject}&body=${body}`;
    setNewsletterNotice(t.footer.newsletterDraftNotice);
  };

  return (
    <footer className={styles.footer}>
      {/* ========================= TOP ========================= */}

      <div className={styles.top}>
        {/* Store Locator */}

        <div className={styles.column}>
          <h3 className={styles.heading}>{t.footer.storeLocator}</h3>

          <p className={styles.description}>{t.footer.storeLocatorDesc}</p>

          <form className={styles.form} onSubmit={searchStores}>
            <input
              type="text"
              placeholder={t.footer.storeLocatorPlaceholder}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
            />

            <button type="submit">{t.footer.search}</button>
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

          <form className={styles.form} onSubmit={requestNewsletter}>
            <input
              type="email"
              placeholder={t.footer.emailPlaceholder}
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              required
            />

            <button type="submit">{t.footer.confirm}</button>
          </form>

          {newsletterNotice && <p role="status" className={styles.description}>{newsletterNotice}</p>}

          <label className={styles.checkbox}>
            <input type="checkbox" required />

            <span>{t.footer.privacyPolicy}</span>
          </label>
        </div>
      </div>

      {/* Divider */}

      <div className={styles.line}></div>
      {/* ================= NAVIGATION ================= */}

      <div className={styles.navigation}>
        <div className={styles.links}>
          <Link href="/products" className={styles.footerLink}>
            {t.footer.services}
            <span>+</span>
          </Link>

          <Link href="/order-tracking" className={styles.footerLink}>
            {t.footer.orderTracking}
          </Link>

          <Link href="/returns" className={styles.footerLink}>
            {t.footer.returns}
          </Link>

          

          <Link href="/legal" className={styles.footerLink}>
            {t.footer.legalArea}
            <span>+</span>
          </Link>

          <Link href="/contact" className={styles.footerLink}>
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
