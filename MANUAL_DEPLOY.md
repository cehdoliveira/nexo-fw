# 📦 Deploy Manual via FTP - Nexo Framework

Stack pronta para deploy manual de arquivos via FTP/SFTP, sem necessidade de CI/CD, GitHub ou Docker Registry externo.

## 🎯 Conceito

Esta stack cria um ambiente PHP completo (Apache, MySQL, Redis, Kafka) onde você simplesmente **copia os arquivos via FTP** para os volumes do servidor e tudo funciona automaticamente.

**Não precisa:**
- ❌ GitHub Actions
- ❌ Docker build local
- ❌ GHCR ou registry externo
- ❌ Conhecimento em Docker

**Precisa apenas:**
- ✅ Servidor com Docker Swarm + Portainer
- ✅ Cliente FTP/SFTP (FileZilla, WinSCP, etc)
- ✅ Copiar arquivos para `/opt/nexo/site` e `/opt/nexo/manager`

---

## 🚀 Passo 1: Preparar Servidor

### 1.1. Clonar Repositório no Servidor

SSH no servidor e clone o repositório diretamente em `/opt/`:

```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Navegar para /opt
cd /opt

# Clonar repositório (todas as configs já vêm prontas!)
sudo git clone https://github.com/seu-usuario/nexofw.git nexo

# Ou se preferir via SSH
sudo git clone git@github.com:seu-usuario/nexofw.git nexo
```

**Estrutura criada automaticamente:**
```
/opt/nexo/
├── docker/
│   ├── core/              # Configs de desenvolvimento
│   ├── prod/              # Configs de produção (PRONTAS!)
│   │   ├── Dockerfile     # Build da imagem customizada
│   │   ├── entrypoint.sh  # (não usado com Dockerfile)
│   │   ├── site.conf
│   │   ├── manager.conf
│   │   └── php.ini
│   └── docker-compose-manual-deploy.yml
├── site/                  # Seus arquivos PHP (site)
├── manager/               # Seus arquivos PHP (manager)
└── README.md
```

### 1.2. Build da Imagem Docker Customizada

**⚠️ IMPORTANTE**: Este passo cria a imagem com todas as extensões PHP pré-instaladas.

```bash
# Navegar para o diretório prod
cd /opt/nexo/docker/prod

# Build da imagem (5-10 minutos)
sudo docker build -t nexofw-app:latest .

# Verificar se foi criada
sudo docker images | grep nexofw-app

# Deve mostrar:
# nexofw-app   latest   xxxxxxxxxxxxx   X minutes ago   XXX MB
```

**O que a imagem inclui:**
- ✅ PHP 8.3 + Apache
- ✅ Extensões: mysqli, pdo_mysql, zip, gd, redis, rdkafka
- ✅ Configurações do Apache (site.conf, manager.conf)
- ✅ PHP.ini otimizado
- ✅ mod_rewrite habilitado
- ✅ Healthcheck configurado

### 1.3. Criar Diretório de Logs

```bash
# Criar diretório de logs
sudo mkdir -p /opt/nexo/logs/apache2

# Ajustar permissões dos arquivos (www-data uid:gid = 33:33)
sudo chown -R 33:33 /opt/nexo/site
sudo chown -R 33:33 /opt/nexo/manager
sudo chown -R 33:33 /opt/nexo/logs
sudo chmod -R 755 /opt/nexo/site
sudo chmod -R 755 /opt/nexo/manager
```

### 1.4. Instalar Dependências do Composer

**⚠️ IMPORTANTE**: As aplicações PHP precisam das dependências do Composer instaladas.

```bash
# Instalar dependências do site
cd /opt/nexo/site/app/inc/lib
sudo docker run --rm -v "$PWD":/app composer:latest install --no-dev --optimize-autoloader --ignore-platform-reqs

# Instalar dependências do manager
cd /opt/nexo/manager/app/inc/lib
sudo docker run --rm -v "$PWD":/app composer:latest install --no-dev --optimize-autoloader --ignore-platform-reqs

# Ajustar permissões dos arquivos gerados
sudo chown -R 33:33 /opt/nexo/site/app/inc/lib/vendor
sudo chown -R 33:33 /opt/nexo/manager/app/inc/lib/vendor
```

