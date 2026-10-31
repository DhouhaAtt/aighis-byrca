import type { Translations } from "./types";

export function localizeCategoryLabel(
  label: string,
  categories: Translations["categories"]
): string {
  const keyByLabel: Record<string, keyof Translations["categories"]> = {
    fashion: "fashion",
    sale: "sale",
    world: "world",
    casa: "casa",
    "new collection": "newCollection",
    tops: "tops",
    haut: "tops",
    hauts: "tops",
    bottoms: "bottoms",
    bas: "bottoms",
    underwear: "underwear",
    lingerie: "underwear",
    bags: "bags",
    sacs: "bags",
  };
  const key = keyByLabel[label.trim().toLocaleLowerCase()];
  return key ? categories[key] : label;
}
