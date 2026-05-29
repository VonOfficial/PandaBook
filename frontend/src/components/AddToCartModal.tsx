import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types/Cart";

type AddToCartModalProps = {
  item?: CartItem;
  errorMessage?: string;
  onClose: () => void;
};

export function AddToCartModal({
  item,
  errorMessage,
  onClose,
}: AddToCartModalProps) {
  const { removeItem } = useCart();

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  function handleRemove() {
    if (!item) {
      return;
    }

    removeItem(item.id);
    onClose();
  }

  return (
    <div className="cart-modal-overlay" onMouseDown={onClose}>
      <div
        className={errorMessage ? "cart-modal cart-modal--error" : "cart-modal"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="cart-modal__close" onClick={onClose}>
          x
        </button>

        {errorMessage ? (
          <>
            <h2 className="cart-modal__title">Нельзя добавить в корзину</h2>

            <p className="cart-modal__error">{errorMessage}</p>

            <button
              className="cart-modal__button cart-modal__button--dark"
              onClick={onClose}
            >
              Понятно
            </button>
          </>
        ) : (
          item && (
            <>
              <h2 className="cart-modal__title">Добавлено в корзину!</h2>

              <div className="cart-modal__item">
                <img
                  className="cart-modal__image"
                  src={item.cover || "/no-cover.png"}
                  alt={item.title}
                  draggable={false}
                />

                <div className="cart-modal__info">
                  <h3>{item.title}</h3>
                  <p className="cart-modal__author">{item.author}</p>

                  <div className="cart-modal__rating">
                    <span>★</span>
                    <span>{item.rating}</span>
                  </div>

                  <p className="cart-modal__price">{item.price} ₽</p>
                </div>

                <button className="cart-modal__remove" onClick={handleRemove}>
                  Удалить
                </button>
              </div>

              <div className="cart-modal__actions">
                <button className="cart-modal__button" onClick={onClose}>
                  Продолжить
                </button>

                <Link
                  to="/cart"
                  className="cart-modal__button cart-modal__button--dark"
                  onClick={onClose}
                >
                  Открыть корзину
                </Link>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