**O que isso faz:**
- Lê `composer.json` e `composer.lock`
- Instala todas as dependências em `vendor/`
- `--no-dev`: Não instala dependências de desenvolvimento
- `--optimize-autoloader`: Otimiza autoloader para produção
- `--ignore-platform-reqs`: Ignora requisitos de extensões (elas existem na imagem nexofw-app)

### 1.5. Verificar Configuração

```bash
# Listar imagem
docker images nexofw-app

# Testar imagem (opcional)
docker run --rm nexofw-app:latest php -m | grep -E "(redis|rdkafka|mysqli)"

# Deve mostrar:
# mysqli
# rdkafka
# redis

# Verificar se vendor foi criado
ls -la /opt/nexo/site/app/inc/lib/vendor
ls -la /opt/nexo/manager/app/inc/lib/vendor

# Deve mostrar diretórios: autoload.php, composer/, etc.
```

✅ **Pronto!** Imagem customizada criada e dependências instaladas

---

## 🐳 Passo 2: Deploy da Stack no Portainer

**⚠️ Pré-requisitos:**
- ✅ Imagem `nexofw-app:latest` criada (Passo 1.2)
- ✅ Rede overlay `dotskynet` existente (onde estão MySQL e Kafka)

## 🗄️ Passo 2: Criar Database e Usuário MySQL

### 2.1. Acessar Container MySQL

```bash
# Via Portainer: Stacks → [sua-stack-mysql] → Containers → mysql → Console

# OU via SSH:
docker exec -it $(docker ps -q -f name=mysql) mysql -uroot -p
```

Digite a senha root quando solicitado.

### 2.2. Executar Comandos SQL

```sql
-- 1. Criar database
CREATE DATABASE IF NOT EXISTS <SEU_DATABASE> 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_general_ci;

-- 2. Criar usuário dedicado (troque as credenciais)
CREATE USER IF NOT EXISTS '<SEU_USUARIO>'@'%' IDENTIFIED BY '<SUA_SENHA_MYSQL>';

-- 3. Conceder permissões
GRANT ALL PRIVILEGES ON <SEU_DATABASE>.* TO '<SEU_USUARIO>'@'%';

-- 4. Aplicar mudanças
FLUSH PRIVILEGES;

-- 5. Verificar
SHOW DATABASES LIKE '<SEU_DATABASE>%';
SELECT User, Host FROM mysql.user WHERE User = '<SEU_USUARIO>';

-- 6. Sair
EXIT;
```

**Exemplo com valores substituídos:**
```sql
CREATE DATABASE IF NOT EXISTS nexo_production 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_general_ci;

CREATE USER IF NOT EXISTS 'nexo_user'@'%' IDENTIFIED BY 'SuaSenhaForte123!';

GRANT ALL PRIVILEGES ON nexo_production.* TO 'nexo_user'@'%';

FLUSH PRIVILEGES;
```

### 2.3. Testar Conexão

```bash
# Testar conexão com novo usuário
docker exec -it $(docker ps -q -f name=mysql) \
  mysql -u<SEU_USUARIO> -p'<SUA_SENHA_MYSQL>' <SEU_DATABASE>

# Dentro do MySQL, teste:
SELECT DATABASE();
SHOW TABLES;
EXIT;
```

### 2.4. Anotar Credenciais

📝 **Guarde estas informações (você usará nos próximos passos):**

```
Host: mysql                    (nome do serviço Docker)
Port: 3306                     (interno na rede dotskynet)
Database: <SEU_DATABASE>
User: <SEU_USUARIO>
Password: <SUA_SENHA_MYSQL>
```

---

### 2.1. Acessar Portainer

1. Acesse: `https://seu-portainer.com`
2. **Stacks → Add stack**
3. **Name**: `nexo-manual`

### 2.2. Cole o Compose File

**Opção 1: Copiar do arquivo local**
Copie todo o conteúdo de `docker/docker-compose-manual-deploy.yml` e cole no editor do Portainer.

**Opção 2: Usar arquivo do servidor (mais fácil)**
No servidor, o arquivo já está em `/opt/nexo/docker/docker-compose-manual-deploy.yml`.

No Portainer:
1. **Upload** → Selecione o arquivo do servidor
2. Ou **Web editor** → Cole o conteúdo

