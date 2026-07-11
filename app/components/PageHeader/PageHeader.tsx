import styles from "./PageHeader.module.css";

interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <section className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </section>
  );
}
