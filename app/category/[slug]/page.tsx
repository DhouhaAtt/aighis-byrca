import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { categoryMap } from "../../lib/categories";
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "../../lib/storefrontProducts";
import CategoryFilterWrapper from "./CategoryFilterWrapper";
import { absoluteSiteUrl } from "../../lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const info = categoryMap[slug];
  const dbCategory = info ? null : await getCategoryBySlug(slug);
  if (!info && !dbCategory) {
    return { title: "Catégorie introuvable", robots: { index: false, follow: false } };
  }

  const title = info?.titleFr ?? dbCategory!.name;
  const description =
    info?.subtitleFr ?? dbCategory!.description ?? `Découvrez la sélection ${title} Aighis Byrca.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      type: "website",
      title: `${title} | Aighis Byrca`,
      description,
      url: absoluteSiteUrl(`/category/${slug}`),
    },
  };
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
