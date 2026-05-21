from rest_framework import serializers
from .models import Book, Category

class CategorySerializer(serializers.ModelSerializer):
    """Превращает категории в JSON"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BookSerializer(serializers.ModelSerializer):
    """Превращает книги (включая ссылки на обложки) в JSON"""
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 
            'category', 
            'title', 
            'author', 
            'description', 
            'price', 
            'pages', 
            'is_premium', 
            'cover', 
            'rating', 
            'created_at'
        ]
