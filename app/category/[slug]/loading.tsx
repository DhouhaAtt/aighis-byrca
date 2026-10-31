"use client";

import { useLocale } from "../../context/LocaleContext";

export default function CategoryLoading() {
  const { locale } = useLocale();
  return (
    <main aria-live="polite" aria-busy="true" style={{ minHeight: "60vh", padding: "18vh 8vw", textAlign: "center" }}>
      <p style={{ color: "#777", letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>
        {locale === "fr" ? "Chargement de la collection…" : "Loading collection…"}
      </p>
    </main>
  );
}
