import { allProducts } from "../components/NewArrivals/products";

export interface CategoryInfo {
  slug: string;
  titleEn: string;
  titleFr: string;
  subtitleEn: string;
  subtitleFr: string;
  filter: (tags: string[]) => boolean;
}

export const categoryMap: Record<string, CategoryInfo> = {
  fashion: {
    slug: "fashion",
    titleEn: "Fashion",
    titleFr: "Mode",
    subtitleEn: "Curated elegance for every moment",
    subtitleFr: "Élégance choisie pour chaque instant",
    filter: (tags) => tags.includes("fashion"),
  },
  sale: {
    slug: "sale",
    titleEn: "Sale",
    titleFr: "Soldes",
    subtitleEn: "Exclusive promotions on selected pieces",
    subtitleFr: "Promotions exclusives sur des pièces sélectionnées",
    filter: (tags) => tags.includes("sale"),
  },
  casa: {
    slug: "casa",
    titleEn: "Casa",
    titleFr: "Casa",
    subtitleEn: "The art of living",
    subtitleFr: "L'art de vivre",
    filter: (tags) => tags.includes("fashion"),
  },
  world: {
    slug: "world",
    titleEn: "World",
    titleFr: "World",
    subtitleEn: "A global perspective on style",
    subtitleFr: "Une perspective globale du style",
    filter: (tags) => tags.includes("fashion"),
  },
  "my-ab": {
    slug: "my-ab",
    titleEn: "MY AB",
    titleFr: "MY AB",
    subtitleEn: "Your exclusive Aighis Byrca experience",
    subtitleFr: "Votre expérience exclusive Aighis Byrca",
    filter: (tags) => tags.includes("fashion"),
  },
  "summer-collection": {
    slug: "summer-collection",
    titleEn: "SUMMER COLLECTION",
    titleFr: "COLLECTION ÉTÉ",
    subtitleEn: "Lightness for the warm days ahead",
    subtitleFr: "Légèreté pour les jours ensoleillés",
    filter: (tags) => tags.includes("summer-collection"),
  },
  bags: {
    slug: "bags",
    titleEn: "Bags",
    titleFr: "Sacs",
    subtitleEn: "Signature Collection",
    subtitleFr: "Collection Signature",
    filter: (tags) => tags.includes("gifts"),
  },
  gifts: {
    slug: "gifts",
    titleEn: "Gifts",
    titleFr: "Cadeaux",
    subtitleEn: "Find the perfect present",
    subtitleFr: "Trouvez le cadeau parfait",
    filter: (tags) => tags.includes("gifts"),
  },
  "new-in": {
    slug: "new-in",
    titleEn: "NEW IN",
    titleFr: "NOUVEAUTÉS",
    subtitleEn: "The latest additions to our collection",
    subtitleFr: "Les dernières nouveautés de notre collection",
    filter: (tags) => tags.includes("new-in"),
  },
  women: {
    slug: "women",
    titleEn: "Women",
    titleFr: "Femme",
    subtitleEn: "Elegance redefined for her",
    subtitleFr: "L'élégance redéfinie pour elle",
    filter: (tags) => tags.includes("women"),
  },
  men: {
    slug: "men",
    titleEn: "Men",
    titleFr: "Homme",
    subtitleEn: "Refined style for him",
    subtitleFr: "Le style raffiné pour lui",
    filter: (tags) => tags.includes("men"),
  },
  collection: {
    slug: "collection",
    titleEn: "Collection",
    titleFr: "Collection",
    subtitleEn: "Signature pieces from our latest line",
    subtitleFr: "Pièces signatures de notre dernière ligne",
    filter: (tags) => tags.includes("collection"),
  },
  sportswear: {
    slug: "sportswear",
    titleEn: "Sportswear",
    titleFr: "Sportswear",
    subtitleEn: "Performance meets luxury",
    subtitleFr: "La performance rencontre le luxe",
    filter: (tags) => tags.includes("sportswear"),
  },
  lingerie: {
    slug: "lingerie",
    titleEn: "Lingerie",
    titleFr: "Lingerie",
    subtitleEn: "Intimate elegance",
    subtitleFr: "Élégance intime",
    filter: (tags) => tags.includes("lingerie"),
  },
};

export function getProductsBySlug(slug: string) {
  const info = categoryMap[slug];
  if (!info) return [];
  return allProducts.filter((p) => (p.tags ? info.filter(p.tags) : false));
}

export function getSlugFromLabel(label: string): string {
  const slugMap: Record<string, string> = {
    Fashion: "fashion",
    Sale: "sale",
    Casa: "casa",
    World: "world",
    "MY AB": "my-ab",
    "SUMMER COLLECTION": "summer-collection",
    GIFTS: "gifts",
    "NEW IN": "new-in",
    WOMEN: "women",
    MEN: "men",
    COLLECTION: "collection",
    SPORTSWEAR: "sportswear",
    LINGERIE: "lingerie",
    BAGS: "bags",
  };
  return slugMap[label] || "fashion";
}
