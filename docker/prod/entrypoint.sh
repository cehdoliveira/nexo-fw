#!/bin/bash
set -e

echo "🔧 Checking PHP extensions..."

# Verificar se já instalou (para evitar reinstalar toda vez)
if [ ! -f /tmp/.extensions_installed ]; then
    echo "📦 Installing PHP extensions (first run only)..."
    
    # Silenciar output e acelerar
    export DEBIAN_FRONTEND=noninteractive
    
    # Instalar dependências
    apt-get update -qq > /dev/null 2>&1
    apt-get install -y -qq --no-install-recommends \
        librdkafka-dev \
        libzip-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        git \
        unzip \
        curl \
        > /dev/null 2>&1
    
    # Configurar e instalar GD
    docker-php-ext-configure gd --with-freetype --with-jpeg > /dev/null 2>&1
    docker-php-ext-install -j$(nproc) mysqli pdo pdo_mysql zip gd > /dev/null 2>&1
    
    # Instalar Redis
    printf "\n" | pecl install redis > /dev/null 2>&1
    docker-php-ext-enable redis > /dev/null 2>&1
    
    # Instalar rdkafka
    printf "\n" | pecl install rdkafka > /dev/null 2>&1
    docker-php-ext-enable rdkafka > /dev/null 2>&1
    
    # Limpar cache
    apt-get clean > /dev/null 2>&1
    rm -rf /var/lib/apt/lists/* > /dev/null 2>&1
    
    # Marcar como instalado
    touch /tmp/.extensions_installed
    
    echo "✅ Extensions installed!"
else
    echo "✅ Extensions already installed (cached)"
fi

# Configurar Apache (sempre executar)
echo "🔧 Configuring Apache..."

a2enmod rewrite > /dev/null 2>&1

# Verificar se arquivos de configuração existem antes de habilitar
if [ -f /etc/apache2/sites-available/site.conf ]; then
    a2ensite site.conf > /dev/null 2>&1
fi

if [ -f /etc/apache2/sites-available/manager.conf ]; then
    a2ensite manager.conf > /dev/null 2>&1
fi

a2dissite 000-default.conf > /dev/null 2>&1 || true

echo "✅ Apache configured!"
echo "🚀 Starting service..."

# Executar comando original
exec "$@"
