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
        <a href="#">Explore Collection</a>

        <a href="#">Discover More</a>
      </div>
    </div>
  );
}
