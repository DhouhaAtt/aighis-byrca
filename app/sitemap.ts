import type { MetadataRoute } from "next";

import { categoryMap } from "./lib/categories";
import { getAllProducts } from "./lib/storefrontProducts";
import { SITE_URL } from "./lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/products",
    "/women",
    "/men",
    "/contact",
    "/terms",
    "/returns",
    "/privacy-policy",
    ...Object.keys(categoryMap).map((slug) => `/category/${slug}`),
  ];
  const products = await getAllProducts();

  return [
    ...staticPaths.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
