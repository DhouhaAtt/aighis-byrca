export type Locale = "en" | "fr";

export interface Translations {
  brand: {
    name: string;
    tagline: string;
  };
  nav: {
    top: string[];
    center: string[];
    home: string;
    search: string;
    wishlist: string;
    login: string;
  };
  home: {
    heroAlt: string;
    newArrivals: string;
    women: string;
    men: string;
    shopNow: string;
    discover: string;
  };
  categories: {
    tops: string;
    bottoms: string;
    underwear: string;
    bags: string;
    springSummer: string;
    intimate: string;
    signature: string;
  };
  products: {
    title: string;
    subtitle: string;
    filters: string[];
    breadcrumbHome: string;
    breadcrumbProducts: string;
    completeLook: string;
  };
  productDetail: {
    color: string;
    size: string;
    sizeGuide: string;
    addToCart: string;
    oneSize: string;
    productCode: string;
    addToWishlist: string;
    removeFromWishlist: string;
    description: string;
    productDetails: string;
    composition: string;
    fit: string;
    compositionCare: string;
    careInstructions: string;
    shippingReturns: string;
    shipping: string;
    returns: string;
  };
  wishlist: {
    title: string;
    empty: string;
    emptySubtitle: string;
    item: string;
    items: string;
    browseProducts: string;
  };
  cart: {
    title: string;
    empty: string;
    emptySubtitle: string;
    item: string;
    items: string;
    size: string;
    removeItem: string;
    orderSummary: string;
    subtotal: string;
    shipping: string;
    complimentary: string;
    total: string;
    checkout: string;
    continueShopping: string;
    currency: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    shippingAddress: string;
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    paymentMethod: string;
    bankTransfer: string;
    bankTransferDesc: string;
    onDelivery: string;
    onDeliveryDesc: string;
    d17: string;
    d17Desc: string;
    placeOrder: string;
    orderSummary: string;
    subtotal: string;
    shipping: string;
    complimentary: string;
    total: string;
    currency: string;
    processing: string;
    success: string;
    successMessage: string;
    backToShop: string;
    emptyCart: string;
  };
  womenPage: {
    title: string;
    subtitle: string;
  };
  menPage: {
    title: string;
    subtitle: string;
  };
  footer: {
    storeLocator: string;
    storeLocatorDesc: string;
    storeLocatorPlaceholder: string;
    search: string;
    subscribe: string;
    subscribeDesc: string;
    emailPlaceholder: string;
    confirm: string;
    privacyPolicy: string;
    services: string;
    orderTracking: string;
    returns: string;
    legalArea: string;
    contact: string;
    followUs: string;
    countryLanguage: string;
    tunisia: string;
    english: string;
    french: string;
    copyright: string;
  };
  orderTracking: {
    title: string;
    subtitle: string;
    placeholder: string;
    trackButton: string;
    orderRefLabel: string;
    statusTitle: string;
    thankYou: string;
    backToShop: string;
    contactLabel: string;
    contactPlaceholder: string;
    contactHint: string;
    trackAnother: string;
    searching: string;
    errorRequired: string;
    errorNotFound: string;
    errorGeneric: string;
    placedOn: string;
    lastUpdated: string;
    totalLabel: string;
    paymentLabel: string;
    itemsTitle: string;
    timelineTitle: string;
    quantityLabel: string;
    statuses: {
      preparing: string;
      onTheWay: string;
      delivered: string;
      notPaid: string;
      confirmed: string;
      processing: string;
    };
    statusNames: {
      Pending: string;
      Confirmed: string;
      Preparing: string;
      Ready: string;
      Shipped: string;
      Delivered: string;
      Cancelled: string;
    };
  };
  productData: {
    [key: number]: {
      name: string;
      description: string;
      composition: string;
      fit: string;
      care: string[];
    };
  };
}