**Opção 3: Direto via Git (Portainer suporta)**
1. **Repository** → `https://github.com/seu-usuario/nexofw`
2. **Compose path**: `docker/docker-compose-manual-deploy.yml`
3. **Auto update**: Habilite para sincronizar automaticamente

### 3.3. Deploy

1. **Deploy the stack**
2. Aguarde todos os serviços subirem (pode levar 2-3 minutos na primeira vez)

### 2.4. Verificar Serviços

**Portainer → Stacks → nexo-manual**

Você deve ver:
- ✅ `nexo-manual_app` (2/2 replicas)
- ✅ `nexo-manual_redis` (1/1)
- ✅ `nexo-manual_email_worker` (1/1)

Observação:
- MySQL e Kafka rodam fora desta stack na rede overlay `dotskynet` (serviços já existentes). Certifique-se de que os nomes de serviço estejam acessíveis na rede (`mysql`, `kafka_broker`).

---

## 📁 Passo 3: Subir Arquivos via FTP

### 3.1. Configurar Acesso SFTP no Servidor

```bash
# Criar usuário FTP
sudo adduser nexoftp --disabled-password

# Definir senha
sudo passwd nexoftp

# Dar permissões aos diretórios
sudo usermod -aG www-data nexoftp
sudo chown -R nexoftp:www-data /opt/nexo/site
sudo chown -R nexoftp:www-data /opt/nexo/manager
sudo chmod -R 775 /opt/nexo/site
sudo chmod -R 775 /opt/nexo/manager
```

### 3.2. Conectar via FileZilla (ou outro cliente FTP)

**Configurações:**
- **Host**: `sftp://seu-servidor.com`
- **Porta**: `22`
- **Protocolo**: `SFTP`
- **Usuário**: `nexoftp`
- **Senha**: (a que você definiu)

### 3.3. Estrutura de Diretórios Esperada

Ao conectar via FTP, navegue até `/opt/nexo/` e copie os arquivos:

```
/opt/nexo/
├── site/
│   ├── app/
│   │   └── inc/
│   │       ├── kernel.php
│   │       ├── urls.php
│   │       ├── controller/
│   │       ├── model/
│   │       └── lib/
│   ├── public_html/
│   │   ├── index.php
│   │   ├── assets/
│   │   └── ui/
│   └── cgi-bin/
│       ├── send_mail.php
│       └── kafka_email_worker.php
│
└── manager/
    ├── app/
    │   └── inc/
    │       ├── kernel.php
    │       ├── urls.php
    │       ├── controller/
    │       ├── model/
    │       └── lib/
    ├── public_html/
    │   ├── index.php
    │   ├── assets/
    │   └── ui/
    └── cgi-bin/
        └── send_mail.php
```

### 3.4. Copiar Arquivos

No FileZilla:

1. **Lado esquerdo**: Seu computador local
2. **Lado direito**: Servidor remoto (`/opt/nexo/`)
3. Arraste a pasta `site/` para `/opt/nexo/site/`
4. Arraste a pasta `manager/` para `/opt/nexo/manager/`

**Tempo estimado**: 2-5 minutos (depende do tamanho)

### 3.5. Ajustar Permissões (se necessário)

```bash
# SSH no servidor
ssh usuario@servidor

# Garantir permissões corretas
sudo chown -R 33:33 /opt/nexo/site
sudo chown -R 33:33 /opt/nexo/manager
sudo chmod -R 755 /opt/nexo/site
sudo chmod -R 755 /opt/nexo/manager

# Permissões especiais para uploads
sudo chmod -R 777 /opt/nexo/site/public_html/assets/upload
sudo chmod -R 777 /opt/nexo/manager/public_html/assets/upload
```

---

## 🌐 Passo 4: Acessar os Sites

### 4.1. Testar Acesso

**Site Principal:**
```
https://dotsky.com.br
```

**Manager:**
```
https://manager.dotsky.com.br
```

### 4.2. Primeira Visita

Se você ainda não copiou os arquivos, verá:
- 🔴 **403 Forbidden** (diretório vazio)
- 🔴 **404 Not Found** (sem index.php)

Após copiar os arquivos:
- ✅ Sites funcionando normalmente

---

## 🔄 Passo 5: Atualizar Arquivos (Deploy de Novas Versões)

### 5.1. Via FTP (Recomendado para Pequenas Mudanças)

