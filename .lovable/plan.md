
# Radar - Localizador de Empresas Local

## Resumo
Nova funcionalidade "Radar" que funciona como um localizador de empresas na localidade do usuario. O usuario informa sua cidade/bairro e o Radar usa IA para encontrar ~20 empresas locais. Inclui uma animacao premium estilo "robo scanner" durante a busca.

## O que sera criado

### 1. Nova pagina: Radar (`src/pages/Radar.tsx`)
- Campo para o usuario informar sua cidade/bairro (ex: "Araruama, Iguabinha")
- Botao "Ativar Radar" para iniciar a busca
- Exibe resultados em cards com as empresas encontradas
- Opcao de salvar leads em Clientes
- Reutiliza a edge function `generate-leads` ja existente (mesma logica de IA com Gemini)

### 2. Animacao premium: RadarScanAnimation (`src/components/radar/RadarScanAnimation.tsx`)
- Animacao fullscreen em Canvas com estetica de "radar/scanner"
- Circulo de radar girando com "sweep" verde/ciano
- Pontos aparecendo como empresas sendo detectadas
- Steps progressivos: "Escaneando regiao...", "Detectando empresas...", "Analisando oportunidades...", etc.
- Visual diferente da NeuralAnimation (globo) - aqui sera um radar de verdade

### 3. Componente de resultados: RadarResults (`src/components/radar/RadarResults.tsx`)
- Lista de empresas encontradas com nome, segmento, localizacao
- Reutiliza o tipo `Lead` ja existente
- Botoes para salvar lead e gerar abordagem

### 4. Navegacao
- Novo icone "Radar" na sidebar (ambos os modos: simples e avancado)
- Icone: `Radar` do lucide-react
- Posicao: abaixo de "Encontrar Clientes" em ambos os modos
- Adicionado tambem na barra mobile
- Nova rota `/radar` em `App.tsx`

## Detalhes Tecnicos

### Arquivos a criar:
- `src/pages/Radar.tsx` - Pagina principal
- `src/components/radar/RadarScanAnimation.tsx` - Animacao do radar scanner
- `src/components/radar/RadarResults.tsx` - Tela de resultados

### Arquivos a modificar:
- `src/components/AppSidebar.tsx` - Adicionar item "Radar" nos dois arrays (simple e advanced)
- `src/components/MobileBottomNav.tsx` - Adicionar item "Radar" nos dois arrays
- `src/App.tsx` - Adicionar rota `/radar`

### Fluxo:
1. Usuario acessa Radar
2. Informa cidade e bairro
3. Clica em "Ativar Radar"
4. Animacao de radar scanner aparece (canvas com sweep circular)
5. Edge function `generate-leads` e chamada com a localidade como "cidade" e sem nicho especifico (busca geral)
6. Resultados exibidos em cards
7. Usuario pode salvar leads ou iniciar nova busca

### Diferencial visual do Radar vs Encontrar Clientes:
- Encontrar Clientes: globo 3D, busca por nicho + cidade
- Radar: scanner circular local, busca apenas por localidade (todos os nichos), visual de "deteccao proxima"
