FROM php:8.3-fpm

RUN apt-get update && apt-get install -y git unzip libzip-dev \
  && docker-php-ext-install pdo_mysql zip \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/api

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data storage bootstrap/cache

CMD ["php-fpm"]
