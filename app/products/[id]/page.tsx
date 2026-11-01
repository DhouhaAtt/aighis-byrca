import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductDetailHeading from "./components/ProductDetailHeading";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductAccordion from "./components/ProductAccordion";
import RelatedProducts from "./components/RelatedProducts";
import { ProductSelectionProvider } from "./components/ProductSelectionContext";
import { absoluteSiteUrl, serializeJsonLd } from "../../lib/site";

import { productDetails } from "../../lib/productData";
import type { ProductDetail } from "../../lib/productData";
import { RETURNS_INFO, SHIPPING_INFO } from "../../lib/storePolicy";
import {
  getProductById,
  getRelatedProducts,
  parseCareInstructions,
  parseColors,
  parseImages,
  parseSizes,
} from "../../lib/storefrontProducts";

import styles from "./ProductDetail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return productDetails.map((product) => ({
    id: String(product.id),
  }));
}

function toProductDetail(
  row: NonNullable<Awaited<ReturnType<typeof getProductById>>>
): ProductDetail {
  const images = parseImages(row.images);

  return {
    id: row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.originalPrice,
    isOnSale: row.isOnSale,
    category: row.category?.name.toUpperCase() || "NEW COLLECTION",
    collection: row.collection || "",
    description: row.description || "",
    composition: row.composition || "",
    fit: row.fit || "",
    productCode: row.productCode || "",
    careInstructions: parseCareInstructions(row.careInstructions),
    images: images.length > 0 ? images : [row.image],
    thumbnailImages: images.length > 0 ? images : [row.image],
    colors: parseColors(row.colors),
    sizes: parseSizes(row.sizes),
    shipping: SHIPPING_INFO,
    returns: RETURNS_INFO,
  };
}

async function getProductPageData(id: number) {
  if (!Number.isInteger(id) || id < 1) return null;
  const row = await getProductById(id);
  if (row) return { product: toProductDetail(row), stock: row.stock };

  const fallback = productDetails.find((item) => item.id === id);
  return fallback ? { product: fallback, stock: 1 } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getProductPageData(Number(id));
  if (!data) {
    return { title: "Produit introuvable", robots: { index: false, follow: false } };
  }

  const { product } = data;
  const description =
    product.description ||
    `Découvrez ${product.name} dans la collection Aighis Byrca.`;
  const image = product.colors.find((color) => color.image)?.image ?? product.images[0];

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      title: `${product.name} | Aighis Byrca`,
      description,
      url: absoluteSiteUrl(`/products/${product.id}`),
      images: image ? [{ url: image, alt: product.name }] : [],
    },
    twitter: { card: "summary_large_image", images: image ? [image] : [] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  await connection();

  const { id } = await params;
  const productId = Number(id);
  const data = await getProductPageData(productId);
  if (!data) notFound();
  const { product, stock } = data;

  const related = await getRelatedProducts(productId);
  const price = Number(
    product.price.replace(/[^\d.,]/g, "").replace(",", ".")
  );
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: [...new Set([
      ...product.images,
      ...product.colors.map((color) => color.image).filter((image): image is string => Boolean(image)),
    ])].map((image) => absoluteSiteUrl(image)),
    sku: product.productCode || undefined,
    color: product.colors.map((color) => color.name).join(", ") || undefined,
    size: product.sizes.join(", ") || undefined,
    brand: { "@type": "Brand", name: "Aighis Byrca" },
    offers: {
      "@type": "Offer",
      url: absoluteSiteUrl(`/products/${product.id}`),
      priceCurrency: "TND",
      ...(Number.isFinite(price) ? { price } : {}),
      availability: `https://schema.org/${stock > 0 ? "InStock" : "OutOfStock"}`,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productStructuredData) }}
      />
      <Navbar compact />

      <ProductDetailHeading product={product} />

      <main className={styles.page}>
        <ProductSelectionProvider key={product.id} colors={product.colors}>
          <div className={styles.layout}>
            <ProductGallery images={product.images} name={product.name} />

            <ProductInfo product={product} />
          </div>
        </ProductSelectionProvider>

        <ProductAccordion product={product} />

        <RelatedProducts products={related} />
      </main>

      <Footer />
    </>
  );
}
