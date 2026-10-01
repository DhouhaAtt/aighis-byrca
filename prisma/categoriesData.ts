export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
}

export const seedCategories: SeedCategory[] = [
  { name: "Fashion", slug: "fashion", description: "Curated elegance for every moment", image: "/assets/categories/fashion.png", order: 1 },
  { name: "Sale", slug: "sale", description: "Exclusive promotions on selected pieces", image: "/assets/categories/sale.png", order: 2 },
  { name: "Casa", slug: "casa", description: "The art of living", image: "/assets/categories/casa.png", order: 3 },
  { name: "World", slug: "world", description: "A global perspective on style", image: "/assets/categories/world.png", order: 4 },
  { name: "MY AB", slug: "my-ab", description: "Your exclusive Aighis Byrca experience", image: "/assets/categories/my-ab.png", order: 5 },
  { name: "Summer Collection", slug: "summer-collection", description: "Lightness for the warm days ahead", image: "/assets/categories/summer-collection.png", order: 6 },
  { name: "Bags", slug: "bags", description: "Signature Collection", image: "/assets/categories/bags.png", order: 7 },
  { name: "Gifts", slug: "gifts", description: "Find the perfect present", image: "/assets/categories/gifts.png", order: 8 },
  { name: "New In", slug: "new-in", description: "The latest additions to our collection", image: "/assets/categories/new-in.png", order: 9 },
  { name: "Women", slug: "women", description: "Elegance redefined for her", image: "/assets/categories/women.png", order: 10 },
  { name: "Men", slug: "men", description: "Refined style for him", image: "/assets/categories/men.png", order: 11 },
  { name: "Collection", slug: "collection", description: "Signature pieces from our latest line", image: "/assets/categories/collection.png", order: 12 },
  { name: "Sportswear", slug: "sportswear", description: "Performance meets luxury", image: "/assets/categories/sportswear.png", order: 13 },
  { name: "Lingerie", slug: "lingerie", description: "Intimate elegance", image: "/assets/categories/lingerie.png", order: 14 },
  { name: "Tops", slug: "tops", description: "Shirts, blouses and more", image: "/assets/categories/tops.png", order: 15 },
  { name: "Bottoms", slug: "bottoms", description: "Pants, skirts and shorts", image: "/assets/categories/bottoms.png", order: 16 },
  { name: "Underwear", slug: "underwear", description: "Intimate Collection", image: "/assets/categories/underwear.png", order: 17 },
  { name: "Online Exclusive", slug: "online-exclusive", description: "Only available online", image: "/assets/categories/online-exclusive.png", order: 18 },
];

export const LABEL_TO_CATEGORY_SLUG: Record<string, string> = {
  "NEW COLLECTION": "new-in",
  "ONLINE EXCLUSIVE": "online-exclusive",
  "SUMMER ESSENTIALS": "summer-collection",
  SALE: "sale",
};