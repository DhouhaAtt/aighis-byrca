"use client";

import PageHeader from "../../../components/PageHeader/PageHeader";
import { useLocale } from "../../../context/LocaleContext";
import type { ProductDetail } from "../../../lib/productData";
import Breadcrumb from "./Breadcrumb";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabel";
import { getLocalizedProductCopy } from "../../../lib/i18n/productCopy";

export default function ProductDetailHeading({ product }: { product: ProductDetail }) {
  const { t } = useLocale();
  const name = getLocalizedProductCopy(product.id, product.name, t)?.name ?? product.name;

  return (
    <>
      <PageHeader title={name} subtitle={product.collection} />
      <Breadcrumb items={[
        { label: t.products.breadcrumbHome, href: "/" },
        { label: t.products.breadcrumbProducts, href: "/products" },
        { label: localizeCategoryLabel(product.category, t.categories), href: "#" },
        { label: name },
      ]} />
    </>
  );
}
