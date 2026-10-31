import en from "./en";
import fr from "./fr";
import type { Translations } from "./types";

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

/**
 * Product translations are keyed by legacy catalogue IDs. Confirm the name as
 * well, so a database product reusing an ID cannot inherit another product's
 * title, description, or other details.
 */
export function getLocalizedProductCopy(
  id: number,
  sourceName: string,
  translations: Translations
): Translations["productData"][number] | undefined {
  const acceptedNames = [en.productData[id]?.name, fr.productData[id]?.name]
    .filter((name): name is string => Boolean(name))
    .map(normalizeName);

  if (!acceptedNames.includes(normalizeName(sourceName))) return undefined;
  return translations.productData[id];
}
