import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import GenderProducts from "../components/GenderProducts/GenderProducts";
import { getProductsByGender } from "../lib/storefrontProducts";

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