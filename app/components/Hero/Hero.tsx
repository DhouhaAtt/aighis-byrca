import styles from "./Hero.module.css";

import HeroImage from "../HeroImage/HeroImage";
import HeroCenter from "../HeroCenter/HeroCenter";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <HeroImage image="/assets/bg_hero_1.png" position="right" />

      {/* <HeroCenter /> */}

      <HeroImage image="/assets/bg_hero_2.png" position="left" />
    </section>
  );
}
