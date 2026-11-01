import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import GenderProducts from "../components/GenderProducts/GenderProducts";
import { getProductsByGender } from "../lib/storefrontProducts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mode homme",
  description:
    "Découvrez la collection homme Aighis Byrca : vêtements, nouveautés et pièces de saison.",
  alternates: { canonical: "/men" },
};

export default async function MenPage() {
  const products = await getProductsByGender("men");

  return (
    <>
      <Navbar compact />
      <GenderProducts gender="men" products={products} />
      <Footer />
    </>
  );
}
