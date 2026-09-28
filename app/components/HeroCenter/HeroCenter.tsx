import Link from "next/link";
import styles from "./HeroCenter.module.css";

export default function HeroCenter() {
  return (
    <div className={styles.content}>
      <div className={styles.category}>NEW COLLECTION</div>

      <h1>
        Summer
        <br />
        Elegance
      </h1>

      <p>Discover timeless silhouettes crafted for modern luxury.</p>

      <div className={styles.actions}>
        <Link href="/products">Explore Collection</Link>

        <Link href="/women">Discover More</Link>
      </div>
    </div>
  );
}
