from django.db import models

class Category(models.Model):
    """Модель жанра/категории книг (например: Манга, Фэнтези)"""
    name = models.CharField(max_length=100, verbose_name="Название жанра")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL-префикс")

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


class Book(models.Model):
    """Основная модель книги в PandaBook"""
    
    # 1. Связь с категорией (Если удалить категорию, книги НЕ удалятся, а станут NULL)
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="books",
        verbose_name="Категория"
    )
    
    # 2. Текстовые поля
    title = models.CharField(max_length=255, verbose_name="Название книги")
    author = models.CharField(max_length=150, verbose_name="Автор")
    description = models.TextField(blank=True, verbose_name="Описание")

    # Поле для загрузки изображения. Картинки будут падать в папку media/books/covers/
    cover = models.ImageField(upload_to='books/covers/', blank=True, null=True, verbose_name="Обложка книги")

    rating = models.FloatField(default=0.0, verbose_name="Рейтинг")
    
    # 3. Числовые поля и цены
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    pages = models.PositiveIntegerField(verbose_name="Количество страниц")
    
    # 4. Логическое поле (флаг Да/Нет)
    is_premium = models.BooleanField(default=False, verbose_name="Премиум-книга")
    
    # 5. Даты (автоматически ставятся при создании и обновлении)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Книга"
        verbose_name_plural = "Книги"
        ordering = ['-created_at'] # Новые книги будут первыми в списке

    def __str__(self):
        return f"{self.title} — {self.author}"