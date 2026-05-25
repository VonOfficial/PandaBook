from django.contrib import admin
from .models import Book, Category, BookImage


class BookImageInline(admin.TabularInline):
    model = BookImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "price",
        "is_premium",
        "premium_price",
        "rating",
        "created_at",
    )

    list_filter = ("is_premium", "categories")
    search_fields = ("title", "author", "publisher")
    filter_horizontal = ("categories",)

    inlines = [BookImageInline]

    fieldsets = (
        ("Основная информация", {
            "fields": (
                "title",
                "author",
                "publisher",
                "description",
                "cover",
                "categories",
            )
        }),
        ("Характеристики", {
          "fields": (
            "pages",
            "reading_time",
            "age_rating",
            "rating",
            "reviews_count",
          )
       }),
        ("Покупка", {
            "fields": (
                "price",
                "is_premium",
                "premium_price",
            )
        }),
    )