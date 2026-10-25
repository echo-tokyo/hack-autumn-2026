# Хакатон Осень 2026, Aeza - Invoice Keeper

## Конфигурация

Основные настройки сервера лежат в файле [config.yml](./backend/config.yml)

Секреты хранятся в переменных окружения (файл `.evn` в корне)

В файле `.evn.example` лежат тестовые переменные. Скопируйте их в `.env` для тестового запуска.

## Деплой

### 1. Запустить `compose` файл

```shell
docker compose up -d --build
```

### 2. Проверить запущенные сервисы можно так

```shell
docker compose -f docker-compose.yml ps
```

### 3. Готово

Приложение будет доступно по адресу [http://217.144.184.188](http://217.144.184.188)

Swagger-документация - [http://217.144.184.188/api/v1/docs](http://217.144.184.188/api/v1/docs)

### 4. Чтобы опустить сервисы, используйте

```shell
docker compose -f docker-compose.yml down
```