1. Conecte via FileZilla
2. Navegue atéraiz do projeto
cd /opt/nexo

# Atualizar código (pull das últimas alterações)
sudo git pull origin main

# Ajustar permissões após atualização
sudo chown -R 33:33 /opt/nexo/site
sudo chown -R 33:33 /opt/nexo/manager
sudo chmod -R 755 /opt/nexo/site
sudo chmod -R 755 /opt/nexo/manager
cd /opt/nexo/site

# Inicializar Git (primeira vez)
sudo -u www-data git init
sudo -u www-data git remote add origin https://github.com/seu-usuario/nexofw.git

# Atualizar código
sudo -u www-data git fetch origin
sudo -u www-data git reset --hard origin/main

# Ajustar permissões
sudo chown -R 33:33 /opt/nexo/site
sudo chmod -R 755 /opt/nexo/site
```

### 5.3. Reiniciar Serviços (Apenas se Necessário)

Normalmente **não é necessário** reiniciar, mas em casos específicos:

```bash
# Reiniciar apenas o app
docker service update --force nexo-manual_app

# Reiniciar worker de email
docker service update --force nexo-manual_email_worker
```

---

## 🗄️ Passo 6: Configurar Banco de Dados

### 6.1. Acessar MySQL

```bash
# Via docker exec
docker exec -it $(docker ps -q -f name=nexo-manual_mysql) mysql -u root -p12345

# Ou via Portainer Console (mais fácil)
# Portainer → Containers → nexo-manual_mysql → Console
# Comando: mysql -u root -p12345
```

### 6.2. Criar Tabelas

```sql
USE mysql_nexo;

-- Exemplo: Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exemplo: Tabela de emails (para Kafka)
CREATE TABLE email_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.3. Importar Dump Existente

```bash
# Copiar dump via FTP para /opt/nexo/
# Exemplo: database.sql

# SSH no servidor
ssh usuario@servidor

# Importar
docker exec -i $(docker ps -q -f name=nexo-manual_mysql) \
  mysql -u root -p12345 mysql_nexo < /opt/nexo/database.sql
```

---

## 🧪 Passo 7: Testar Integrações (sem criar arquivos de teste)

### 7.1. Testar Redis (Cache/Sessions)

```bash
# Teste rápido via PHP inline no container APP
docker exec $(docker ps -q -f name=nexo-manual_app | head -1) php -r "\
$r=new Redis(); \
$r->connect('redis',6379); \
$r->set('test','ok'); \
echo 'Redis: '.($r->get('test')==='ok'?'OK':'FAIL');"
```

### 7.2. Testar MySQL

```bash
docker exec $(docker ps -q -f name=nexo-manual_app | head -1) php -r "\
$m=new mysqli('mysql','nexo_user','Nx#2024$Dotsky!Prod','nexo_dotsky'); \
if($m->connect_error){die('FAIL: '.$m->connect_error);} \
echo 'MySQL: OK';"
```

### 7.3. Testar Kafka (Email Worker)

Configuração final obrigatória:
- **Broker**: `kafka_broker:9092`
- **Tópico de emails**: `nexo_emails_site` (não use `emails`)
- **Consumer group**: `email-worker-group`
- **Worker**: `auto.offset.reset=earliest`, `enable.auto.commit=true`

Verificar worker em tempo real:
```bash
docker service logs nexo-manual_email_worker -f --since 1m
```

Se houver mensagens não consumidas (LAG), resetar offsets do grupo:
```bash
docker exec <kafka_container_name> /opt/kafka/bin/kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --group email-worker-group \
    --topic nexo_emails_site \
    --reset-offsets \
    --to-earliest \
    --execute
```

Notas avançadas:
- Se o tópico tiver múltiplas partições, o worker fará rebalance. Logs de rebalance aparecem como `[REBALANCE] Partições ATRIBUÍDAS`.
- Producers devem enviar para `nexo_emails_site`. Mensagens em outros tópicos não serão processadas.

---

## 🔍 Passo 8: Monitoramento e Logs

### 8.1. Ver Logs do Apache

```bash
# SSH no servidor
tail -f /opt/nexo/logs/apache2/site_access.log
tail -f /opt/nexo/logs/apache2/site_error.log
tail -f /opt/nexo/logs/apache2/manager_error.log
```

### 8.2. Ver Logs dos Serviços

