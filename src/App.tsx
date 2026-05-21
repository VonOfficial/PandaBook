import { useMemo, useState } from "react";
import "./App.css";

import { books } from "./data/books";
import { Header } from "./components/Header";
import { BookCard } from "./components/BookCard";
import { FeaturedBook } from "./components/FeaturedBook";
import { Footer } from "./components/Footer";

const categories = ["Манга", "Фэнтези", "Приключения", "Фантастика", "Ужасы"];

export default function App() {
  const [search, setSearch] = useState("");

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
  }, [search]);

  const featuredBook = books[0];

  return (
    <div className="app">
      <Header search={search} onSearchChange={setSearch} />

      <main className="page">
        <div className="breadcrumbs">Главная &gt;</div>

        <div className="content-layout">
          <div className="main-content">
            <h1 className="section-title">Популярное и рекомендуемое</h1>

            <FeaturedBook book={featuredBook} />

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

      <Footer />
    </div>
  );
}
