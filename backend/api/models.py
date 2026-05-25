from django.db import models


class Category(models.Model):
    """Модель жанра/категории книг"""

    name = models.CharField(max_length=100, verbose_name="Название жанра")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL-префикс")

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


class Book(models.Model):
    """Основная модель книги в PandaBook"""

    # Старое поле оставляем, чтобы проект не сломался.
    # Потом можно будет убрать, когда полностью перейдём на categories.
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="old_books",
        verbose_name="Категория"
    )

    # Новое поле: теперь у книги может быть несколько жанров.
    categories = models.ManyToManyField(
        Category,
        blank=True,
        related_name="books",
        verbose_name="Жанры"
    )

    title = models.CharField(max_length=255, verbose_name="Название книги")
    author = models.CharField(max_length=150, verbose_name="Автор")
    publisher = models.CharField(
        max_length=150,
        blank=True,
        default="",
        verbose_name="Издатель"
    )

    description = models.TextField(blank=True, verbose_name="Описание")

    cover = models.ImageField(
        upload_to="books/covers/",
        blank=True,
        null=True,
        verbose_name="Обложка книги"
    )

    rating = models.FloatField(default=0.0, verbose_name="Рейтинг")
    reviews_count = models.PositiveIntegerField(default=0, verbose_name="Количество отзывов")

    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена Standard")

    is_premium = models.BooleanField(default=False, verbose_name="Есть Premium-издание")
    premium_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Цена Premium"
    )

    pages = models.PositiveIntegerField(verbose_name="Количество страниц")
    reading_time = models.CharField(
        max_length=50,
        blank=True,
        default="",
        verbose_name="Время чтения"
    )

    age_rating = models.PositiveSmallIntegerField(
    blank=True,
    null=True,
    verbose_name="Возрастной рейтинг",
    help_text="Укажите только число, например 12, 16 или 18. Плюс на сайте добавится автоматически."
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Книга"
        verbose_name_plural = "Книги"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.author}"


class BookImage(models.Model):
    """Дополнительные изображения для детальной страницы книги"""

    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Книга"
    )

    image = models.ImageField(
        upload_to="books/gallery/",
        verbose_name="Изображение"
    )

    alt = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Описание картинки"
    )

    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")

    class Meta:
        verbose_name = "Изображение книги"
        verbose_name_plural = "Изображения книги"
        ordering = ["order", "id"]

    def __str__(self):
        return f"Картинка для {self.book.title}"