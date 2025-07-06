# Этап сборки
FROM node:20-alpine as build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . ./

# Добавляем build args для API URL
ARG VITE_BACKEND_URL
ARG VITE_POCKETBASE_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

# Собираем проект с учетом переменных окружения
RUN npm run build && ls -la /app/build || echo "Build failed - build directory not created"

# Этап запуска
FROM nginx:alpine

# Копируем собранные статические файлы в папку nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
