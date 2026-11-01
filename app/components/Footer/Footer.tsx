"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Footer.module.css";

import { BRAND_NAME } from "../../lib/constants";
import { useLocale } from "../../context/LocaleContext";

export default function Footer() {
  const { t, locale, setLocale } = useLocale();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterNotice, setNewsletterNotice] = useState("");

  const requestNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("Newsletter subscription request");
    const body = encodeURIComponent(`Please subscribe this email address to the Aighis Byrca newsletter: ${newsletterEmail}`);
    window.location.href = `mailto:aighisbyrca@gmail.com?subject=${subject}&body=${body}`;
    setNewsletterNotice(t.footer.newsletterDraftNotice);
  };

  return (
    <footer className={styles.footer}>
      {/* ========================= TOP ========================= */}

      <div className={styles.top}>
        <div className={styles.column}>
          <h3 className={styles.heading}>{t.footer.followUs}</h3>
          <div className={`${styles.socialLinks} ${styles.socialIcons}`}>
            <a href="http://instagram.com/aighis_byrca" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg className={`${styles.socialIcon} ${styles.instagramIcon}`} viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".8" />
              </svg>
              <span className={styles.socialName}>Instagram ↗</span>
            </a>
            <span role="img" aria-label="Facebook">
              <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.4 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2v3.1H10v8h3.4z" />
              </svg>
              <span className={styles.socialName}>Facebook ↗</span>
            </span>
            <span role="img" aria-label="TikTok">
              <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.6 7.2a5.4 5.4 0 0 1-3.4-1.1v7.3a5.9 5.9 0 1 1-5.9-5.9c.4 0 .8 0 1.2.1v3.3a2.8 2.8 0 1 0 1.7 2.6V2h3.2a5.4 5.4 0 0 0 3.2 3.2z" />
              </svg>
              <span className={styles.socialName}>TikTok ↗</span>
            </span>
          </div>
          <p className={styles.emailPrompt}>{t.footer.emailUs}</p>
          <div className={styles.socialLinks}>
            <a href="mailto:aighisbyrca@gmail.com">aighisbyrca@gmail.com</a>
          </div>
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

          {/* Consent checkbox hidden temporarily.
          <label className={styles.checkbox}>
            <input type="checkbox" required />

            <span>{t.footer.privacyPolicy}</span>
          </label>
          */}
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

          {/* Bottom navigation follow link hidden while the social links are shown above.
          <Link
            href="https://www.instagram.com/aighis_byrca/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            {t.footer.followUs}
            <span>+</span>
          </Link>
          */}
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
