// components/NewArrivals/products.ts

export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  hoverImage?: string;
  isOnSale?: boolean;
  originalPrice?: string;
  gender?: "women" | "men" | "unisex";
  tags?: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
}

export const womenProducts: Product[] = [
  {
    id: 1,
    name: "Silk Satin Dress",
    price: "70 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product1.png",
    gender: "women",
    tags: ["women", "summer-collection", "new-in", "fashion", "collection"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Beige", hex: "#d4b896" },
    ],
  },
  {
    id: 2,
    name: "Coffee Capri Bag",
    price: "140 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product2.png",
    gender: "women",
    tags: ["women", "summer-collection", "new-in", "fashion", "gifts"],
    sizes: ["One Size"],
    colors: [
      { name: "Brown", hex: "#8B6F4A" },
      { name: "Black", hex: "#111111" },
    ],
  },
  {
    id: 3,
    name: "Printed One-Piece Swimsuit",
    price: "45 Tnd",
    category: "ONLINE EXCLUSIVE",
    image: "/assets/products/product3.png",
    gender: "women",
    isOnSale: true,
    originalPrice: "75 Tnd",
    tags: ["women", "summer-collection", "sale", "sportswear", "fashion"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Navy", hex: "#1a2744" },
      { name: "White", hex: "#f5f5f5" },
    ],
  },
  {
    id: 4,
    name: "Seamless Comfort Bra & Brief Set",
    price: "80 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product4.png",
    gender: "women",
    tags: ["women", "new-in", "lingerie", "fashion"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#f5f5f5" },
      { name: "Beige", hex: "#d4b896" },
    ],
  },
  {
    id: 5,
    name: "Carretto Blouse",
    price: "60 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product7.png",
    gender: "women",
    isOnSale: true,
    originalPrice: "95 Tnd",
    tags: ["women", "summer-collection", "sale", "collection", "fashion"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "White", hex: "#f5f5f5" },
      { name: "Navy", hex: "#1a2744" },
    ],
  },
];

export const menProducts: Product[] = [
  {
    id: 6,
    name: "Italian Linen Shirt",
    price: "220 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product1.png",
    gender: "men",
    tags: ["men", "summer-collection", "new-in", "collection", "fashion"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#f5f5f5" },
      { name: "Beige", hex: "#d4b896" },
    ],
  },
  {
    id: 7,
    name: "Leather Sneakers",
    price: "250 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product2.png",
    gender: "men",
    isOnSale: true,
    originalPrice: "320 Tnd",
    tags: ["men", "summer-collection", "sale", "sportswear", "fashion"],
    sizes: ["One Size"],
    colors: [
      { name: "White", hex: "#f5f5f5" },
      { name: "Black", hex: "#111111" },
    ],
  },
  {
    id: 8,
    name: "Classic Belt",
    price: "120 Tnd",
    category: "ONLINE EXCLUSIVE",
    image: "/assets/products/product3.png",
    gender: "men",
    tags: ["men", "new-in", "gifts", "fashion"],
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Brown", hex: "#8B6F4A" },
    ],
  },
  {
    id: 9,
    name: "Tailored Trousers",
    price: "280 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product4.png",
    gender: "women",
    isOnSale: true,
    originalPrice: "380 Tnd",
    tags: ["men", "collection", "sale", "fashion"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Navy", hex: "#1a2744" },
    ],
  },
];

export const extraProducts: Product[] = [
  {
    id: 10,
    name: "Cashmere Turtleneck",
    price: "290 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product7.png",
    gender: "women",
    tags: ["women", "collection", "new-in", "fashion", "casa"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Beige", hex: "#d4b896" },
    ],
  },
  {
    id: 11,
    name: "Wool-blend Coat",
    price: "280 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product2.png",
    gender: "women",
    isOnSale: true,
    originalPrice: "380 Tnd",
    tags: ["women", "collection", "sale", "fashion", "world"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Brown", hex: "#8B6F4A" },
    ],
  },
  {
    id: 12,
    name: "Silk Pajama Set",
    price: "195 Tnd",
    category: "ONLINE EXCLUSIVE",
    image: "/assets/products/product3.png",
    gender: "women",
    tags: ["women", "lingerie", "gifts", "fashion"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "White", hex: "#f5f5f5" },
      { name: "Navy", hex: "#1a2744" },
    ],
  },
  {
    id: 13,
    name: "Lace Bodysuit",
    price: "95 Tnd",
    category: "ONLINE EXCLUSIVE",
    image: "/assets/categories/underwear.png",
    gender: "women",
    isOnSale: true,
    originalPrice: "140 Tnd",
    tags: ["women", "lingerie", "sale", "new-in", "fashion"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#f5f5f5" },
    ],
  },
  {
    id: 14,
    name: "Leather Crossbody Bag",
    price: "250 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product2.png",
    gender: "women",
    tags: ["women", "gifts", "new-in", "fashion", "summer-collection"],
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Brown", hex: "#8B6F4A" },
    ],
  },
  {
    id: 15,
    name: "Merino Cardigan",
    price: "150 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product3.png",
    gender: "women",
    tags: ["women", "collection", "casa", "fashion"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Beige", hex: "#d4b896" },
      { name: "Navy", hex: "#1a2744" },
    ],
  },
  {
    id: 16,
    name: "Cotton Hoodie",
    price: "110 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product4.png",
    gender: "unisex",
    tags: ["men", "women", "sportswear", "new-in", "fashion"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#f5f5f5" },
    ],
  },
  {
    id: 17,
    name: "Technical Track Pants",
    price: "135 Tnd",
    category: "ONLINE EXCLUSIVE",
    image: "/assets/products/product1.png",
    gender: "men",
    isOnSale: true,
    originalPrice: "180 Tnd",
    tags: ["men", "sportswear", "sale", "summer-collection", "fashion"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Navy", hex: "#1a2744" },
    ],
  },
  {
    id: 18,
    name: "Leather Messenger Bag",
    price: "300 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product2.png",
    gender: "men",
    tags: ["men", "gifts", "collection", "fashion", "world"],
    sizes: ["One Size"],
    colors: [
      { name: "Brown", hex: "#8B6F4A" },
      { name: "Black", hex: "#111111" },
    ],
  },
  {
    id: 19,
    name: "Silk Tie & Pocket Square Set",
    price: "80 Tnd",
    category: "NEW COLLECTION",
    image: "/assets/products/product3.png",
    gender: "men",
    tags: ["men", "gifts", "new-in", "fashion"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy", hex: "#1a2744" },
      { name: "Black", hex: "#111111" },
    ],
  },
  {
    id: 20,
    name: "Linen Shorts",
    price: "100 Tnd",
    category: "SUMMER ESSENTIALS",
    image: "/assets/products/product4.png",
    gender: "men",
    isOnSale: true,
    originalPrice: "140 Tnd",
    tags: ["men", "summer-collection", "sale", "sportswear", "fashion"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Beige", hex: "#d4b896" },
      { name: "White", hex: "#f5f5f5" },
    ],
  },
];

export const allProducts: Product[] = [...womenProducts, ...menProducts, ...extraProducts];
