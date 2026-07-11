import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";

import "./globals.css";
import { LocaleProvider } from "./context/LocaleContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import LangSetter from "./components/LangSetter/LangSetter";
import { AdminAuthProvider } from "./context/AdminAuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aighis Byrca",
  description: "Luxury Fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <LocaleProvider>
          <WishlistProvider>
            <CartProvider>
              <AdminAuthProvider>
                <LangSetter />
                {children}
              </AdminAuthProvider>
            </CartProvider>
          </WishlistProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
