import { useMemo, useState, useEffect } from "react";
import "./App.css";

import type { Book } from "./types/Book"; // Импортируем обновленный тип
import { Header } from "./components/Header";
import { BookCard } from "./components/BookCard";
import { FeaturedBook } from "./components/FeaturedBook";
import { Footer } from "./components/Footer";

const categories = ["Манга", "Фэнтези", "Приключения", "Фантастика", "Ужасы"];

export default function App() {
  const [search, setSearch] = useState("");
  // 1. Стейт для хранения загруженных книг из Django
  const [books, setBooks] = useState<Book[]>([]);
  // Дополнительно сделаем стейт загрузки, чтобы приложение не падало, пока ждет ответ
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Получаем данные из Django API при первой загрузке компонента
  useEffect(() => {
    fetch("http://localhost:8000/api/books/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Не удалось загрузить книги с бэкенда");
        }
        return response.json();
      })
      .then((data: any[]) => {
        // Конвертируем данные из Django под типы фронтенда (строку price преобразуем в number)
        const formattedBooks: Book[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author,
          price: parseFloat(item.price), // Из "1.00" делаем 1
          rating: item.rating || 0,
          cover: item.cover,
          description: item.description,
          category: item.category,
        }));
        setBooks(formattedBooks);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при получении книг:", error);
        setLoading(false);
      });
  }, []);

  // Поиск теперь фильтрует живой стейт `books`
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

  // Защита: пока книги грузятся, берем null, иначе первую книгу из базы
const featuredBook = books.length > 0 ? books[0] : null;

  if (loading) {
    return <div className="loading">Загрузка библиотеки PandaBook...</div>;
  }

  return (
    <div className="app">
      <Header search={search} onSearchChange={setSearch} />

      <main className="page">
        <div className="breadcrumbs">Главная &gt;</div>

        <div className="content-layout">
          <div className="main-content">
            <h1 className="section-title">Популярное и рекомендуемое</h1>

            {/* Рендерим главную книгу только если она загрузилась */}
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

      <Footer />
    </div>
  );
}
