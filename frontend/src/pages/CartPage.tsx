import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function getBookWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "книг";
  }

  if (lastDigit === 1) {
    return "книга";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "книги";
  }

  return "книг";
}

function getCartCountText(bookCount: number, mangaCount: number) {
  const parts: string[] = [];

  if (bookCount > 0) {
    parts.push(`${bookCount} ${getBookWord(bookCount)}`);
  }

  if (mangaCount > 0) {
    parts.push(`${mangaCount} манга`);
  }

  return parts.join(" и ");
}

function getBaseTitle(title: string) {
  return title.replace(" — Premium Edition", "");
}

export function CartPage() {
  const { items, totalPrice, removeItem } = useCart();

  const bookCount = items.filter((item) => item.productType === "book").length;
  const mangaCount = items.filter(
    (item) => item.productType === "manga",
  ).length;

  const cartCountText = getCartCountText(bookCount, mangaCount);

  const duplicatedBookIds = items
    .map((item) => item.bookId)
    .filter((bookId, index, array) => array.indexOf(bookId) !== index);

  const uniqueDuplicatedBookIds = Array.from(new Set(duplicatedBookIds));

  const hasEditionConflict = uniqueDuplicatedBookIds.length > 0;

  const conflictBaseTitles = uniqueDuplicatedBookIds.map((bookId) => {
    const conflictItem = items.find((item) => item.bookId === bookId);

    if (!conflictItem) {
      return "";
    }

    return conflictItem.baseTitle || getBaseTitle(conflictItem.title);
  });

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link> &gt; Корзина
        </div>

        <h1 className="cart-page__title">Ваша корзина</h1>

        <div className="cart-empty">
          <p>Корзина пока пустая.</p>

          <Link to="/" className="cart-empty__button">
            Продолжить покупки
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link> &gt; Корзина
      </div>

      <h1 className="cart-page__title">Ваша корзина</h1>

      <div className="cart-layout">
        <section className="cart-items">
          {items.map((item) => {
            const baseTitle = item.baseTitle || getBaseTitle(item.title);

            return (
              <article
                className={
                  item.editionType === "premium"
                    ? "cart-item cart-item--premium"
                    : "cart-item"
                }
                key={item.id}
              >
                {item.badgeText && (
                  <div className="cart-item__badge">
                    <span>{item.badgeText}</span>
                    <img
                      className="cart-item__badge-icon"
                      src="/icons/paper-book-icon.png"
                      alt=""
                      draggable={false}
                    />
                  </div>
                )}

                <Link to={`/books/${item.bookId}`} className="cart-item__link">
                  <img
                    className="cart-item__image"
                    src={item.cover || "/no-cover.png"}
                    alt={item.title}
                    draggable={false}
                  />

                  <div className="cart-item__content">
                    <h2>{item.title}</h2>

                    <p className="cart-item__author">{item.author}</p>

                    <div className="cart-item__rating">
                      <span>★</span>
                      <span>{item.rating}</span>
                    </div>

                    <p className="cart-item__price">{item.price} ₽</p>
                  </div>
                </Link>

                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(item.id)}
                >
                  Удалить
                </button>
              </article>
            );
          })}

          {hasEditionConflict && (
            <div className="cart-page__warnings">
              <p>
                1. Нельзя добавить два издания одной книги/манги. При покупке
                Premium вы получите и стандартное издание.
              </p>

              {conflictBaseTitles.map((title, index) => (
                <p key={title}>
                  {index + 2}. Уже в корзине: {title}
                </p>
              ))}
            </div>
          )}

          <Link to="/" className="cart-page__continue">
            Продолжить покупки
          </Link>
        </section>

        <aside className="cart-summary">
          <div className="cart-summary__badge">{cartCountText}</div>

          <div className="cart-summary__total">
            <span>Общая стоимость</span>
            <strong>{totalPrice} ₽</strong>
          </div>

          <p className="cart-summary__note">
            Налог с продаж вычисляется при оформлении покупки в регионах, где он
            применим
          </p>

          <button
            className={
              hasEditionConflict
                ? "cart-summary__button cart-summary__button--disabled"
                : "cart-summary__button"
            }
            disabled={hasEditionConflict}
          >
            Перейти к оплате
          </button>

          <p className="cart-summary__license">
            При покупке цифрового товара вы получаете лицензию на продукт в
            PandaBook.
          </p>

          <p className="cart-summary__license">
            Полный текст условий использования можно найти здесь:
            <br />
            Соглашение подписчика PandaBook
          </p>
        </aside>
      </div>
    </main>
  );
}
