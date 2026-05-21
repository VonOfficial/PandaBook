import type { Book } from "../types/Book";

type FeaturedBookProps = {
  book: Book;
};

export function FeaturedBook({ book }: FeaturedBookProps) {
  return (
    <section className="featured-book">
      <img className="featured-book__image" src={book.cover} alt={book.title} />

      <div className="featured-book__content">
        <h2 className="featured-book__title">{book.title}. Том 1</h2>
        <p className="featured-book__author">{book.author}</p>

        <div className="featured-book__rating">★ {book.rating}</div>

        <p className="featured-book__description">{book.description}</p>
      </div>
    </section>
  );
}