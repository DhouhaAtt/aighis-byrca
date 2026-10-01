import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import GenderProducts from "../components/GenderProducts/GenderProducts";
import { getProductsByGender } from "../lib/storefrontProducts";

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