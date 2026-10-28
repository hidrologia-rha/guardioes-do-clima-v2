# Documento de design — Guardiões do Clima

## Visão
Aventura 2D em visão de cima levemente inclinada (3/4). O estudante aprende climatologia **investigando**: anda pelo cenário, observa o tempo mudando, lê instrumentos, faz experimentos e usa evidências para decidir. Múltipla escolha aparece só como uma das formas de registrar conclusões, junto com classificação, ordenação, seleção de evidências e dois laboratórios simulados.

Mensagem central: a ciência não controla o clima; ela observa, mede, explica e ajuda a decidir melhor.

## Público e duração
10 a 12 anos (6º ano). Prólogo + 5 capítulos, 10–15 min cada. Textos curtos, palavras-chave destacadas, sem cronômetro e sem perda de progresso.

## Laço de jogo
1. Chegar à região (diálogo de chegada, objetivo no HUD, seta dourada).
2. Explorar e interagir (E / toque) com personagens, instrumentos e marcos.
3. Desafios e laboratórios: erro → pista contextual e nova tentativa; acerto → explicação.
4. Conceitos entram no Diário; medições entram em “Registros de campo”.
5. Última missão → módulo recuperado → cartão de capítulo → mapa com o próximo destino.

## Sistemas
| Sistema | Arquivo | Notas |
|---|---|---|
| Laço, regiões, API de roteiros | `src/game.js` | passos fixos de 50 ms (estável em PCs lentos) |
| Mundo, entidades, tempo atmosférico | `src/world.js` | tempo fixo, em ciclo (cap. 1) ou por zonas (caps. 2 e 3) |
| Colisão | `src/collision.js` | círculo do jogador × polígonos de terra/água, círculos e retângulos |
| Câmera | `src/camera.js` | segue suavemente, limitada ao mapa, ajusta zoom à tela |
| Diálogo | `src/dialogue.js` | máquina de escrever, destaques `*assim*`, escolhas |
| Missões | `src/missions.js` | tarefas simples ou compostas (`needs`), alvo da seta |
| Desafios | `src/challenges.js` | `quiz`, `sort`, `order`, `evidence`, `info` + figuras SVG |
| Laboratórios | `src/climate-lab.js` | chuva orográfica; planejador urbano (modelo puro `CityModel`, testado) |
| Progresso e relatório | `src/progression.js` | estado, itens, diário, tentativas por atividade |
| Salvamento | `src/persistence.js` | LocalStorage com proteção contra erro |
| Interface | `src/ui.js` | HUD, painéis, mapa SVG, configurações, relatório, telas |
| Áudio | `src/audio.js` | WebAudio sintetizado (ambiente de chuva/vento, música calma, efeitos) com legendas |

Os capítulos são **dados** (`data/chapters.js`): mapa, missões e pequenos roteiros assíncronos que chamam `api.say`, `api.challenge`, `api.lab`, `api.complete`. Textos ficam em `data/dialogues.js` e `data/challenges.js`.

## Capítulos
- **Prólogo — A Estação Desaparecida:** está chovendo; Luna pergunta se isso torna o clima chuvoso. Pistas: painel do tempo de hoje × arquivo de 30 anos (climograma). Classificar frases em tempo/clima. Recompensa: caderneta.
- **Cap. 1 — Céus Mutantes:** o tempo muda em ciclo de ~76 s (sol → nublado → chuva → ventania), visível no HUD. Leituras de termômetro (abrigo), pluviômetro, anemômetro/biruta, higrômetro. Tabela de 5 dias: “uma semana não define o clima”. Luna explica translação, inclinação do eixo e estações.
- **Cap. 2 — Montanhas das Nuvens:** chuva e neblina dependem do lado da serra. Medir 24 → 20 → 17 °C subindo a trilha. Laboratório: umidade e altura da montanha mudam onde o ar condensa. Ordenar o ciclo da água. Dona Cida explica a vida no sotavento.
- **Cap. 3 — Floresta e Terra Seca:** coletar evidências nos dois lados do riacho; comparar climogramas; marcar evidências válidas (e rejeitar “hoje faz sol”); escolher a conclusão cuidadosa (tendências, não regras).
- **Cap. 4 — A Cidade que Não Esfria:** medir parque/avenida/estacionamento às 14h; comparar; planejador urbano; ao concluir, árvores e telhados verdes aparecem na cidade e o calor do HUD diminui; separar ilha de calor (local) de mudança climática (global).
- **Cap. 5 — O Grande Desafio:** previsão do tempo e probabilidade; comparar três regiões; bairro com metas de temperatura e escoamento + teste de chuva forte. Ativar o Coração do Clima, encerramento e relatório.

## Feedback e acessibilidade
- Pistas sempre contextuais (por opção errada), símbolos ✓ / ✗ / ? além das cores, foco visível, botões grandes.
- Configurações: volumes, velocidade do texto (inclui instantâneo), legendas de sons, texto maior, reduzir animações.
- Teclado completo; controles de toque em telas sensíveis ao toque; layout adaptado a telas estreitas.
- Objeto alto na frente do personagem fica translúcido para ele nunca sumir.

## Decisões técnicas
- Scripts clássicos (não módulos ES) para o jogo abrir com duplo clique em `index.html` (módulos ES são bloqueados em `file://`).
- Arte procedural com cache em canvas por sprite: sem arquivos externos, fácil de substituir por imagens.
- Terreno pintado uma vez por região em um canvas fora da tela; a cada quadro só se desenha a parte visível.
