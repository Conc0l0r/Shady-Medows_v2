FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    php8.1 \
    php8.1-mysql \
    php8.1-mbstring \
    php8.1-curl

COPY . /app

WORKDIR /app

EXPOSE 8080

CMD ["php8.1", "-S", "0.0.0.0:8080", "-t", "."]