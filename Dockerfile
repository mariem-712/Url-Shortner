# ========= Stage 1: Base (PHP + Extensions) =========
FROM php:8.2-cli-alpine AS base

RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml zip


# ========= Stage 2: Builder (Composer + Vendor) =========
FROM base AS builder

# Installing Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# for caching
COPY composer.json composer.lock ./

# dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts
COPY . .
RUN composer run-script post-autoload-dump




# ========= Stage 3: Runtime (Final Image) =========
FROM base AS runtime

WORKDIR /app

# Copy app (with vendor) from builder
COPY --from=builder /app /app

EXPOSE 8080

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]

