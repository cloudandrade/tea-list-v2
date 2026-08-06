# API v2

Base: `/api/v2`

Respostas JSON. Rotas privadas exigem cookie de sessão `tea_list_v2_session`. Rotas sob `/public/` são abertas.

## Auth

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/register` | Não | Cria conta e define cookie de sessão |
| `POST` | `/auth/login` | Não | Login e define cookie |
| `POST` | `/auth/logout` | Sim* | Limpa cookie |
| `GET` | `/auth/me` | Sim | Usuário da sessão atual |

\*Logout limpa o cookie mesmo sem sessão válida na prática usual.

### Body típico — register

```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "senha-segura"
}
```

Validações de domínio: nome ≥ 2 caracteres, e-mail válido, senha ≥ 8.

### Body típico — login

```json
{
  "email": "maria@email.com",
  "password": "senha-segura"
}
```

## Listas (privadas)

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/lists` | Listas do usuário logado |
| `POST` | `/lists` | Cria lista (gera `publicHash`) |
| `GET` | `/lists/[listId]` | Detalhe da lista |
| `PATCH` | `/lists/[listId]` | Atualiza lista |
| `DELETE` | `/lists/[listId]` | Exclui lista e itens em cascata |

Campos relevantes na criação/edição: `title`, `subtitle`, `type`, `message`, `displayMode`, `coverImageUrl`, `colorPalette`, `backgroundPattern`, `theme`, `featured`.

`displayMode`: `blocks` | `detailed` | `compact`.

## Itens (privados)

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/lists/[listId]/items` | Lista itens |
| `POST` | `/lists/[listId]/items` | Cria item(ns) |
| `PATCH` | `/lists/[listId]/items/[itemId]` | Atualiza item |
| `DELETE` | `/lists/[listId]/items/[itemId]` | Remove item |
| `PATCH` | `/lists/[listId]/items/bulk` | Edição em lote por faixa de números |

Body da edição em lote:

```json
{
  "selection": "2,8,16,22-28",
  "fields": {
    "name": "Fralda P",
    "price": 29.9
  }
}
```

`selection` usa o formato de impressão: vírgula separa itens (`6,8,12`), hífen indica faixa (`48-52`), e ambos podem ser combinados (`2,8,16,22-28`).

Só as chaves presentes em `fields` são aplicadas. Campos omitidos ou vazios no formulário mantêm o valor atual de cada item.

Campos relevantes na criação/edição: `name`, `price`, `quantity`, `description`, `imageUrl`, `pixEnabled`, `pixKey`, `pixQrCodeUrl`.

Se `pixEnabled` for `true`, `pixKey` é obrigatória. `pixQrCodeUrl` é opcional; o backend deduplica por hash SHA-256 entre itens do mesmo usuário.

## Público

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/public/lists/[publicHash]` | Lista + itens para convidados |
| `POST` | `/public/lists/[publicHash]/items/[itemId]/reserve` | Reserva item |

### Body — reserve

```json
{
  "guestName": "João",
  "guestPhone": "11999999999"
}
```

Telefone esperado: 10–11 dígitos (máscara BR no frontend). Retorna **409** se o item já estiver esgotado.

Itens públicos expõem o nome de quem reservou (para “Presenteado por”), mas **não** o telefone.

## Health

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/health/mongo` | Checagem de conexão MongoDB |

## Arquivos dos handlers

```
src/app/api/v2/
├── auth/{register,login,logout,me}/route.js
├── lists/route.js
├── lists/[listId]/route.js
├── lists/[listId]/items/route.js
├── lists/[listId]/items/bulk/route.js
├── lists/[listId]/items/[itemId]/route.js
├── public/lists/[publicHash]/route.js
├── public/lists/[publicHash]/items/[itemId]/reserve/route.js
└── health/mongo/route.js
```
