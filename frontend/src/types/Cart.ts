export type CartEditionType = "standard" | "premium";

export type CartProductType = "book" | "manga";

export type CartItem = {
  id: string;
  bookId: number;

  title: string;
  baseTitle: string;
  author: string;
  cover: string | null;
  rating: number;
  price: number;

  editionType: CartEditionType;
  productType: CartProductType;

  badgeText?: string;
};