```bash
# App
docker service logs nexo-manual_app -f

# Redis
docker service logs nexo-manual_redis -f

# Email Worker
docker service logs nexo-manual_email_worker -f
```

### 8.3. Verificar Saúde dos Serviços

```bash
# Ver status de todos os serviços
docker service ls | grep nexo-manual

# Ver detalhes de um serviço
docker service ps nexo-manual_app

# Ver replicas e status
docker service inspect nexo-manual_app --pretty
```

---

## 🚨 Troubleshooting

### Problema: Site retorna 403 Forbidden

**Causa**: Diretório vazio ou sem permissões

**Solução:**
```bash
# Verificar se arquivos existem
ls -la /opt/nexo/site/public_html/

# Ajustar permissões
sudo chown -R 33:33 /opt/nexo/site
sudo chmod -R 755 /opt/nexo/site
```

### Problema: Site retorna 500 Internal Server Error

**Causa**: Erro PHP ou extensão faltando

**Solução:**
```bash
# Ver logs PHP
tail -f /opt/nexo/logs/apache2/site_error.log

# Verificar extensões instaladas
docker exec $(docker ps -q -f name=nexo-manual_app | head -1) php -m

# Reiniciar serviço
docker service update --force nexo-manual_app
```

### Problema: Não consigo conectar no MySQL

**Causa**: Serviço não iniciou completamente

**Solução:**
```bash
# Verificar healthcheck
docker service ps nexo-manual_mysql

# Ver logs
docker service logs nexo-manual_mysql -f

# Aguardar 30s e tentar novamente
```

### Problema: Redis não está salvando sessões

**Causa**: PHP não consegue conectar no Redis

**Solução:**
```bash
# Testar conexão
docker exec $(docker ps -q -f name=nexo-manual_app | head -1) php -r "
\$redis = new Redis();
\$redis->connect('redis', 6379);
\$redis->set('test', 'ok');
echo \$redis->get('test');
"

# Deve retornar: ok
```

### Problema: Email Worker não está processando

**Causa**: Kafka não está pronto ou worker crashou

**Solução:**
```bash
# 1) Ver logs do worker
docker service logs nexo-manual_email_worker -f

# 2) Validar broker acessível a partir do worker
docker exec $(docker ps -q -f name=nexo-manual_email_worker | head -1) sh -c "nc -zv kafka_broker 9092 || ping -c 1 kafka_broker"

# 3) Resetar offsets do consumer group (se houver LAG)
docker exec <kafka_container_name> /opt/kafka/bin/kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --group email-worker-group \
    --topic nexo_emails_site \
    --reset-offsets \
    --to-earliest \
    --execute

# 4) Reiniciar worker
docker service update --force nexo-manual_email_worker
```

### Problema: PHP Fatal error: Failed opening required 'vendor/autoload.php'

**Causa**: Dependências do Composer não instaladas

**Solução:**
```bash
# SSH no servidor
ssh usuario@servidor

# Instalar dependências (com --ignore-platform-reqs)
cd /opt/nexo/site/app/inc/lib
sudo docker run --rm -v "$PWD":/app composer:latest install --no-dev --ignore-platform-reqs

cd /opt/nexo/manager/app/inc/lib
sudo docker run --rm -v "$PWD":/app composer:latest install --no-dev --ignore-platform-reqs

# Ajustar permissões
sudo chown -R 33:33 /opt/nexo/site/app/inc/lib/vendor
sudo chown -R 33:33 /opt/nexo/manager/app/inc/lib/vendor

# Reiniciar serviços
docker service update --force nexo-manual_app
docker service update --force nexo-manual_email_worker
```

**Por que `--ignore-platform-reqs`?**
- O Composer roda em imagem básica sem extensões PHP (redis, rdkafka)
- As extensões existem na imagem `nexofw-app:latest` onde o código será executado
- Ignorar requisitos de plataforma permite instalação das dependências

---

## 📊 Comparação: CI/CD vs Manual Deploy

