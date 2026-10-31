"use client";

import { useState } from "react";
import { Mail, MapPin, ArrowLeft, Send, CheckCircle } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import { useLocale } from "../context/LocaleContext";

import styles from "./ContactPage.module.css";

export default function ContactPage() {
  const { t, locale } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) throw new Error("Contact message failed");
      setSent(true);
    } catch {
      setSendError(t.contactPage.sendError);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar compact />

      <PageHeader title={t.footer.contact} subtitle={t.contactPage.subtitle} />

      <section className={styles.content}>
        {sent ? (
          <div className={styles.success}>
            <CheckCircle size={48} strokeWidth={1} className={styles.successIcon} />
            <h2 className={styles.successTitle}>{t.contactPage.thankYou}</h2>
            <p className={styles.successText}>
              {t.contactPage.received}
            </p>
            <a href="/" className={styles.backLink}>
              <ArrowLeft size={14} strokeWidth={1.5} />
              {t.contactPage.backHome}
            </a>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* LEFT */}
            <div className={styles.infoCol}>
              <h2 className={styles.infoTitle}>
                {t.contactPage.title}
              </h2>
              <div className={styles.infoDivider} />
              <p className={styles.infoText}>{t.contactPage.description}</p>
              <div className={styles.infoDetails}>
                <div className={styles.infoDetail}>
                  <Mail size={16} strokeWidth={1.5} />
                  <span>contact@aighisbyrca.com</span>
                </div>
                <div className={styles.infoDetail}>
                  <MapPin size={16} strokeWidth={1.5} />
                  <span>{locale === "fr" ? "Tunis, Tunisie" : "Tunis, Tunisia"}</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.formCol}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name">
                    {t.contactPage.name}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder={t.contactPage.yourName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">
                    {t.contactPage.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder={t.contactPage.yourEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">
                    {t.contactPage.message}
                  </label>
                  <textarea
                    id="message"
                    required
                    placeholder={t.contactPage.messagePlaceholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.textarea}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={!name || !email || !message || sending}
                >
                  <Send size={14} strokeWidth={1.5} />
                  {sending ? t.contactPage.sending : t.contactPage.send}
                </button>
                {sendError && <p role="alert" className={styles.infoText}>{sendError}</p>}
              </form>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
