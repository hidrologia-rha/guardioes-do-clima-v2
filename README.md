# Guardiões do Clima — A Missão das Quatro Estações

Aventura educativa 2D sobre climatologia para o 6º ano do Ensino Fundamental (BNCC: EF06GE03, EF06GE04, EF06GE05, EF06GE13).
O jogador explora o arquipélago fictício de Aurora com a cientista Luna: lê instrumentos, faz experimentos, interpreta gráficos e planeja uma cidade mais fresca para reativar a estação científica Coração do Clima.

HTML5 + CSS3 + JavaScript puro, Canvas 2D e SVG. Sem frameworks, sem dependências, sem internet, sem cadastro.

## Como jogar

**Jeito mais simples:** dê dois cliques em `index.html` para abrir em um navegador moderno (Chrome, Edge, Firefox ou Safari atualizados).

**Com servidor local (opcional; útil se o navegador da escola bloquear arquivos locais):**

```bash
python -m http.server 8765
```

Depois acesse `http://localhost:8765`. Para publicar, envie a pasta inteira para qualquer hospedagem de páginas estáticas (GitHub Pages, Netlify etc.).

### Controles

| Ação | Teclado | Toque |
|---|---|---|
| Andar | W A S D ou setas | controle circular |
| Conversar / examinar / avançar | E, Espaço ou Enter | botão E |
| Missões, Diário, Mochila, Mapa | Q, J, I, M | botões no topo |
| Pausa / fechar janela | Esc | botão Pausa |

A seta dourada aponta para o próximo objetivo. O progresso é salvo automaticamente no navegador (LocalStorage) a cada missão.

## Campanha (≈ 60–90 min)

| Capítulo | Região | Mecânicas |
|---|---|---|
| Prólogo | Estação Aurora | tutorial, painel do tempo, climograma de 30 anos, classificar tempo × clima |
| 1 | Ilha dos Céus Mutantes | tempo que muda em ciclo; leitura de termômetro, pluviômetro, anemômetro/biruta e higrômetro; tabela de 5 dias |
| 2 | Montanhas das Nuvens | chuva por zona (barlavento × sotavento); medir temperatura em 3 altitudes; laboratório de chuva orográfica; ordenar o ciclo da água |
| 3 | Floresta e Terra Seca | coletar evidências (estações, solo, entrevistas); comparar climogramas; selecionar evidências |
| 4 | Cidade que Não Esfria | medir temperaturas às 14h; planejador urbano (ilha de calor); local × global; a cidade muda visualmente |
| 5 | O Grande Desafio | três problemas integradores (previsão, regiões, bairro com calor e alagamento) e encerramento |

Ao final (ou a qualquer momento, no menu de Pausa) há um **relatório de aprendizagem** formativo, que pode ser impresso.

## Estrutura

```
index.html
styles/   base.css · interface.css · game.css · animations.css
src/      main.js game.js input.js player.js world.js camera.js collision.js dialogue.js
          missions.js challenges.js climate-lab.js progression.js persistence.js ui.js
          art.js (arte procedural) · audio.js (som sintetizado)
data/     chapters.js dialogues.js challenges.js educational-content.js asset-manifest.js
assets/   characters/ environments/ objects/ interface/ audio/  (vazias: para ilustrações futuras)
docs/     game-design.md educational-matrix.md art-guide.md testing-report.md
tests/    city-model.test.js (Node) · autoplay.js (navegador)
```

Conteúdo pedagógico (textos, perguntas, dados) fica em `data/`; a lógica fica em `src/`; a arte pode ser trocada por imagens via `data/asset-manifest.js` (veja `docs/art-guide.md`).

## Testes

```bash
node tests/city-model.test.js
```

No navegador (com o servidor local), abra o console e rode `await import('/tests/autoplay.js'); await AutoPlay.chapter('prologo')` para jogar um capítulo automaticamente. Detalhes em `docs/testing-report.md`.

Todos os dados meteorológicos, regiões e personagens são **fictícios e didáticos**.