| Aspecto | CI/CD (GitHub Actions) | Manual Deploy (FTP) |
|---------|------------------------|---------------------|
| **Setup Inicial** | Complexo (30min) | Simples (10min) |
| **Deploy** | Automático (git push) | Manual (FTP upload) |
| **Velocidade** | 5-8 minutos | Instantâneo |
| **Rollback** | git revert + redeploy | Sobrescrever arquivos antigos |
| **Auditoria** | Git history completo | Sem histórico |
| **Testes** | CI rodando testes | Manual |
| **Múltiplos Devs** | Fácil (PRs) | Difícil (conflitos) |
| **Zero Downtime** | Sim (rolling update) | Depende |
| **Recomendado para** | Produção profissional | Desenvolvimento/teste |

---

## 🎯 Vantagens desta Abordagem

✅ **Simples**: Não precisa entender Docker, CI/CD ou Git  
✅ **Rápido**: Deploy em segundos via FTP  
✅ **Flexível**: Edite arquivos diretamente no servidor  
✅ **Independente**: Sem dependência de GitHub, GHCR ou registry  
✅ **Familiar**: Usa FTP, igual hospedagem compartilhada tradicional

## ⚠️ Desvantagens

❌ **Sem histórico**: Não tem controle de versão automático  
❌ **Sem testes**: Não roda testes antes do deploy  
❌ **Sem rollback fácil**: Precisa manter backups manualmente  
❌ **Múltiplos devs**: Difícil coordenar mudanças simultâneas

---

## 🔄 Migração para CI/CD (Opcional)

Quando estiver pronto para processo mais profissional:

1. **Mantenha os arquivos no Git**
2. **Configure GitHub Actions** (veja `PRODUCTION_DEPLOY.md`)
3. **Use esta stack como base**, mas mude imagem:
   ```yaml
   image: ghcr.io/seu-usuario/nexofw:latest
   ```
4. **Deploy automático** após merge na main

Os volumes (`/opt/nexo/site` e `/opt/nexo/manager`) podem ser mantidos ou removidos (arquivos ficarão dentro da imagem Docker).

---

## 📚 Próximos Passos

1. ✅ Clonar repositório no servidor
2. ✅ Build da imagem customizada (nexofw-app:latest)
3. ✅ Deploy da stack no Portainer (usando rede dotskynet existente)
4. ✅ Configurar FTP/SFTP
5. ✅ Copiar arquivos via FTP
6. ✅ Configurar banco de dados
7. ✅ Testar integrações (Redis, MySQL, Kafka)
8. ✅ Monitorar logs
9. 🔜 Automatizar backups
10. 🔜 Configurar monitoramento (Grafana/Prometheus)
11. 🔜 Migrar para CI/CD quando necessário

---

## 🎯 Vantagens da Imagem Customizada

✅ **Performance**: Containers iniciam em 5-10 segundos  
✅ **Confiabilidade**: Extensões testadas e validadas no build  
✅ **Escalabilidade**: Fácil replicar e escalar horizontalmente  
✅ **Manutenibilidade**: Configurações versionadas no Dockerfile  
✅ **Deploy rápido**: Rollout de novas versões em segundos  
✅ **Zero downtime**: Rolling updates automáticos

---

## 🔄 Workflow de Atualização

```
1. Código PHP (site/manager)
   └─> FTP ou git pull
   └─> Atualização instantânea (sem rebuild)

2. Configs (php.ini, *.conf)
   └─> Editar em docker/prod/
   └─> Rebuild da imagem (3-5min)
   └─> Update dos serviços

3. Extensões PHP
   └─> Adicionar no Dockerfile
   └─> Rebuild da imagem
   └─> Update dos serviços
```

---

**🎉 Pronto! Stack otimizada e pronta para produção!**

---

## 🆘 Suporte

Se algo não funcionar:

1. **Verifique logs** (Passo 8)
2. **Teste integrações** (Passo 7)
3. **Revise troubleshooting** (acima)
4. **Reinicie serviços** se necessário

**Comandos úteis:**
```bash
# Status geral
docker service ls | grep nexo-manual

# Logs de todos os serviços
docker service logs nexo-manual_app -f

# Reiniciar tudo
docker stack rm nexo-manual
docker stack deploy -c docker-compose-manual-deploy.yml nexo-manual

# Diagnóstico de Kafka (opc.)
docker exec <kafka_container_name> /opt/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
docker exec <kafka_container_name> /opt/kafka/bin/kafka-topics.sh --describe --topic nexo_emails_site --bootstrap-server localhost:9092
```

---

**🎉 Pronto! Agora você tem um ambiente PHP completo gerenciado via FTP!**
