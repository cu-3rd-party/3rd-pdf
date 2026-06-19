# Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем исходный код и собираем приложение
COPY . .
RUN npm run build

# Сервер
FROM nginx:alpine

# Копируем собранные файлы в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Добавляем базовый конфиг nginx для SPA (чтобы работал React Router, если появится)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
