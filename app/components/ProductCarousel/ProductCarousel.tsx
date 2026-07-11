"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "../ProductCard/ProductCard";
import { Product } from "../NewArrivals/products";

import styles from "./ProductCarousel.module.css";

interface Props {
  products: Product[];
}

export default function ProductCarousel({ products }: Props) {
  return (
    <div className={styles.wrapper}>
      <button className={`prev-btn ${styles.arrow}`}>
        <ChevronLeft size={22} strokeWidth={1.5} />
      </button>

      <button className={`next-btn ${styles.arrow}`}>
        <ChevronRight size={22} strokeWidth={1.5} />
      </button>

      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: ".prev-btn",
          nextEl: ".next-btn",
        }}
        slidesPerView={4}
        spaceBetween={34}
        speed={700}
        breakpoints={{
          320: {
            slidesPerView: 1.2,
            spaceBetween: 18,
          },

          640: {
            slidesPerView: 2,
            spaceBetween: 22,
          },

          900: {
            slidesPerView: 3,
            spaceBetween: 26,
          },

          1400: {
            slidesPerView: 4,
            spaceBetween: 34,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
