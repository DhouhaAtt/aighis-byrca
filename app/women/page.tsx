import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import GenderProducts from "../components/GenderProducts/GenderProducts";
import { getProductsByGender } from "../lib/storefrontProducts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mode femme",
  description:
    "Découvrez la collection femme Aighis Byrca : vêtements, nouveautés et pièces de saison.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage() {
  const products = await getProductsByGender("women");

  return (
    <>
      <Navbar compact />
      <GenderProducts gender="women" products={products} />
      <Footer />
    </>
  );
}
