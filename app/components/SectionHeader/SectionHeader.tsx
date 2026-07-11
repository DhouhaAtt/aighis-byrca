"use client";

import styles from "./SectionHeader.module.css";
import clsx from "clsx";
import { useLocale } from "../../context/LocaleContext";

interface Props {
  tab: "women" | "men";
  setTab: (tab: "women" | "men") => void;
}

export default function SectionHeader({ tab, setTab }: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.wrapper}>
      {/* LEFT */}

      <h2 className={styles.title}>{t.home.newArrivals}</h2>

      {/* RIGHT */}

      <div className={styles.tabs}>
        <button
          onClick={() => setTab("women")}
          className={clsx(styles.tab, tab === "women" && styles.active)}
        >
          {t.home.women}
        </button>

        <button
          onClick={() => setTab("men")}
          className={clsx(styles.tab, tab === "men" && styles.active)}
        >
          {t.home.men}
        </button>
      </div>
    </div>
  );
}
