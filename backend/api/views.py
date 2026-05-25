from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Book
from .serializers import BookSerializer


@api_view(["GET"])
def get_books(request):
    """Возвращает список всех книг"""

    books = (
        Book.objects
        .select_related("category")
        .prefetch_related("categories", "images")
        .all()
    )

    serializer = BookSerializer(books, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
def get_book_detail(request, pk):
    """Возвращает одну конкретную книгу"""

    book = get_object_or_404(
        Book.objects
        .select_related("category")
        .prefetch_related("categories", "images"),
        pk=pk
    )

    serializer = BookSerializer(book, context={"request": request})
    return Response(serializer.data)