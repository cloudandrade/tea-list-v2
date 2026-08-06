# Setup

## Pré-requisitos

- Node.js (compatível com Next.js 16)
- MongoDB local ou remoto (Atlas, etc.)
- npm ou yarn

## Configuração

1. Clone o repositório e entre na pasta do projeto.

2. Copie o template de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variáveis:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `APP_ENV` | Não | Ambiente lógico (ex.: `local`) |
| `MONGO_URI` | Sim | Connection string MongoDB |
| `AUTH_SECRET` | Sim em prod | Segredo HMAC das sessões |
| `MONGO_TLS_ALLOW_INVALID_CERTIFICATES` | Não | Só para diagnóstico TLS; não usar `true` em produção |
| `MONGO_TLS_CA_FILE` | Não | Caminho de CA file para TLS |

O código também aceita o nome legado `MONGODB_URI` se `MONGO_URI` estiver ausente. Em desenvolvimento, se `AUTH_SECRET` não estiver definido, usa o fallback `dev-secret-change-me`.

4. Instale as dependências:

```bash
npm install
# ou
yarn
```

5. Suba o MongoDB e inicie o app:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Comando | Uso |
|--------|---------|-----|
| Dev | `npm run dev` | Servidor de desenvolvimento |
| Build | `npm run build` | Build de produção |
| Start | `npm start` | Servidor de produção (após build) |
| Lint | `npm run lint` | ESLint |

## Health check

`GET /api/v2/health/mongo` — verifica conectividade com o MongoDB.
