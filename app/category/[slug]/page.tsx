import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import PageHeader from "../../components/PageHeader/PageHeader";
import { categoryMap, getProductsBySlug } from "../../lib/categories";
import CategoryFilterWrapper from "./CategoryFilterWrapper";
import styles from "./CategoryPage.module.css";

export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const info = categoryMap[slug];
  if (!info) notFound();

  const products = getProductsBySlug(slug);

  return (
    <>
      <Navbar compact />
      <PageHeader title={info.titleEn} subtitle={info.subtitleEn} />
      {products.length === 0 ? (
        <main className={styles.empty}>
          <p>No products found in this category.</p>
          <Link href="/products" className={styles.back}>View all products</Link>
        </main>
      ) : (
        <CategoryFilterWrapper
          products={products}
          basePath={`/category/${slug}`}
        />
      )}
      <Footer />
    </>
  );
}
