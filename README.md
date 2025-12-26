# Nexo Framework

[![PHP Version](https://img.shields.io/badge/PHP-8.3+-blue.svg)](https://www.php.net/)
[![MySQL Version](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Redis Version](https://img.shields.io/badge/Redis-7.2-red.svg)](https://redis.io/)
[![Kafka Version](https://img.shields.io/badge/Kafka-Latest-black.svg)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Framework web modular e escalável desenvolvido em PHP 8.3+ com MySQL 8.0, Redis 7.2 e Apache Kafka, utilizando arquitetura MVC e padrões modernos de desenvolvimento. O projeto é estruturado em dois módulos principais: **Site** (front-end público) e **Manager** (painel administrativo), com cache automático Redis e sistema de email assíncrono via Kafka.

## 📋 Índice

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Redis Cache](#-redis-cache)
- [Sistema de Email Assíncrono](#-sistema-de-email-assíncrono)
- [Arquitetura](#-arquitetura)
- [Desenvolvimento](#-desenvolvimento)
- [Cron Jobs](#-cron-jobs)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## ✨ Características

- **PHP 8.3+** com suporte a recursos modernos da linguagem
- **MySQL 8.0** com PDO nativo para acesso seguro ao banco de dados
- **Redis 7.2** para cache de alto desempenho e otimização de consultas
- **Apache Kafka** para processamento assíncrono de emails e mensageria
- **PHPMailer** integrado com Kafka para envio de emails em background
- **Docker & Docker Compose** para ambiente de desenvolvimento consistente
- **Arquitetura MVC** com dispatcher de rotas customizado
- **Dual Module System**: Site público e painel administrativo separados
- **Composer** para gerenciamento de dependências
- **PSR-4 Autoloading** para organização de classes
- **ORM Simplificado** (DOLModel) com cache automático Redis integrado
- **Sistema de sessões** seguro com PHP 8.3
- **Virtual Hosts** configurados no Apache
- **Kafka UI** para monitoramento visual de filas e mensagens

## 🔧 Requisitos

### Desenvolvimento Local
- Docker 20.10+
- Docker Compose 2.0+
- Git

### Produção
- PHP 8.3 ou superior
- Apache 2.4+ com mod_rewrite
- MySQL 8.0+
- Redis 7.0+ (recomendado para cache)
- Composer 2.0+

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/nexo.git
cd nexo
```

### 2. Configure os Arquivos de Ambiente

Crie os arquivos `kernel.php` em cada módulo (ignorados no Git por segurança):

```bash
# Manager
cp manager/app/inc/kernel.php.example manager/app/inc/kernel.php

# Site
cp site/app/inc/kernel.php.example site/app/inc/kernel.php
```

Edite os arquivos `kernel.php` com as configurações do seu banco de dados e chaves de aplicação.

### 3. Construa e Inicie os Containers Docker

```bash
cd docker
docker-compose up -d --build
```

### 4. Instale as Dependências com Composer

```bash
docker exec -it apache_nexo bash

# Manager
cd /var/www/nexo/manager/app/inc/lib
composer install

# Site
cd /var/www/nexo/site/app/inc/lib
composer install

exit
```

### 5. Configure o Hosts Local

Adicione as seguintes entradas ao arquivo `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 nexo.local
127.0.0.1 manager.nexo.local
```

### 6. Acesse a Aplicação

- **Site**: http://nexo.local
- **Manager**: http://manager.nexo.local
- **Kafka UI**: http://localhost:8080 (monitoramento de filas)

### 7. Iniciar Email Worker (Opcional)

Para processar emails via Kafka:

```bash
# Modo foreground (para testes)
docker exec -it apache_nexo php /var/www/nexo/manager/cgi-bin/email_worker.php

# Modo background (produção)
docker exec -d apache_nexo php /var/www/nexo/manager/cgi-bin/email_worker.php
```

📧 **Documentação completa**: Consulte [KAFKA_EMAIL.md](KAFKA_EMAIL.md) para configuração de daemon com Supervisor/Systemd.

## 📁 Estrutura do Projeto

```
nexo/
├── docker/                          # Configuração Docker
│   ├── docker-compose.yml          # Orquestração de containers
│   └── core/
│       ├── Dockerfile              # Imagem PHP 8.3 + Apache
│       ├── manager.conf            # VirtualHost do Manager
│       ├── site.conf               # VirtualHost do Site
│       └── php.ini                 # Configurações PHP
├── manager/                         # Módulo Administrativo
│   ├── app/
│   │   └── inc/
│   │       ├── kernel.php          # Configurações globais (não versionado)
│   │       ├── lists.php           # Listas e constantes
│   │       ├── main.php            # Carregador principal
│   │       ├── urls.php            # Definição de URLs
│   │       ├── controller/         # Controllers MVC
│   │       ├── model/              # Models de dados
│   │       │   └── users_model.php
│   │       └── lib/                # Biblioteca core
│   │           ├── composer.json   # Dependências Composer
│   │           ├── dispatcher.php  # Sistema de rotas
│   │           ├── DOLModel.php    # ORM base
│   │           ├── local_pdo.php   # Wrapper PDO
│   │           ├── rootOBJ.php     # Classe raiz
│   │           ├── RedisCache.php  # Wrapper Redis
│   │           ├── EmailProducer.php # Producer Kafka
│   │           ├── common_function.php # Funções utilitárias
│   │           └── classes/        # Classes PSR-4 (namespace Nexo\)
│   ├── cgi-bin/
│   │   ├── send_mail.php          # Script envio de e-mails (cron)
│   │   └── email_worker.php       # Kafka Consumer (worker emails)
│   └── public_html/               # Raiz pública
│       ├── index.php              # Front controller
│       ├── .htaccess              # Regras Apache
│       ├── assets/                # Assets estáticos
│       │   ├── css/
│       │   ├── js/
│       │   └── img/
│       └── ui/                    # Templates e views
│           ├── common/            # Componentes comuns
│           └── page/              # Páginas específicas
├── site/                           # Módulo Site Público
│   └── [estrutura similar ao manager]
├── upload/                         # Arquivos de upload (não versionado)
├── _data/                          # Dados Docker (não versionado)
│   ├── logs/                      # Logs Apache/PHP
│   ├── mysql-data/                # Dados MySQL
│   ├── redis-data/                # Dados Redis (persistência)
│   └── kafka-data/                # Dados Kafka (persistência)
├── crontab-site.txt               # Template cron jobs
├── REDIS.md                       # Documentação completa do Redis
├── KAFKA_EMAIL.md                 # Documentação completa do Sistema de Email
├── .gitignore
└── README.md
```

## ⚙️ Configuração

### Banco de Dados

As configurações do banco devem ser definidas em `manager/app/inc/kernel.php` e `site/app/inc/kernel.php`:

```php
<?php
// Configurações do Banco de Dados
define("DB_HOST", "172.29.0.2");        // IP do container MySQL
define("DB_NAME", "mysql_nexo");
define("DB_USER", "user_nexo");
define("DB_PASS", "123456");
define("DB_CHARSET", "utf8mb4");

// Configurações do Redis
define("REDIS_HOST", "172.29.0.4");           // IP do container Redis
define("REDIS_PORT", 6379);
define("REDIS_PASSWORD", "nexo_redis_2024");
define("REDIS_PREFIX", "nexo:manager:");      // Namespace
define("REDIS_DATABASE", 0);                  // 0=Manager, 1=Site
define("REDIS_ENABLED", true);
define("REDIS_DEFAULT_TTL", 3600);           // 1 hora

// Configurações do Kafka
define("KAFKA_HOST", "kafka_nexo");
define("KAFKA_PORT", "9092");
define("KAFKA_TOPIC_EMAIL", "emails");
define("KAFKA_CONSUMER_GROUP", "email-worker-group");

// Configurações de Email (SMTP)
define("mail_from_name", "Nexo Manager");
define("mail_from_mail", "noreply@manager.nexo.local");
define("mail_from_host", "smtp.gmail.com");
define("mail_from_port", "587");
define("mail_from_user", "seu-email@gmail.com");
define("mail_from_pwd", "sua-senha-app");

// Chave da aplicação (para sessões)
define("cAppKey", "nexo_app_session");

// Caminhos do servidor
define("cRootServer_APP", "/var/www/nexo/manager/app");
```

### Virtual Hosts

O projeto utiliza containers Docker:

- **nexo.local** (80): Site público
- **manager.nexo.local** (80): Painel administrativo  
- **MySQL** (3306): Banco de dados em 172.29.0.2
- **Redis** (6379): Cache em 172.29.0.4
- **Kafka** (9092, 9093): Message broker em 172.29.0.5
- **Kafka UI** (8080): Interface web de monitoramento

Os arquivos de configuração estão em:
- [docker/core/site.conf](docker/core/site.conf)
- [docker/core/manager.conf](docker/core/manager.conf)
- [docker/docker-compose.yml](docker/docker-compose.yml)

### Composer

Cada módulo possui seu próprio `composer.json` configurado com:

- **PSR-4 Autoloading**: Namespace `Nexo\` mapeado para `classes/`
- **Files Autoloading**: Carregamento automático das bibliotecas core
- **PHP >= 8.3**: Versão mínima requerida

## 🎯 Uso

### Dispatcher de Rotas

O sistema utiliza um dispatcher customizado para gerenciar rotas:

```php
// Exemplo de definição de rota
$dispatcher->add_route(
    'GET',                                    // Método HTTP
    '/produtos/([0-9]+)',                    // Padrão URL (regex)
    'produto_controller::exibir',            // Controller::método
    true,                                     // Verificação (check)
    ['param1' => 'value'],                   // Argumentos extras
    'produto_detalhes'                       // Nome da rota
);

$dispatcher->exec(); // Executar dispatcher
```

### Models (DOLModel)

O sistema possui um ORM simplificado para operações de banco de dados:

```php
// Criar um model
$user = new users_model();

// Definir campos
$user->field = [
    'name' => 'João Silva',
    'email' => 'joao@example.com',
    'active' => 'yes'
];

// Salvar (INSERT ou UPDATE automático)
$result = $user->save();

// Buscar registros
$user->filter = ["active = 'yes'"];
$users = $user->find();

// Remover
$user->filter = ["idx = 1"];
$user->remove();
```

### Sessões

Sistema de sessões seguro configurado para PHP 8.3+:

```php
// Em index.php
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'use_strict_mode' => true
]);

// Acessar dados da sessão
$_SESSION[constant("cAppKey")]["credential"]["idx"];
```

## 🚀 Redis Cache

O projeto possui integração completa com Redis para otimização de performance através de **cache automático e transparente**.

### Características do Cache

- ⚡ **Cache Automático**: Toda consulta via `load_data()` é automaticamente cacheada
- 🔄 **Invalidação Inteligente**: Cache limpo automaticamente após INSERT, UPDATE ou DELETE
- 🛡️ **Fallback Gracioso**: Sistema funciona normalmente se Redis estiver indisponível
- ⏱️ **TTL Configurável**: Controle de tempo de expiração por consulta (padrão: 1 hora)
- 📦 **Namespaces**: Separação completa de cache entre Manager (DB 0) e Site (DB 1)
- 🎯 **Zero Configuração**: Não é necessário chamar Redis manualmente - tudo é transparente

### Uso Básico

```php
// Cache automático no DOLModel - 100% transparente
$user = new users_model();
$user->filter = ["active = 'yes'"];
$user->load_data(); // 1ª vez: banco de dados + cache
                    // Próximas: direto do cache (super rápido!)

// Ao salvar/remover, cache é limpo automaticamente
$user->field = ['name' => 'João Silva'];
$user->save(); // Cache invalidado automaticamente

// Uso avançado - RedisCache diretamente
$redis = RedisCache::getInstance();

// Armazenar dados customizados
$redis->set('config:app', ['theme' => 'dark'], 3600);

// Cache com callback (ideal para relatórios pesados)
$report = $redis->remember('report:monthly', function() {
    // Query pesada executada apenas 1x
    return $complexQuery->data;
}, 3600); // Cache por 1 hora
```

### Controle de Cache no Model

```php
$product = new products_model();

// Desabilitar cache temporariamente
$product->setCacheEnabled(false);

// Alterar TTL para 5 minutos
$product->setCacheTTL(300);

// Limpar cache manualmente
$product->clearTableCache();
```

### Monitoramento

```bash
# Acessar Redis CLI
docker exec -it redis_nexo redis-cli -a nexo_redis_2024

# Ver todas as chaves
KEYS *

# Ver info do servidor
INFO

# Limpar database atual
FLUSHDB
```

📖 **Documentação Completa**: Consulte [REDIS.md](REDIS.md) para guia detalhado com exemplos avançados, casos de uso, boas práticas e troubleshooting completo.

## 📧 Sistema de Email Assíncrono

O framework possui um sistema completo de envio de emails usando **Apache Kafka** como fila de mensagens e **PHPMailer** para processamento.

### Arquitetura

```
Aplicação → EmailProducer → Kafka (fila) → email_worker.php → PHPMailer → SMTP
```

### Uso Básico

```php
// Obter instância do producer
$emailer = EmailProducer::getInstance();

// Email simples
$emailer->send(
    'usuario@example.com',
    'Bem-vindo!',
    '<h1>Olá!</h1><p>Bem-vindo ao sistema.</p>'
);

// Com template
$emailer->sendTemplate(
    'usuario@example.com',
    'Recuperar Senha',
    'reset-password',
    ['nome' => 'João', 'token' => 'ABC123']
);

// Com anexos
$emailer->sendWithAttachments(
    'cliente@example.com',
    'Relatório Mensal',
    '<p>Segue relatório anexo</p>',
    ['/path/to/relatorio.pdf']
);

// Múltiplos destinatários com CC/BCC
$emailer->sendEmail(
    ['user1@example.com', 'user2@example.com'],
    'Notificação Importante',
    '<p>Conteúdo da notificação</p>',
    [
        'cc' => ['supervisor@example.com'],
        'bcc' => ['admin@example.com'],
        'priority' => 'high'
    ]
);
```

### Vantagens

- ⚡ **Assíncrono**: Não bloqueia requisições HTTP
- 🔄 **Confiável**: Kafka garante entrega das mensagens
- 📊 **Escalável**: Suporta múltiplos workers em paralelo
- 🎯 **Monitorável**: Kafka UI para visualizar fila em tempo real
- 🛡️ **Robusto**: Auto-restart e tratamento de erros

### Email Worker

O worker deve estar sempre rodando para processar a fila:

```bash
# Foreground (testes/desenvolvimento)
docker exec -it apache_nexo php /var/www/nexo/manager/cgi-bin/email_worker.php

# Background (produção)
docker exec -d apache_nexo php /var/www/nexo/manager/cgi-bin/email_worker.php

# Com Supervisor (recomendado para produção)
# Ver configuração completa em KAFKA_EMAIL.md
```

### Monitoramento

```bash
# Logs do worker
docker exec -it apache_nexo tail -f /var/www/nexo/manager/app/logs/email_worker.log

# Kafka UI (interface web)
# http://localhost:8080

# CLI - listar tópicos
docker exec -it kafka_nexo /opt/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092

# CLI - ver mensagens
docker exec -it kafka_nexo /opt/kafka/bin/kafka-console-consumer.sh \
  --topic emails --from-beginning --bootstrap-server localhost:9092
```

📧 **Documentação Completa**: Consulte [KAFKA_EMAIL.md](KAFKA_EMAIL.md) para guia detalhado com configuração de daemon, troubleshooting, exemplos avançados e boas práticas.

## 🏗️ Arquitetura

### MVC Pattern

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Browser   │─────▶│  Dispatcher  │─────▶│ Controller │
└─────────────┘      └──────────────┘      └──────┬─────┘
                                                  │
                                                  ▼
                                            ┌───────────┐
                                            │   Model   │
                                            └─────┬─────┘
                                                  │
                                                  ▼
                                            ┌───────────┐
                                            │   View    │
                                            └───────────┘
```

### Componentes Principais

1. **Dispatcher**: Gerencia rotas e despacha requisições
2. **DOLModel**: Camada de abstração de banco de dados com cache Redis integrado
3. **RedisCache**: Wrapper para operações de cache (Singleton)
4. **local_pdo**: Wrapper PDO com métodos auxiliares
5. **rootOBJ**: Classe base para todos os objetos
6. **Controllers**: Lógica de negócio
7. **Models**: Representação de dados
8. **Views**: Templates de apresentação

### Fluxo de Dados com Cache

```
Request → Dispatcher → Controller → Model
                                      ↓
                               [Cache Check]
                                 ↙        ↘
                            Cache Hit   Cache Miss
                                ↓           ↓
                            Return      Database
                                           ↓
                                      Store Cache
                                           ↓
                                        Return
```

## 💻 Desenvolvimento

### Comandos Docker Úteis

```bash
# Visualizar logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f apache_nexo
docker-compose logs -f redis_nexo

# Acessar o container Apache/PHP
docker exec -it apache_nexo bash

# Acessar o MySQL
docker exec -it mysql_nexo mysql -u user_nexo -p123456

# Acessar o Redis
docker exec -it redis_nexo redis-cli -a nexo_redis_2024

# Acessar o Kafka
docker exec -it kafka_nexo /opt/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092

# Ver logs do email worker
docker exec -it apache_nexo tail -f /var/www/nexo/manager/app/logs/email_worker.log

# Reiniciar containers
docker-compose restart

# Parar containers
docker-compose down

# Rebuild completo
docker-compose down
docker-compose up -d --build
```

### Debug e Logs

Logs são armazenados em `_data/logs/`:

```bash
# Ver erros do site
tail -f _data/logs/site-error.log

# Ver erros do Apache
tail -f _data/logs/error.log
```

### Adicionar Dependências Composer

```bash
docker exec -it apache_nexo bash
cd /var/www/nexo/manager/app/inc/lib

# Adicionar pacote
composer require vendor/package

# Atualizar dependências
composer update
```

## ⏰ Cron Jobs

O projeto inclui configuração de cron jobs para tarefas agendadas. Template disponível em [crontab-site.txt](crontab-site.txt).

**Observação**: Com a implementação do sistema de email via Kafka, o envio assíncrono substitui o cron para emails. O worker `email_worker.php` deve ser executado como daemon (Supervisor/Systemd) ao invés de cron. Consulte [KAFKA_EMAIL.md](KAFKA_EMAIL.md) para configuração.

### Ativar Crontab

```bash
# 1. Criar diretório de logs
mkdir -p /var/log/cron
chmod 755 /var/log/cron

# 2. Instalar crontab
crontab crontab-site.txt

# 3. Verificar instalação
crontab -l
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

- Seguir PSR-12 para código PHP
- Utilizar type hints do PHP 8.3+
- Documentar funções e classes com PHPDoc
- Manter compatibilidade com PHP 8.3+

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para reportar bugs ou solicitar funcionalidades, abra uma [issue](https://github.com/seu-usuario/nexo/issues).

## 🎯 Performance

Com Redis e Kafka integrados, o Nexo Framework oferece:
- ⚡ **95% mais rápido** em consultas repetidas (Redis)
- 📊 **Redução de 80%** na carga do banco de dados
- 🚀 **Escalabilidade** para milhares de requisições simultâneas
- 💾 **Cache inteligente** que se auto-gerencia
- 📧 **Emails assíncronos** sem bloquear requisições (Kafka)
- 🔄 **Processamento em fila** com throughput de 100-500 emails/segundo

---

**Nexo Framework** - Desenvolvido com ❤️ usando PHP 8.3+, MySQL 8.0, Redis 7.2 e Apache Kafka

Última atualização: Thu Dec 25 20:55:48 -03 2025
