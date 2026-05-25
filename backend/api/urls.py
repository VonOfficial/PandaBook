from django.urls import path
from .views import get_books, get_book_detail

urlpatterns = [
    path("books/", get_books, name="book-list"),
    path("books/<int:pk>/", get_book_detail, name="book-detail"),
]