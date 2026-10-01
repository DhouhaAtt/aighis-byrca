import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import PageHeader from "../../components/PageHeader/PageHeader";
import { categoryMap } from "../../lib/categories";
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "../../lib/storefrontProducts";
import CategoryFilterWrapper from "./CategoryFilterWrapper";
import styles from "./CategoryPage.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const info = categoryMap[slug];
  const dbCategory = info ? null : await getCategoryBySlug(slug);

  if (!info && !dbCategory) notFound();

  const products = await getProductsByCategorySlug(slug);
  const title = info?.titleEn ?? dbCategory!.name;
  const subtitle = info?.subtitleEn ?? dbCategory!.description ?? undefined;

  return (
    <>
      <Navbar compact />
      <PageHeader title={title} subtitle={subtitle} />
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