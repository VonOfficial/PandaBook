import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
} from "react";
import { Link, useParams } from "react-router-dom";

import type { Book, Category } from "../types/Book";
import { BookCard } from "../components/BookCard";

const SCROLL_THUMB_WIDTH = 100;

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
    age_rating: item.age_rating ?? null,
    reviews_count: item.reviews_count || 0,

    rating: item.rating || 0,
    cover: item.cover,

    category: item.category,
    categories: item.categories || [],

    images: item.images || [],
  };
}

function getBookGenres(book: Book): Category[] {
  if (book.categories.length > 0) {
    return book.categories;
  }

  if (book.category) {
    return [book.category];
  }

  return [];
}

function getReviewsText(count: number) {
  if (count === 0) {
    return "Нет отзывов";
  }

  return `${count}`;
}

function PurchaseBlock({ title, price }: { title: string; price: number }) {
  return (
    <div className="purchase-block">
      <span className="purchase-block__title">Купить {title}</span>

      <div className="purchase-block__right">
        <span className="purchase-block__price">{price} ₽</span>
        <button className="purchase-block__button">В корзину</button>
      </div>
    </div>
  );
}

export function BookDetailPage() {
  const { id } = useParams();

  const [book, setBook] = useState<Book | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isFullscreenControlsVisible, setIsFullscreenControlsVisible] =
    useState(true);

  const [thumbScrollValue, setThumbScrollValue] = useState(0);
  const [thumbScrollMax, setThumbScrollMax] = useState(0);
  const [scrollTrackWidth, setScrollTrackWidth] = useState(0);

  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);

  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);

  const isScrollbarDraggingRef = useRef(false);
  const dragThumbOffsetRef = useRef(SCROLL_THUMB_WIDTH / 2);
  const fullscreenControlsTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    setActiveImageIndex(0);
    setThumbScrollValue(0);
    setThumbScrollMax(0);

    Promise.all([
      fetch(`http://localhost:8000/api/books/${id}/`),
      fetch("http://localhost:8000/api/books/"),
    ])
      .then(async ([bookResponse, booksResponse]) => {
        if (!bookResponse.ok || !booksResponse.ok) {
          throw new Error("Ошибка загрузки данных книги");
        }

        const bookData = await bookResponse.json();
        const booksData = await booksResponse.json();

        setBook(formatBookFromApi(bookData));
        setAllBooks(booksData.map(formatBookFromApi));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки детальной страницы:", error);
        setLoading(false);
      });
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!book) {
      return [];
    }

    const imagesFromAdmin = book.images.map((item) => ({
      id: item.id,
      src: item.image,
      alt: item.alt || book.title,
    }));

    if (imagesFromAdmin.length > 0) {
      return imagesFromAdmin;
    }

    if (book.cover) {
      return [
        {
          id: 0,
          src: book.cover,
          alt: book.title,
        },
      ];
    }

    return [];
  }, [book]);

  const updateScrollInfo = useCallback(() => {
    const thumbsElement = thumbnailsRef.current;
    const trackElement = scrollTrackRef.current;

    if (!thumbsElement || !trackElement) {
      return;
    }

    const maxScroll = Math.max(
      thumbsElement.scrollWidth - thumbsElement.clientWidth,
      0,
    );

    setThumbScrollMax(maxScroll);
    setScrollTrackWidth(trackElement.clientWidth);

    if (!isScrollbarDraggingRef.current) {
      setThumbScrollValue(Math.min(thumbsElement.scrollLeft, maxScroll));
    }
  }, []);

  const moveThumbsToScrollValue = useCallback(
    (value: number, behavior: ScrollBehavior = "auto") => {
      const thumbsElement = thumbnailsRef.current;

      if (!thumbsElement) {
        return;
      }

      const maxScroll = Math.max(
        thumbsElement.scrollWidth - thumbsElement.clientWidth,
        0,
      );

      const newScrollValue = Math.max(0, Math.min(value, maxScroll));

      thumbsElement.scrollTo({
        left: newScrollValue,
        behavior,
      });

      setThumbScrollMax(maxScroll);

      if (behavior === "auto") {
        setThumbScrollValue(newScrollValue);
      }
    },
    [],
  );

  const getScrollValueByPointer = useCallback(
    (clientX: number) => {
      const trackElement = scrollTrackRef.current;

      if (!trackElement || thumbScrollMax <= 0) {
        return 0;
      }

      const trackRect = trackElement.getBoundingClientRect();
      const availableThumbSpace = Math.max(
        trackElement.clientWidth - SCROLL_THUMB_WIDTH,
        1,
      );

      const rawThumbLeft =
        clientX - trackRect.left - dragThumbOffsetRef.current;

      const thumbLeft = Math.max(
        0,
        Math.min(rawThumbLeft, availableThumbSpace),
      );

      return (thumbScrollMax * thumbLeft) / availableThumbSpace;
    },
    [thumbScrollMax],
  );

  const scrollActiveThumbnailIntoView = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const thumbsElement = thumbnailsRef.current;

      if (!thumbsElement) {
        return;
      }

      const activeThumb = thumbsElement.children[index] as
        | HTMLElement
        | undefined;

      if (!activeThumb) {
        return;
      }

      const maxScroll = Math.max(
        thumbsElement.scrollWidth - thumbsElement.clientWidth,
        0,
      );

      let newScrollLeft = thumbsElement.scrollLeft;

      if (index === 0) {
        newScrollLeft = 0;
      } else if (index === galleryImages.length - 1) {
        newScrollLeft = maxScroll;
      } else {
        const thumbCenter =
          activeThumb.offsetLeft + activeThumb.offsetWidth / 2;
        newScrollLeft = thumbCenter - thumbsElement.clientWidth / 2;
      }

      newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));

      thumbsElement.scrollTo({
        left: newScrollLeft,
        behavior,
      });

      setThumbScrollMax(maxScroll);

      if (behavior === "auto") {
        setThumbScrollValue(newScrollLeft);
      }
    },
    [galleryImages.length],
  );

  function selectImage(index: number, behavior: ScrollBehavior = "smooth") {
    if (galleryImages.length === 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, galleryImages.length - 1));

    setActiveImageIndex(safeIndex);
    setAutoplayResetKey((value) => value + 1);

    window.requestAnimationFrame(() => {
      scrollActiveThumbnailIntoView(safeIndex, behavior);
    });
  }

  useEffect(() => {
    if (galleryImages.length <= 1) {
      return;
    }

    // В fullscreen и при наведении на главную картинку автопрокрутку отключаем
    if (isFullscreenOpen || isGalleryHovered) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (isScrollbarDraggingRef.current) {
        setAutoplayResetKey((value) => value + 1);
        return;
      }

      setActiveImageIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % galleryImages.length;

        window.requestAnimationFrame(() => {
          scrollActiveThumbnailIntoView(nextIndex, "smooth");
        });

        return nextIndex;
      });
    }, 5000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    activeImageIndex,
    autoplayResetKey,
    galleryImages.length,
    isFullscreenOpen,
    isGalleryHovered,
    scrollActiveThumbnailIntoView,
  ]);

  useEffect(() => {
    const thumbsElement = thumbnailsRef.current;

    if (!thumbsElement) {
      return;
    }

    updateScrollInfo();

    thumbsElement.addEventListener("scroll", updateScrollInfo);
    window.addEventListener("resize", updateScrollInfo);

    return () => {
      thumbsElement.removeEventListener("scroll", updateScrollInfo);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, [galleryImages.length, updateScrollInfo]);

  const relatedBooks = useMemo(() => {
    if (!book) {
      return [];
    }

    const bookGenreIds = getBookGenres(book).map((genre) => genre.id);

    const sameGenreBooks = allBooks.filter((item) => {
      if (item.id === book.id) {
        return false;
      }

      const itemGenreIds = getBookGenres(item).map((genre) => genre.id);

      return itemGenreIds.some((genreId) => bookGenreIds.includes(genreId));
    });

    const otherBooks = allBooks.filter((item) => {
      return (
        item.id !== book.id &&
        !sameGenreBooks.some((same) => same.id === item.id)
      );
    });

    return [...sameGenreBooks, ...otherBooks].slice(0, 4);
  }, [allBooks, book]);

  useEffect(() => {
    if (!isFullscreenOpen) {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isFullscreenOpen]);

  useEffect(() => {
    if (!isFullscreenOpen) {
      clearFullscreenControlsTimer();
      setIsFullscreenControlsVisible(true);
      return;
    }

    setIsFullscreenControlsVisible(true);
    startFullscreenControlsTimer();

    return () => {
      clearFullscreenControlsTimer();
    };
  }, [isFullscreenOpen]);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        setIsFullscreenOpen(false);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    function handleKeyboardNavigation(event: KeyboardEvent) {
      // Если клавишу зажали, а не нажали один раз — игнорируем
      if (event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      // Если пользователь печатает в поиске или другом поле — не мешаем
      if (isTyping) {
        return;
      }

      if (galleryImages.length <= 1) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();

        const nextIndex = (activeImageIndex + 1) % galleryImages.length;
        selectImage(nextIndex, "smooth");
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        const nextIndex =
          activeImageIndex === 0
            ? galleryImages.length - 1
            : activeImageIndex - 1;

        selectImage(nextIndex, "smooth");
      }
    }

    window.addEventListener("keydown", handleKeyboardNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [activeImageIndex, galleryImages.length]);

  if (loading) {
    return <main className="page">Загрузка книги...</main>;
  }

  if (!book) {
    return <main className="page">Книга не найдена</main>;
  }

  const activeImage = galleryImages[activeImageIndex];
  const genres = getBookGenres(book);

  const isManga = genres.some((genre) => {
    return genre.name.toLowerCase().includes("манга");
  });

  const relatedTitle = isManga ? "Похожие манга" : "Похожие книги";

  const isDescriptionLong = book.description.length > 505;

  const visibleDescription =
    isDescriptionOpen || !isDescriptionLong
      ? book.description
      : book.description.slice(0, 505).trimEnd() + "...";

  const availableThumbSpace = Math.max(
    scrollTrackWidth - SCROLL_THUMB_WIDTH,
    0,
  );

  const scrollThumbLeft =
    thumbScrollMax > 0
      ? (thumbScrollValue / thumbScrollMax) * availableThumbSpace
      : 0;

  function handleScrollbarPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();

    const target = event.target as HTMLElement;
    const thumbElement = target.closest(".book-gallery__scroll-thumb");

    if (thumbElement) {
      const thumbRect = thumbElement.getBoundingClientRect();
      dragThumbOffsetRef.current = event.clientX - thumbRect.left;
    } else {
      dragThumbOffsetRef.current = SCROLL_THUMB_WIDTH / 2;
    }

    isScrollbarDraggingRef.current = true;
    setIsScrollbarDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);

    const newScrollValue = getScrollValueByPointer(event.clientX);
    moveThumbsToScrollValue(newScrollValue);
  }

  function handleScrollbarPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isScrollbarDraggingRef.current) {
      return;
    }

    const newScrollValue = getScrollValueByPointer(event.clientX);
    moveThumbsToScrollValue(newScrollValue);
  }

  function handleScrollbarPointerUp(event: PointerEvent<HTMLDivElement>) {
    isScrollbarDraggingRef.current = false;
    setIsScrollbarDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    updateScrollInfo();
  }
  function clearFullscreenControlsTimer() {
    if (fullscreenControlsTimerRef.current !== null) {
      window.clearTimeout(fullscreenControlsTimerRef.current);
      fullscreenControlsTimerRef.current = null;
    }
  }

  function startFullscreenControlsTimer() {
    clearFullscreenControlsTimer();

    fullscreenControlsTimerRef.current = window.setTimeout(() => {
      setIsFullscreenControlsVisible(false);
    }, 3000);
  }

  function showFullscreenControlsTemporarily() {
    setIsFullscreenControlsVisible(true);
    startFullscreenControlsTimer();
  }

  function hideFullscreenControls() {
    clearFullscreenControlsTimer();
    setIsFullscreenControlsVisible(false);
  }

  function handleFullscreenMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rightEdgeSize = 24;

    if (event.clientX >= window.innerWidth - rightEdgeSize) {
      hideFullscreenControls();
      return;
    }

    showFullscreenControlsTemporarily();
  }

  function openFullscreenGallery() {
    setIsFullscreenOpen(true);
    setIsFullscreenControlsVisible(true);
    startFullscreenControlsTimer();

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => {
        console.error("Не удалось открыть полноэкранный режим:", error);
      });
    }
  }

  function closeFullscreenGallery() {
    setIsFullscreenOpen(false);
    setIsFullscreenControlsVisible(true);
    clearFullscreenControlsTimer();

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((error) => {
        console.error("Не удалось выйти из полноэкранного режима:", error);
      });
    }
  }
  function showPreviousImage() {
    if (galleryImages.length === 0) {
      return;
    }

    const nextIndex =
      activeImageIndex === 0 ? galleryImages.length - 1 : activeImageIndex - 1;

    selectImage(nextIndex, "smooth");
  }

  function showNextImage() {
    if (galleryImages.length === 0) {
      return;
    }

    const nextIndex = (activeImageIndex + 1) % galleryImages.length;

    selectImage(nextIndex, "smooth");
  }

  return (
    <main className="book-detail-page">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link> &gt; {book.title}
      </div>

      <h1 className="book-detail-title">{book.title}</h1>

      <div className="book-detail-layout">
        <section className="book-gallery">
          <div
            className="book-gallery__main"
            onMouseEnter={() => setIsGalleryHovered(true)}
            onMouseLeave={() => setIsGalleryHovered(false)}
          >
            {activeImage && (
              <>
                <img
                  src={activeImage.src}
                  alt=""
                  className="book-gallery__main-bg"
                  draggable={false}
                />

                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className="book-gallery__main-image"
                  draggable={false}
                />
              </>
            )}
            <button
              className="book-gallery__arrow book-gallery__arrow--left"
              onClick={showPreviousImage}
            >
              ‹
            </button>

            <button
              className="book-gallery__arrow book-gallery__arrow--right"
              onClick={showNextImage}
            >
              ›
            </button>

            <button
              className="book-gallery__fullscreen"
              onClick={openFullscreenGallery}
            >
              ⛶
            </button>
          </div>

          <div className="book-gallery__thumbs-area">
            <div className="book-gallery__thumbs" ref={thumbnailsRef}>
              {galleryImages.map((image, index) => (
                <button
                  className={
                    index === activeImageIndex
                      ? "book-gallery__thumb book-gallery__thumb--active"
                      : "book-gallery__thumb"
                  }
                  key={image.id}
                  onClick={() => selectImage(index, "smooth")}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                  />
                </button>
              ))}
            </div>

            <div className="book-gallery__scroll-row">
              <button
                className="book-gallery__slider-arrow"
                onClick={showPreviousImage}
              >
                ‹
              </button>

              <div
                className={
                  isScrollbarDragging
                    ? "book-gallery__scroll-track book-gallery__scroll-track--dragging"
                    : "book-gallery__scroll-track"
                }
                ref={scrollTrackRef}
                onPointerDown={handleScrollbarPointerDown}
                onPointerMove={handleScrollbarPointerMove}
                onPointerUp={handleScrollbarPointerUp}
                onPointerCancel={handleScrollbarPointerUp}
              >
                <div
                  className="book-gallery__scroll-thumb"
                  style={{
                    width: `${SCROLL_THUMB_WIDTH}px`,
                    transform: `translateX(${scrollThumbLeft}px)`,
                  }}
                />
              </div>

              <button
                className="book-gallery__slider-arrow"
                onClick={showNextImage}
              >
                ›
              </button>
            </div>
          </div>

          <div className="purchase-list">
            <PurchaseBlock title={book.title} price={book.price} />

            {book.is_premium && book.premium_price && (
              <PurchaseBlock
                title={`${book.title} — Premium Edition`}
                price={book.premium_price}
              />
            )}
          </div>
        </section>

        <aside className="book-side-info">
          <img
            className="book-side-info__cover"
            src={book.cover || "/no-cover.png"}
            alt={book.title}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          />

          <button className="book-side-info__fragment">Читать фрагмент</button>

          <div className="book-side-info__meta">
            <p>
              Издатель: <span>{book.publisher || "Не указан"}</span>
            </p>

            <p>
              Автор: <span>{book.author}</span>
            </p>

            <p>
              Отзывы: <span>{getReviewsText(book.reviews_count)}</span>
            </p>

            <p>
              Страниц: <span>{book.pages}</span>
            </p>

            <p>
              Время чтения: <span>{book.reading_time || "Не указано"}</span>
            </p>

            <p>
              Возрастной рейтинг:{" "}
              <span>
                {book.age_rating !== null ? `${book.age_rating}+` : "Не указан"}
              </span>
            </p>
          </div>
        </aside>
      </div>

      <section className="book-about">
        <h2>О книге</h2>

        <p>
          {visibleDescription}

          {isDescriptionLong && (
            <button
              className="book-about__more"
              onClick={() => setIsDescriptionOpen((value) => !value)}
            >
              {isDescriptionOpen ? "Свернуть" : "Далее"}
            </button>
          )}
        </p>
      </section>

      <section className="book-genres">
        <h2>Жанры</h2>

        <div className="book-genres__list">
          {genres.map((genre) => (
            <a href="#" key={genre.id}>
              {genre.name}
            </a>
          ))}
        </div>
      </section>

      <section className="related-books">
        <h2>{relatedTitle}</h2>

        <div className="related-books__grid">
          {relatedBooks.map((relatedBook) => (
            <BookCard book={relatedBook} key={relatedBook.id} />
          ))}
        </div>
      </section>

      <section className="book-reviews">
        <h2>Обзоры пользователей: {book.title}</h2>
      </section>

      {isFullscreenOpen && activeImage && (
        <div
          className={
            isFullscreenControlsVisible
              ? "fullscreen-gallery"
              : "fullscreen-gallery fullscreen-gallery--controls-hidden"
          }
          onMouseMove={handleFullscreenMouseMove}
          onMouseLeave={hideFullscreenControls}
        >
          <button
            className="fullscreen-gallery__close"
            onClick={closeFullscreenGallery}
          >
            ⛶
          </button>

          <button
            className="fullscreen-gallery__arrow fullscreen-gallery__arrow--left"
            onClick={showPreviousImage}
          >
            ‹
          </button>

          <img
            src={activeImage.src}
            alt=""
            className="fullscreen-gallery__bg"
            draggable={false}
          />

          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className="fullscreen-gallery__image"
            draggable={false}
          />

          <button
            className="fullscreen-gallery__arrow fullscreen-gallery__arrow--right"
            onClick={showNextImage}
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}
