# ========= Stage 1: Builder =========
FROM php:8.2-fpm-alpine AS builder

# Install dependencies & PHP extensions
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml zip

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

# Copy composer files first for caching
COPY composer.json composer.lock ./

# Install dependencies without dev packages
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy the rest of the application
COPY . .
RUN composer run-script post-autoload-dump
# ========= Stage 2: Runtime =========
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    bash \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml zip

WORKDIR /var/www

# Copy app from builder
COPY --from=builder /var/www /var/www

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache
# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]

