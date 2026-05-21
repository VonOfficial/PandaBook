export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  price: number; // Мы превратим строку из Django в число на фронтенде
  rating: number;
  cover: string | null; // Картинка может быть не загружена
  description: string;
  category: Category | null; // Теперь это объект из Django, а не массив строк
};
