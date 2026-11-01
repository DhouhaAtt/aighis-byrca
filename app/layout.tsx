import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";

import "./globals.css";
import { LocaleProvider } from "./context/LocaleContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import LangSetter from "./components/LangSetter/LangSetter";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SITE_URL } from "./lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aighis Byrca | Mode et vêtements",
    template: "%s | Aighis Byrca",
  },
  description:
    "Découvrez les collections de mode Aighis Byrca : vêtements, nouveautés et pièces pour femme et homme.",
  applicationName: "Aighis Byrca",
  openGraph: {
    type: "website",
    siteName: "Aighis Byrca",
    locale: "fr_TN",
    title: "Aighis Byrca | Mode et vêtements",
    description:
      "Découvrez les collections de mode Aighis Byrca : vêtements, nouveautés et pièces pour femme et homme.",
    images: [
      {
        url: "/assets/aighis_byrca_woman.png",
        width: 2000,
        height: 1000,
        alt: "Aighis Byrca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/aighis_byrca_woman.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
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
