import { Link } from "react-router-dom";
import type { Book } from "../types/Book";

type FeaturedBookProps = {
  book: Book;
};

function cutText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trimEnd() + "...";
}

export function FeaturedBook({ book }: FeaturedBookProps) {
  return (
    <Link to={`/books/${book.id}`} className="featured-book">
      <img
        className="featured-book__image"
        src={book.cover || "/no-cover.png"}
        alt={book.title}
        draggable={false}
      />

      <div className="featured-book__content">
        <h2 className="featured-book__title">{book.title}</h2>

        <p className="featured-book__author">{book.author}</p>

        <div className="featured-book__rating">
          <span className="featured-book__star">★</span>
          <span>{book.rating}</span>
        </div>

        <p className="featured-book__description">
          {cutText(book.description, 250)}
        </p>
      </div>
    </Link>
  );
}
