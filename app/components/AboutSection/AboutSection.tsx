import Image from "next/image";
import styles from "./AboutSection.module.css";

export default function AboutSection() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.imageCol}>
          <div className={styles.imageWrap}>
            <Image
              src="/assets/aighis_byrca_sea.png"
              alt="Aighis Byrca"
              fill
              className={styles.image}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className={styles.textCol}>
          <h2 className={styles.heading}>
            Where Strength<br />Meets Elegance
          </h2>

          <p className={styles.paragraph}>
            Aighis Byrca was born from a vision where every garment becomes a
            symbol of self-mastery. Inspired by the timeless principles of
            stoic philosophy, the brand speaks to those who remain composed in
            chaos, disciplined in ambition, and unwavering in the pursuit of
            greatness.
          </p>

          <p className={styles.paragraph}>
            Every piece is designed for individuals who understand that true
            power lies not in dominating others, but in mastering oneself.
            This is not fashion made to follow trends, it is fashion created
            for those who lead, inspire, and leave a lasting mark.
          </p>
        </div>
      </div>
    </section>
  );
}
