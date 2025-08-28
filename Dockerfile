# ========= Stage 1: Base =========
FROM php:8.2-cli-alpine AS base

RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml zip bcmath

WORKDIR /app


# ========= Stage 2: Builder =========
FROM base AS builder

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Copy composer files first (cache)
COPY composer.json composer.lock ./

RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy full app
COPY . .

RUN composer dump-autoload --optimize


# ========= Stage 3: Runtime =========
FROM base AS runtime

WORKDIR /app

COPY --from=builder /app /app

# Laravel needs write access
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8080


CMD sh -c "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8080"
