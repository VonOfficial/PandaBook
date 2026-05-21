from django.contrib import admin
from .models import Category, Book

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)} # Автоматически заполняет slug на основе имени

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'price', 'is_premium', 'created_at')
    list_filter = ('is_premium', 'category') # Фильтры справа
    search_fields = ('title', 'author') # Поиск по названию и автору
