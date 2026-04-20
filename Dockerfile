FROM php:8.2-cli

RUN docker-php-ext-install pdo pdo_mysql mysqli

COPY . /app

WORKDIR /app

EXPOSE 8080

RUN useradd -U -u 1000 appuser && chown -R 1000:1000 /app
USER 1000

CMD php -S 0.0.0.0:${PORT:-8080} -t .