# Modelo de dados

MongoDB via Mongoose. Collections com sufixo `-v2` (evolução a partir de uma v1).

## Diagrama de relacionamentos

```
User (users-v2)
  └── 1:N → GiftList (gift-lists-v2)
                └── 1:N → GiftItem (gift-items-v2)
                              └── embutido → reservations[]
```

## User — `users-v2`

Model: `src/backend/modules/users/infra/mongoose/user.model.js`  
Model name: `UserV2`

| Campo | Tipo | Notas |
|-------|------|--------|
| `name` | String | obrigatório |
| `email` | String | unique, lowercase |
| `passwordHash` | String | bcrypt |
| `createdAt` / `updatedAt` | Date | timestamps |

## GiftList — `gift-lists-v2`

Model: `src/backend/modules/gift-lists/infra/mongoose/gift-list.model.js`  
Model name: `GiftListV2`

| Campo | Tipo | Notas |
|-------|------|--------|
| `userId` | ObjectId → UserV2 | index |
| `title` | String | obrigatório |
| `subtitle` | String | default `''` |
| `type` | String | tipo de celebração |
| `message` | String | mensagem aos convidados |
| `displayMode` | enum | `blocks`, `detailed`, `compact` |
| `publicHash` | String | unique — usado em `/l/{hash}` |
| `coverImageUrl` | String | frequentemente data URL |
| `reservedItems` | Number | counter denormalizado |
| `totalItems` | Number | counter denormalizado |
| `theme` | String | default `general` |
| `colorPalette` | String | default `terracotta` |
| `backgroundPattern` | String | default `plain` |
| `featured` | Boolean | ordenação no dashboard |
| `createdAt` / `updatedAt` | Date | timestamps |

## GiftItem — `gift-items-v2`

Model: `src/backend/modules/gift-items/infra/mongoose/gift-item.model.js`  
Model name: `GiftItemV2`

| Campo | Tipo | Notas |
|-------|------|--------|
| `listId` | ObjectId → GiftListV2 | index |
| `userId` | ObjectId → UserV2 | index |
| `name` | String | obrigatório |
| `price` | Number | default `0` |
| `quantity` | Number | default `1` |
| `description` | String | |
| `imageUrl` | String | frequentemente data URL |
| `pixEnabled` | Boolean | default `false` — aceita Pix |
| `pixKey` | String | chave Pix (obrigatória se `pixEnabled`) |
| `pixQrCodeUrl` | String | QR Code opcional (data URL; reutilizado por hash) |
| `pixQrCodeHash` | String | SHA-256 da imagem do QR (deduplicação) |
| `reservations` | Array | subdocumentos de reserva |
| `createdAt` / `updatedAt` | Date | timestamps |

Índice composto: `{ listId: 1, createdAt: 1 }`.

### Subdocumento `reservations[]`

| Campo | Tipo | Notas |
|-------|------|--------|
| `guestName` | String | obrigatório |
| `guestPhone` | String | obrigatório |
| `quantity` | Number | default `1` |
| `createdAt` / `updatedAt` | Date | timestamps do subdoc |
| `_id` | ObjectId | |

## Campos derivados (repositório)

Calculados na camada de repositório, não persistidos como campos principais:

- `reservedQuantity` — soma das quantidades reservadas
- `availableQuantity` — quantidade restante
- `isReserved` — se não há disponibilidade

## Observações

- Excluir uma lista remove também seus itens.
- Criar item com quantidade N pode criar N documentos (um por unidade).
- Imagens embutidas no banco aumentam o tamanho dos documentos; não há limpeza/CDN.
- Campos `theme` e `featured` existem no schema; a UI usa pouco ou não expõe por completo.
- QR Code Pix: antes de gravar, o backend calcula o hash da imagem e, se outro item do mesmo usuário já tiver o mesmo hash, reutiliza o `pixQrCodeUrl` existente.
