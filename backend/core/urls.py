from django.contrib import admin
from django.urls import path, include # Убедитесь, что импортирован include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), # ДОБАВИЛИ ЭТУ СТРОКУ: подключаем наше API
]

# Код для раздачи картинок (остается на месте)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
