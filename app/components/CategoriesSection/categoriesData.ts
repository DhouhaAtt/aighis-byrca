export interface Category {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

export const categories: Category[] = [
  {
    id: 1,
    title: "Tops",
    subtitle: "Spring-Summer 2025",
    image: "/assets/categories/tops.png",
    href: "/category/fashion",
  },
  {
    id: 2,
    title: "Bottoms",
    subtitle: "Spring-Summer 2025",
    image: "/assets/categories/bottoms.png",
    href: "/category/fashion",
  },
  {
    id: 3,
    title: "Underwear",
    subtitle: "Intimate Collection",
    image: "/assets/categories/underwear.png",
    href: "/category/lingerie",
  },
  {
    id: 4,
    title: "Bags",
    subtitle: "Signature Collection",
    image: "/assets/categories/bags.png",
    href: "/category/bags",
  },
];
