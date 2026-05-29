import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

type HeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function Header({ search, onSearchChange }: HeaderProps) {
  const { itemsCount } = useCart();

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src="/logo.png" alt="БУКБУК" draggable={false} />
      </Link>

      <div className="search">
        <svg className="search__icon" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="13" cy="13" r="8" />
          <line x1="19" y1="19" x2="28" y2="28" />
        </svg>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Книга или автор"
        />
      </div>

      <nav className="nav">
        {itemsCount > 0 && (
          <Link to="/cart" className="nav__link nav__link--cart">
            <img
              className="nav__cart-icon"
              src="/icons/cart-icon.png"
              alt=""
              draggable={false}
            />
            <span>Корзина</span>
            <span className="nav__cart-count">{itemsCount}</span>
          </Link>
        )}

        <Link to="/library" className="nav__link">
          Библиотека
        </Link>

        <Link to="/login" className="nav__link nav__link--active">
          Войти
        </Link>
      </nav>
    </header>
  );
}
