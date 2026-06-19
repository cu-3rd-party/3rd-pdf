FROM node:20-alpine

WORKDIR /app

# Копируем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Устанавливаем легковесный статический сервер от создателей Next.js
RUN npm install -g serve

# Копируем исходники и собираем приложение
COPY . .
RUN npm run build

EXPOSE 8790

# Запускаем serve на порту 8790, флаг -s (single) перенаправляет все запросы на index.html для роутинга
CMD ["serve", "-s", "dist", "-l", "8790"]
