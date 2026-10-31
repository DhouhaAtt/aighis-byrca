import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { categoryMap } from "../../lib/categories";
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "../../lib/storefrontProducts";
import CategoryFilterWrapper from "./CategoryFilterWrapper";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const info = categoryMap[slug];
  const dbCategory = info ? null : await getCategoryBySlug(slug);

  if (!info && !dbCategory) notFound();

  const products = await getProductsByCategorySlug(slug);
  return (
    <>
      <Navbar compact />
      <CategoryFilterWrapper
        products={products}
        titleEn={info?.titleEn ?? dbCategory!.name}
        titleFr={info?.titleFr ?? dbCategory!.name}
        subtitleEn={info?.subtitleEn ?? dbCategory!.description ?? undefined}
        subtitleFr={info?.subtitleFr ?? dbCategory!.description ?? undefined}
      />
      <Footer />
    </>
  );
}
