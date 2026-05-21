type HeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function Header({ search, onSearchChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">
        <img src="/logo.png" alt="БУКБУК" />
      </div>

      <div className="search">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="10" r="6.5" />
          <line x1="8" y1="15" x2="4" y2="20" />
        </svg>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Книга или автор"
        />
      </div>

      <nav className="nav">
        <a className="nav__link nav__link--active" href="#">
          Библиотека
        </a>
        <a className="nav__link" href="#">
          Войти
        </a>
      </nav>
    </header>
  );
}
