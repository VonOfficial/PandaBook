from rest_framework import serializers
from .models import Book, Category, BookImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class BookImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookImage
        fields = ["id", "image", "alt", "order"]


class BookSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = BookImageSerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "category",
            "categories",
            "title",
            "author",
            "publisher",
            "description",
            "price",
            "is_premium",
            "premium_price",
            "pages",
            "reading_time",
            "age_rating",
            "reviews_count",
            "cover",
            "images",
            "rating",
            "created_at",
        ]