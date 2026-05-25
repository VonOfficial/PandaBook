import { useEffect, useMemo, useState } from "react";

import type { Book } from "../types/Book";
import { BookCard } from "../components/BookCard";
import { FeaturedBook } from "../components/FeaturedBook";

type HomePageProps = {
  search: string;
};

const categories = ["Манга", "Фэнтези", "Приключения", "Фантастика", "Ужасы"];

function formatBookFromApi(item: any): Book {
  return {
    id: item.id,
    title: item.title,
    author: item.author,
    publisher: item.publisher || "",
    description: item.description || "",

    price: parseFloat(item.price),
    premium_price: item.premium_price ? parseFloat(item.premium_price) : null,
    is_premium: item.is_premium,

    pages: item.pages,
    reading_time: item.reading_time || "",
    reviews_count: item.reviews_count || 0,

    rating: item.rating || 0,
    cover: item.cover,

    category: item.category,
    categories: item.categories || [],

    images: item.images || [],
  };
}

export function HomePage({ search }: HomePageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/books/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Не удалось загрузить книги");
        }

        return response.json();
      })
      .then((data: any[]) => {
        setBooks(data.map(formatBookFromApi));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки книг:", error);
        setLoading(false);
      });
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return books;
    }

    return books.filter((book) => {
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    });
  }, [search, books]);

  const featuredBook = useMemo(() => {
    if (books.length === 0) {
      return null;
    }

    return [...books].sort((firstBook, secondBook) => {
      const ratingDifference = secondBook.rating - firstBook.rating;

      if (ratingDifference !== 0) {
        return ratingDifference;
      }

      return secondBook.reviews_count - firstBook.reviews_count;
    })[0];
  }, [books]);

  if (loading) {
    return <main className="page">Загрузка библиотеки PandaBook...</main>;
  }

  return (
    <main className="page">
      <div className="breadcrumbs">Главная &gt;</div>

      <div className="content-layout">
        <div className="main-content">
          <h1 className="section-title">Популярное и рекомендуемое</h1>

          {featuredBook && <FeaturedBook book={featuredBook} />}

          <h2 className="section-title section-title--books">Все книги</h2>

          <div className="books-grid">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <h2 className="sidebar__title">Категории</h2>
          <p className="sidebar__count">{categories.length} категорий</p>

          <div className="sidebar__list">
            {categories.map((category) => (
              <button className="sidebar__category" key={category}>
                {category}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
