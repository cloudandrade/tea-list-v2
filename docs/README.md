# Tea List v2 — Documentação

Criador e gerenciador de **listas de presentes** para celebrações (casamento, casa nova, chá de bebê, aniversário, missionário, etc.).

O dono da conta cria listas personalizadas, cadastra itens e compartilha um link público. Convidados reservam presentes informando nome e telefone — **sem pagamento** e sem login.

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [Setup](./setup.md) | Como rodar o projeto localmente |
| [Arquitetura](./arquitetura.md) | Estrutura, camadas e fluxos principais |
| [API](./api.md) | Endpoints REST `/api/v2` |
| [Modelo de dados](./modelo-de-dados.md) | Collections MongoDB e relacionamentos |

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + CSS Modules |
| Banco | MongoDB + Mongoose 8 |
| Auth | Cookie httpOnly + HMAC-SHA256 (`AUTH_SECRET`) |
| Senhas | bcryptjs |
| Idiomas | pt-BR / en-US (provider próprio) |

## Visão rápida das rotas

| Rota | Descrição |
|------|-----------|
| `/` | Login |
| `/register` | Cadastro |
| `/dashboard` | Listas do usuário autenticado |
| `/dashboard/lists/new` | Criar lista |
| `/dashboard/lists/[listId]` | Gerenciar lista e itens |
| `/dashboard/lists/[listId]/edit` | Editar lista |
| `/l/[publicHash]` | Lista pública (convidados) |

## O que existe vs. o que não existe

**Implementado:** auth por e-mail/senha, CRUD de listas e itens, personalização visual (paletas, texturas, modos de exibição), link público, reserva por convidado, i18n, toasts.

**Não implementado:** pagamentos, OAuth, reset de senha, e-mail, upload em object storage (imagens vão como data URL no Mongo), middleware de proteção de rotas, Docker, testes automatizados.

Alguns pontos da UI são stub (perfil, “esqueceu senha”, links legais).
