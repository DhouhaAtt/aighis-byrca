export interface ProductDetail {
  id: number;
  name: string;
  price: string;
  category: string;
  collection: string;
  description: string;
  composition: string;
  fit: string;
  productCode: string;
  careInstructions: string[];
  images: string[];
  thumbnailImages: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  shipping: string;
  returns: string;
}

export const productDetails: ProductDetail[] = [
  {
    id: 1,
    name: "Silk Satin Dress",
    price: "70 Tnd",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "A refined silk satin dress with a fluid silhouette, designed for effortless elegance. The delicate fabric catches the light with every movement, creating a subtle interplay of sheen and shadow.",
    composition:
      "100% Silk Satin. Lining: 100% Cupro. Buttons: mother of pearl.",
    fit: "Regular fit. The model is 178 cm and wears a size S.",
    productCode: "AB1D3FS1O1HF6CK",
    careInstructions: [
      "Dry clean only",
      "Do not bleach",
      "Iron at low temperature",
      "Do not tumble dry",
    ],
    images: [
      "/assets/products/product1.png",
      "/assets/products/product1.png",
      "/assets/products/product1.png",
      "/assets/products/product1.png",
    ],
    thumbnailImages: [
      "/assets/products/product1.png",
      "/assets/products/product1.png",
    ],
    colors: [
      { name: "Multicolor", hex: "#d4a574" },
      { name: "Black", hex: "#111111" },
      { name: "Ivory", hex: "#f5f0e8" },
    ],
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 2,
    name: "Coffee Capri Bag",
    price: "140 Tnd",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "An artisanal leather bag crafted in limited quantities. The supple full-grain leather develops a unique patina over time, making each piece truly one of a kind.",
    composition:
      "Outer: 100% Calfskin Leather. Lining: 100% Cotton. Hardware: Brass with palladium finish.",
    fit: "Dimensions: 28 x 18 x 8 cm. Handle drop: 12 cm. Adjustable shoulder strap: 100-120 cm.",
    productCode: "AB2D3FS2O1HF6CK",
    careInstructions: [
      "Wipe with a soft dry cloth",
      "Avoid prolonged exposure to sunlight",
      "Store in dust bag",
      "Keep away from water and solvents",
    ],
    images: [
      "/assets/products/product2.png",
      "/assets/products/product2.png",
      "/assets/products/product2.png",
    ],
    thumbnailImages: [
      "/assets/products/product2.png",
    ],
    colors: [
      { name: "Brown", hex: "#8B6F4A" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: ["One Size"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 3,
    name: "Printed One-Piece Swimsuit",
    price: "45 Tnd",
    category: "ONLINE EXCLUSIVE",
    collection: "Summer 2025",
    description:
      "A vibrant printed one-piece swimsuit that seamlessly transitions from poolside to beach club. The quick-dry fabric ensures all-day comfort under the sun.",
    composition:
      "80% Polyamide, 20% Elastane. Lining: 100% Polyamide.",
    fit: "Tight fit. The model is 175 cm and wears a size S.",
    productCode: "AB3D3FS3O1HF6CK",
    careInstructions: [
      "Rinse immediately after use",
      "Hand wash cold",
      "Do not bleach",
      "Dry in shade",
    ],
    images: [
      "/assets/products/product3.png",
      "/assets/products/product3.png",
      "/assets/products/product3.png",
    ],
    thumbnailImages: [
      "/assets/products/product3.png",
    ],
    colors: [
      { name: "Multicolor", hex: "#e8a87c" },
      { name: "Navy", hex: "#1a2744" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 4,
    name: "Seamless Comfort Bra & Brief Set",
    price: "80 Tnd",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "Engineered for absolute comfort without compromising on aesthetics. The seamless construction provides a second-skin feel while maintaining a refined silhouette.",
    composition:
      "72% Polyamide, 28% Elastane. Gusset lining: 100% Cotton.",
    fit: "True to size. Designed for a barely-there feel.",
    productCode: "AB4D3FS4O1HF6CK",
    careInstructions: [
      "Hand wash cold",
      "Do not bleach",
      "Do not tumble dry",
      "Lay flat to dry",
    ],
    images: [
      "/assets/products/product4.png",
      "/assets/products/product4.png",
      "/assets/products/product4.png",
    ],
    thumbnailImages: [
      "/assets/products/product4.png",
    ],
    colors: [
      { name: "Nude", hex: "#d4c4b0" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 5,
    name: "Carretto Blouse",
    price: "60 Tnd",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "An artisanal blouse featuring our signature Carretto print. The lightweight poplin fabric offers an airy feel, perfect for warm-weather dressing.",
    composition:
      "100% Cotton Poplin. Buttons: natural corozo.",
    fit: "Relaxed fit. The model is 176 cm and wears a size S.",
    productCode: "AB5D3FS5O1HF6CK",
    careInstructions: [
      "Machine wash cold at 30°C",
      "Do not bleach",
      "Iron medium heat",
      "Do not tumble dry",
    ],
    images: [
      "/assets/products/product1.png",
      "/assets/products/product1.png",
      "/assets/products/product1.png",
    ],
    thumbnailImages: [
      "/assets/products/product1.png",
    ],
    colors: [
      { name: "Multicolor", hex: "#d4a574" },
      { name: "White", hex: "#ffffff" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 6,
    name: "Italian Linen Shirt",
    price: "€790",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "A masterfully tailored linen shirt crafted from the finest Italian flax. The natural fibers provide exceptional breathability and a distinctive texture that softens with each wear.",
    composition:
      "100% Linen. Buttons: natural corozo.",
    fit: "Regular fit. The model is 185 cm and wears a size M.",
    productCode: "AB6D3FS6O1HF6CK",
    careInstructions: [
      "Machine wash cold",
      "Do not bleach",
      "Iron medium heat",
      "Hang to dry",
    ],
    images: [
      "/assets/products/product1.png",
      "/assets/products/product1.png",
    ],
    thumbnailImages: [
      "/assets/products/product1.png",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Azure", hex: "#7ba7c4" },
      { name: "Pink", hex: "#e8b4b4" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 7,
    name: "Leather Sneakers",
    price: "€895",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "A sleek pair of leather sneakers handcrafted in Italy. The supple calfskin upper molds to the foot over time, while the rubber sole provides all-day comfort.",
    composition:
      "Upper: 100% Calfskin Leather. Lining: 100% Leather. Sole: Rubber.",
    fit: "True to size. The model is 185 cm and wears a size 42.",
    productCode: "AB7D3FS7O1HF6CK",
    careInstructions: [
      "Wipe with a damp cloth",
      "Use leather conditioner",
      "Store in dust bag",
      "Avoid water and rain",
    ],
    images: [
      "/assets/products/product2.png",
      "/assets/products/product2.png",
      "/assets/products/product2.png",
    ],
    thumbnailImages: [
      "/assets/products/product2.png",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 8,
    name: "Classic Belt",
    price: "€420",
    category: "ONLINE EXCLUSIVE",
    collection: "Summer 2025",
    description:
      "A timeless leather belt cut from a single piece of full-grain leather. The brushed brass buckle develops a warm patina, making each belt unique.",
    composition:
      "100% Calfskin Leather. Buckle: Brass with brushed finish.",
    fit: "One size fits all. Width: 3.5 cm. Adjustable from 75 cm to 110 cm.",
    productCode: "AB8D3FS8O1HF6CK",
    careInstructions: [
      "Wipe with a soft dry cloth",
      "Avoid prolonged exposure to sunlight",
      "Store flat in dust bag",
      "Keep away from water",
    ],
    images: [
      "/assets/products/product3.png",
      "/assets/products/product3.png",
    ],
    thumbnailImages: [
      "/assets/products/product3.png",
    ],
    colors: [
      { name: "Brown", hex: "#8B6F4A" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: ["One Size"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 9,
    name: "Tailored Trousers",
    price: "€980",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "Expertly tailored trousers in pure wool with a traceable supply chain. The precise cut creates a clean silhouette that moves effortlessly from desk to dinner.",
    composition:
      "100% Virgin Wool. Lining: 100% Cupro. Buttons: corozo.",
    fit: "Slim fit. The model is 185 cm and wears a size 48 (M).",
    productCode: "AB9D3FS9O1HF6CK",
    careInstructions: [
      "Dry clean only",
      "Do not bleach",
      "Iron low heat",
      "Hang to air out",
    ],
    images: [
      "/assets/products/product4.png",
      "/assets/products/product4.png",
      "/assets/products/product4.png",
    ],
    thumbnailImages: [
      "/assets/products/product4.png",
    ],
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Navy", hex: "#1a2744" },
      { name: "Beige", hex: "#e8dccc" },
    ],
    sizes: ["44", "46", "48", "50", "52", "54"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 10,
    name: "Cashmere Turtleneck",
    price: "€1,200",
    category: "NEW COLLECTION",
    collection: "Autumn 2025",
    description:
      "An exceptionally soft cashmere turtleneck with a relaxed fit. The pure Mongolian cashmere yarns provide unparalleled warmth and a subtle halo finish.",
    composition: "100% Mongolian Cashmere.",
    fit: "Relaxed fit. The model is 178 cm and wears a size S.",
    productCode: "AB10CASHTRNECK",
    careInstructions: [
      "Hand wash cold or dry clean",
      "Do not bleach",
      "Lay flat to dry",
      "Store folded",
    ],
    images: ["/assets/products/product1.png", "/assets/products/product1.png"],
    thumbnailImages: ["/assets/products/product1.png"],
    colors: [
      { name: "Camel", hex: "#c19a6b" },
      { name: "Black", hex: "#111111" },
      { name: "Oatmeal", hex: "#f5f0e1" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 11,
    name: "Wool-blend Coat",
    price: "€2,450",
    category: "NEW COLLECTION",
    collection: "Autumn 2025",
    description:
      "A sculptural wool-blend coat with clean architectural lines. The structured silhouette is balanced by a fluid drape, making it a statement piece for any wardrobe.",
    composition: "70% Virgin Wool, 30% Polyamide. Lining: 100% Cupro.",
    fit: "Oversized fit. The model is 178 cm and wears a size S.",
    productCode: "AB11WOOLCOAT",
    careInstructions: [
      "Dry clean only",
      "Do not bleach",
      "Iron low heat",
      "Store on padded hanger",
    ],
    images: ["/assets/products/product2.png", "/assets/products/product2.png"],
    thumbnailImages: ["/assets/products/product2.png"],
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Camel", hex: "#c19a6b" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 12,
    name: "Silk Pajama Set",
    price: "€680",
    category: "ONLINE EXCLUSIVE",
    collection: "Autumn 2025",
    description:
      "A luxurious silk pajama set cut from 22-momme charmeuse satin. The relaxed two-piece set transitions effortlessly from bedtime to lounging.",
    composition: "100% Silk Charmeuse. Buttons: mother of pearl.",
    fit: "Relaxed fit. The model is 175 cm and wears a size S.",
    productCode: "AB12SILKPAJAMA",
    careInstructions: [
      "Hand wash cold",
      "Do not bleach",
      "Iron low heat",
      "Do not tumble dry",
    ],
    images: ["/assets/products/product3.png", "/assets/products/product3.png", "/assets/products/product3.png"],
    thumbnailImages: ["/assets/products/product3.png"],
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Blush", hex: "#e8c4c4" },
      { name: "Navy", hex: "#1a2744" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 13,
    name: "Lace Bodysuit",
    price: "€340",
    category: "ONLINE EXCLUSIVE",
    collection: "Autumn 2025",
    description:
      "An intricate lace bodysuit crafted from French Calais lace. The sheer panels and delicate floral motif create a captivating interplay of reveal and conceal.",
    composition: "90% Polyamide, 10% Elastane. Gusset: 100% Cotton.",
    fit: "Tight fit. The model is 175 cm and wears a size S.",
    productCode: "AB13LACEBODY",
    careInstructions: [
      "Hand wash cold",
      "Use delicate detergent",
      "Do not wring",
      "Lay flat to dry",
    ],
    images: ["/assets/products/product5.png", "/assets/products/product5.png"],
    thumbnailImages: ["/assets/products/product5.png"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Nude", hex: "#d4c4b0" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 14,
    name: "Leather Crossbody Bag",
    price: "€1,850",
    category: "NEW COLLECTION",
    collection: "Summer 2025",
    description:
      "A compact crossbody bag in pebbled calfskin leather with a gold-tone chain strap. The structured silhouette holds essentials while making a refined statement.",
    composition: "100% Calfskin Leather. Lining: 100% Suede. Hardware: Brass with gold finish.",
    fit: "Dimensions: 22 x 15 x 6 cm. Strap drop: 55 cm.",
    productCode: "AB14CROSSBODY",
    careInstructions: [
      "Wipe with soft dry cloth",
      "Avoid direct sunlight",
      "Store in dust bag",
      "Keep away from water",
    ],
    images: ["/assets/products/product2.png", "/assets/products/product2.png", "/assets/products/product2.png"],
    thumbnailImages: ["/assets/products/product2.png"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Tan", hex: "#d2a679" },
    ],
    sizes: ["One Size"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 15,
    name: "Merino Cardigan",
    price: "€520",
    category: "NEW COLLECTION",
    collection: "Autumn 2025",
    description:
      "A finely knitted merino wool cardigan with a ribbed trim and horn buttons. The lightweight yet warm fabric makes it an ideal layering piece for trans-seasonal dressing.",
    composition: "100% Merino Wool. Buttons: horn.",
    fit: "Regular fit. The model is 176 cm and wears a size S.",
    productCode: "AB15MERINOCARD",
    careInstructions: [
      "Hand wash cold",
      "Do not bleach",
      "Lay flat to dry",
      "Store folded",
    ],
    images: ["/assets/products/product6.png", "/assets/products/product6.png"],
    thumbnailImages: ["/assets/products/product6.png"],
    colors: [
      { name: "Grey", hex: "#a09f9c" },
      { name: "Navy", hex: "#1a2744" },
      { name: "Cream", hex: "#f5f0e1" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 16,
    name: "Cotton Hoodie",
    price: "€390",
    category: "NEW COLLECTION",
    collection: "Autumn 2025",
    description:
      "A heavyweight organic cotton hoodie with a relaxed silhouette. The brushed interior and ribbed cuffs provide comfort without compromising the clean aesthetic.",
    composition: "100% Organic Cotton. Ribbing: 95% Cotton, 5% Elastane.",
    fit: "Oversized fit. The model is 185 cm and wears a size M.",
    productCode: "AB16COTHOODIE",
    careInstructions: [
      "Machine wash cold",
      "Do not bleach",
      "Tumble dry low",
      "Iron medium heat",
    ],
    images: ["/assets/products/product4.png", "/assets/products/product4.png", "/assets/products/product4.png"],
    thumbnailImages: ["/assets/products/product4.png"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Grey", hex: "#a09f9c" },
      { name: "Olive", hex: "#556b2f" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 17,
    name: "Technical Track Pants",
    price: "€480",
    category: "ONLINE EXCLUSIVE",
    collection: "Summer 2025",
    description:
      "High-performance track pants in a lightweight technical fabric. The tapered leg and zip pockets combine athletic functionality with understated style.",
    composition: "100% Recycled Polyester. Water-repellent finish.",
    fit: "Slim fit. The model is 185 cm and wears a size M.",
    productCode: "AB17TECHTPANTS",
    careInstructions: [
      "Machine wash cold",
      "Do not bleach",
      "Tumble dry low",
      "Do not iron",
    ],
    images: ["/assets/products/product1.png", "/assets/products/product1.png"],
    thumbnailImages: ["/assets/products/product1.png"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Navy", hex: "#1a2744" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 18,
    name: "Leather Messenger Bag",
    price: "€2,100",
    category: "NEW COLLECTION",
    collection: "Autumn 2025",
    description:
      "A refined messenger bag in vegetable-tanned full-grain leather. The spacious main compartment fits a laptop while the waxed canvas interior adds durability.",
    composition: "Outer: 100% Full-grain Leather. Lining: 100% Waxed Canvas. Hardware: Brass.",
    fit: "Dimensions: 38 x 28 x 10 cm. Adjustable strap: 80-140 cm.",
    productCode: "AB18MESSENGER",
    careInstructions: [
      "Wipe with damp cloth",
      "Apply leather conditioner",
      "Store in dust bag",
      "Keep away from water",
    ],
    images: ["/assets/products/product2.png", "/assets/products/product2.png", "/assets/products/product2.png"],
    thumbnailImages: ["/assets/products/product2.png"],
    colors: [
      { name: "Brown", hex: "#8B6F4A" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: ["One Size"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 19,
    name: "Silk Tie & Pocket Square Set",
    price: "€280",
    category: "NEW COLLECTION",
    collection: "Autumn 2025",
    description:
      "A refined silk tie and matching pocket square set, hand-rolled and crafted in Como, Italy. The subtle jacquard pattern adds texture to formal and business attire.",
    composition: "100% Silk Jacquard. Lining: 100% Cupro.",
    fit: "One size. Tie width: 7 cm. Tie length: 148 cm. Pocket square: 28 cm.",
    productCode: "AB19TIESET",
    careInstructions: [
      "Dry clean only",
      "Do not bleach",
      "Iron low heat",
      "Store flat or rolled",
    ],
    images: ["/assets/products/product3.png", "/assets/products/product3.png"],
    thumbnailImages: ["/assets/products/product3.png"],
    colors: [
      { name: "Navy", hex: "#1a2744" },
      { name: "Burgundy", hex: "#800020" },
    ],
    sizes: ["One Size"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
  {
    id: 20,
    name: "Linen Shorts",
    price: "€350",
    category: "SUMMER ESSENTIALS",
    collection: "Summer 2025",
    description:
      "Lightweight linen shorts cut in a generous relaxed shape. The breathable fabric and elasticated waist make them ideal for warm- leisure.",
    composition: "100% Linen. Waistband: 100% Cotton. Drawstring: 100% Cotton.",
    fit: "Relaxed fit. The model is 185 cm and wears a size M.",
    productCode: "AB20LINENSHORT",
    careInstructions: [
      "Machine wash cold",
      "Do not bleach",
      "Iron medium heat",
      "Hang to dry",
    ],
    images: ["/assets/products/product4.png", "/assets/products/product4.png"],
    thumbnailImages: ["/assets/products/product4.png"],
    colors: [
      { name: "Beige", hex: "#e8dccc" },
      { name: "Navy", hex: "#1a2744" },
      { name: "White", hex: "#ffffff" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    shipping: "Complimentary express shipping on all orders. Delivery within 2-4 business days.",
    returns: "Free returns within 30 days of delivery. Items must be unworn with tags attached.",
  },
];
