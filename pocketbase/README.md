# PocketBase

Здесь будет храниться конфигурация и данные PocketBase.

## Настройка администратора

При запуске контейнера можно указать логин и пароль администратора с помощью переменных окружения:

```bash
# Использование с docker-compose
ADMIN_EMAIL=your_email@example.com ADMIN_PASSWORD=your_secure_password docker-compose up

# Или задать значения в .env файле и запустить
docker-compose up
```

По умолчанию используются следующие данные для входа:
- Email: admin@example.com
- Пароль: admin12345

Рекомендуется изменить эти данные для продакшн-окружения.

## Доступ к админ-панели

Админ-панель PocketBase доступна по адресу: http://localhost:8080/_/

**Важно**: В docker-compose порт 8080 контейнера проброшен на порт 8080 хоста.
