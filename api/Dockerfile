FROM php:8.3-fpm

RUN apt-get update && apt-get install -y git unzip libzip-dev \
  && docker-php-ext-install pdo_mysql zip \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/api

# Contexto de build é a raiz do monorepo (ver docker-compose.yml).
COPY api/ .

RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
