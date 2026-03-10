

# Modal de Boas-vindas — Plano de Implementação

## Resumo

Criar um modal de boas-vindas que aparece apenas na primeira vez que o usuário acessa a plataforma após login. Usa `localStorage` para controlar se já foi exibido.

## Abordagem

1. **Novo componente `WelcomeModal.tsx`**
   - Dialog com o conteúdo especificado (título, passos, lembrete, botão)
   - Controle via `localStorage` key `nexia_welcome_shown`
   - Exibido apenas quando o usuário está autenticado e nunca viu o modal
   - Botão "Criar meu primeiro projeto" navega para `/solucoes` e fecha o modal
   - Design limpo seguindo o padrão visual existente (Dialog do projeto, gradients, etc.)

2. **Integração no `ModeAwareContent.tsx`**
   - Renderizar `<WelcomeModal />` dentro do componente que já envolve todo o conteúdo protegido
   - O modal aparece após o modo ser selecionado (não conflita com `ModeSelectionModal`)

## Estrutura do Modal

- Título: 🚀 Bem-vindo ao Nexia
- Texto introdutório sobre criar primeiro projeto
- Duas formas de começar (template pronto / do zero)
- 3 passos recomendados numerados
- Lembrete sobre garantia de 7 dias (com destaque visual sutil)
- Botão principal: "Criar meu primeiro projeto" → navega para `/solucoes`

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/WelcomeModal.tsx` | Criar |
| `src/components/ModeAwareContent.tsx` | Adicionar `<WelcomeModal />` |

