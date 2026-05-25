export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type BookImage = {
  id: number;
  image: string;
  alt: string;
  order: number;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  description: string;

  price: number;
  premium_price: number | null;
  is_premium: boolean;

  pages: number;
  reading_time: string;
  age_rating: number | null;
  reviews_count: number;

  rating: number;
  cover: string | null;

  category: Category | null;
  categories: Category[];

  images: BookImage[];
};