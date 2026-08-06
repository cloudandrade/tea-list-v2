# Arquitetura

## Visão geral

Monólito full-stack Next.js. O frontend (client components) fala com Route Handlers em `/api/v2`. Não há Server Actions. A lógica de domínio fica em `src/backend`.

```
Browser (React client)
  → fetch /api/v2/...
    → Route Handler (src/app/api/v2/...)
      → application/* (casos de uso)
        → repository + model Mongoose
          → MongoDB
```

## Estrutura de pastas

```
src/
├── app/                      # App Router: páginas + API
│   ├── page.jsx              # Login (/)
│   ├── register/
│   ├── dashboard/            # Área autenticada
│   ├── l/[publicHash]/      # Lista pública
│   ├── api/v2/               # Route Handlers
│   └── components/           # Providers globais (i18n, toast, loading)
├── modules/                  # UI + clients HTTP (frontend)
│   ├── auth/
│   ├── dashboard/
│   └── lists/
└── backend/                  # Domínio / aplicação / infra (server)
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── gift-lists/
    │   └── gift-items/
    └── shared/
        ├── http/             # Helpers de resposta JSON
        └── infra/mongodb/    # Conexão Mongo
```

Alias de import: `@/` → `src/` (`jsconfig.json`).

## Camadas do backend

Cada módulo em `src/backend/modules/<nome>/` segue:

- **domain** — regras/validações (quando existir)
- **application** — casos de uso (login, criar lista, reservar item, etc.)
- **infra** — repositórios e models Mongoose

Route Handlers importam os casos de uso e rodam com `runtime = 'nodejs'`.

## Autenticação

- Cookie httpOnly: `tea_list_v2_session`
- Token: payload base64url + assinatura HMAC-SHA256 (`AUTH_SECRET`)
- Validade: 7 dias
- Senhas: bcryptjs (cost 12)

Rotas privadas chamam `getCurrentUser()`, que lê o cookie, verifica a assinatura e carrega o usuário.

**Importante:** não há `middleware.js`. A proteção das telas do dashboard é feita no client (`getMe()` → redirect para `/` se falhar). A API privada ainda valida sessão no handler.

## Imagens

Compressão no browser → data URL WebP gravada no documento Mongo (`coverImageUrl`, `imageUrl`). Não há S3/Cloudinary.

## Fluxos principais

### Conta

1. `/register` → `POST /api/v2/auth/register` → cookie → `/dashboard`
2. `/` → `POST /api/v2/auth/login` → cookie → `/dashboard`
3. Logout → `POST /api/v2/auth/logout`

### Lista

1. `/dashboard/lists/new` → formulário (tipo, visual, capa)
2. `POST /api/v2/lists` → gera `publicHash` (8 bytes base64url)
3. Redirect para gestão de itens

### Itens

- Criação com `quantity = N` gera **N documentos** separados
- Counters `totalItems` / `reservedItems` ficam denormalizados na lista

### Compartilhamento e reserva

1. Dono compartilha `/l/{publicHash}`
2. Convidado vê `GET /api/v2/public/lists/{publicHash}` (sem dados de outras reservas)
3. Reserva: nome + telefone BR → `POST .../items/{itemId}/reserve`
4. Dono e lista pública veem “Presenteado por {nome}”; o telefone do convidado continua oculto na API pública

## Frontend relevante

| Arquivo | Papel |
|---------|-------|
| `src/modules/auth/services/authApi.js` | Client de auth |
| `src/modules/lists/services/listApi.js` | Client de listas/itens |
| `src/modules/lists/services/imageCompression.js` | Compressão de imagens |
| Telas em `src/modules/{auth,dashboard,lists}/` | UI principal |

Providers globais: i18n, toast, loading de navegação (`src/app/components/`).
