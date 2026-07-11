"use client";

import { useState } from "react";
import { Mail, MapPin, ArrowLeft, Send, CheckCircle } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import { useLocale } from "../context/LocaleContext";

import styles from "./ContactPage.module.css";

export default function ContactPage() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className={styles.page}>
      <Navbar compact />

      <PageHeader title={t.footer.contact} subtitle="Get in touch with us" />

      <section className={styles.content}>
        {sent ? (
          <div className={styles.success}>
            <CheckCircle size={48} strokeWidth={1} className={styles.successIcon} />
            <h2 className={styles.successTitle}>Thank You</h2>
            <p className={styles.successText}>
              Your message has been received. We will get back to you shortly.
            </p>
            <a href="/" className={styles.backLink}>
              <ArrowLeft size={14} strokeWidth={1.5} />
              Back to Home
            </a>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* LEFT */}
            <div className={styles.infoCol}>
              <h2 className={styles.infoTitle}>
                We&apos;d love<br />to hear from you
              </h2>
              <div className={styles.infoDivider} />
              <p className={styles.infoText}>
                Whether you have a question about our collections, need styling
                advice, or simply want to share your thoughts — we&apos;re here
                for you.
              </p>
              <div className={styles.infoDetails}>
                <div className={styles.infoDetail}>
                  <Mail size={16} strokeWidth={1.5} />
                  <span>contact@aighisbyrca.com</span>
                </div>
                <div className={styles.infoDetail}>
                  <MapPin size={16} strokeWidth={1.5} />
                  <span>Tunis, Tunisia</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.formCol}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.textarea}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={!name || !email || !message}
                >
                  <Send size={14} strokeWidth={1.5} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
