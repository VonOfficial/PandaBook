import { Link } from "react-router-dom";
import type { Book } from "../types/Book";

type BookCardProps = {
  book: Book;
};

function cutText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trimEnd() + "...";
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <img
        className="book-card__image"
        src={book.cover || "/no-cover.png"}
        alt={book.title}
      />

      <div className="book-card__info">
        <div className="book-card__top">
          <span className="book-card__rating">
            <span className="book-card__star">★</span>
            <span>{book.rating}</span>
          </span>

          <span className="book-card__price">{book.price} ₽</span>
        </div>

        <h3 className="book-card__title">{cutText(book.title, 18)}</h3>
        <p className="book-card__author">{cutText(book.author, 15)}</p>
      </div>
    </Link>
  );
}