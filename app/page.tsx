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
import type { Metadata } from "next";
import { absoluteSiteUrl, serializeJsonLd } from "./lib/site";

export const metadata: Metadata = {
  title: "Mode élégante pour femme et homme",
  description:
    "Explorez les nouveautés et collections Aighis Byrca : des pièces de mode pour femme et homme, sélectionnées avec soin.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const newArrivals = await getNewArrivals();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Aighis Byrca",
      url: absoluteSiteUrl("/"),
      email: "aighisbyrca@gmail.com",
      sameAs: ["https://www.instagram.com/aighis_byrca/"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Aighis Byrca",
      url: absoluteSiteUrl("/"),
      inLanguage: ["fr-TN", "en"],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
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
