from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer

@api_view(['GET']) # Этот эндпоинт будет отвечать только на GET-запросы
def get_books(request):
    """Возвращает список всех книг из базы данных"""
    books = Book.objects.all() # Достаем ВСЕ книги из базы
    
    # context={'request': request} ОЧЕНЬ ВАЖЕН: благодаря ему Django подставит 
    # к картинкам домен хоста (будет http://127.0.0...)
    serializer = BookSerializer(books, many=True, context={'request': request})
    
    return Response(serializer.data) # Отправляем JSON фронтенду
