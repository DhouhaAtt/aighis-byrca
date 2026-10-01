"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";
import styles from "./LoginPage.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      setSubmitting(true);
      const result = await login(email, password);
      setSubmitting(false);

      if (result.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError(result.error ?? "Invalid email or password");
      }
    },
    [email, password, login, router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>Aighis Byrca</div>
        <div className={styles.tagline}>Administration</div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>Aighis Byrca &copy; {new Date().getFullYear()}</div>
      </div>
    </div>
  );
}
