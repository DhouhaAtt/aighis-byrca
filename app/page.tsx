import Image from "next/image";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import NewArrivals from "./components/NewArrivals/NewArrivals";
import Footer from "./components/Footer/Footer";
import GenderSection from "./components/GenderSection/GenderSection";
import CategoriesSection from "./components/CategoriesSection/CategoriesSection";
import AboutSection from "./components/AboutSection/AboutSection";
import OutfitBuilder from "./components/OutfitBuilder/OutfitBuilder";
import { getNewArrivals } from "./lib/storefrontProducts";

export default async function Home() {
  const newArrivals = await getNewArrivals();

  return (
    <>
      <Navbar />
      <Hero />
      <NewArrivals products={newArrivals} />

      <section style={{ width: "100%", lineHeight: 0 }}>

        
        <Image
          src="/assets/aighis_byrca_woman.png"
          alt=""
          width={2000}
          height={1000}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </section>

      <CategoriesSection />
      <GenderSection />
      <OutfitBuilder />
      <AboutSection />
      <Footer />
    </>
  );
}
