# Guia de arte

Não havia gerador de imagens disponível; toda a arte é **pintada em código** (Canvas 2D e SVG) seguindo o guia abaixo. O mesmo guia serve para quem quiser substituir os sprites por ilustrações.

## Direção
Aventura ilustrada, aquarela tropical, visão de cima levemente inclinada (3/4). Formas arredondadas, copas pintadas em camadas, sombras suaves no chão, luz vindo do **alto à esquerda** (lado esquerdo dos objetos mais claro).

## Paleta
| Uso | Cores |
|---|---|
| Vegetação | `#2c5424` `#3f7a32` `#62a446` `#a4d77a` (úmida: `#1c3d1c` → `#86c066`) |
| Terra seca | `#c9a86a` `#d8b97c` `#b38f58`, troncos `#7b6a58` |
| Água | `#2f8db0` `#1d6a8e`, espuma `#a0ebf0` |
| Trilhas | `#c9ab7a` / pedra `#d4c8ad` |
| Cidade | asfalto `#55585c`, calçada `#bdb6a6`, faixa `#e8c43a` |
| Interface | papel `#f6ecd4`, madeira `#7a4f2c`, verde-azulado `#176f6c`, sol `#f2b33d` |

Interface = caderno de campo: papel, bordas de madeira, títulos em serifa (Palatino/Georgia), texto em Trebuchet.

## Camadas de cada região
1. Terreno pré-pintado: base + manchas suaves, áreas (areia, terra seca, asfalto, floresta…), trilhas com pedrinhas, tufos de grama e flores, objetos planos (píer, barco, ponte).
2. Brilhos animados na água.
3. Objetos e personagens ordenados por profundidade (y); balanço das árvores com o vento.
4. Bancos de nuvens nas montanhas.
5. Sombras de nuvens passando pelo chão.
6. Efeitos de tela: chuva com respingos, folhas ao vento, neblina, calor, raios de sol, vinheta.

## Personagens
Proporção “chibi” (cabeça grande), contorno sem linha, 4 direções, balanço ao andar. Cada um tem silhueta própria: Luna (cabelo cacheado, jaleco, lenço verde-azulado, óculos de proteção), Joaquim (chapéu de palha, barba), Dona Cida (lenço amarelo), Iara (trança, colete verde), Benedito (chapéu, bigode branco), Marina (capacete amarelo, colete laranja), Téo (criança, boné vermelho). Retratos dos diálogos usam o mesmo desenho ampliado.

## Substituindo por ilustrações
1. Salve a imagem em `assets/<categoria>/` (PNG com transparência, desenhada em 2× para telas nítidas).
2. Registre em `data/asset-manifest.js` com o **mesmo nome do sprite** de `src/art.js`:
   ```js
   tree_round: { src: 'assets/environments/arvore.png', w: 130, h: 160, ox: 65, oy: 145 },
   ```
   `w,h` = tamanho no mundo; `ox,oy` = ponto de apoio (onde o objeto toca o chão).
3. Nenhuma lógica precisa mudar: colisão e interação continuam vindo do catálogo de sprites e de `data/chapters.js`.

Nomes de sprites: `tree_round tree_tropical palm pine tree_dry cactus shrub flower_bush dry_shrub fern rock rock_big mountain cloud_bank house building building_green prefeitura tent board totem table_notes abrigo pluviometro anemometro biruta higrometro thermo_post station_mini console fountain bench lamp car cisterna soil_dark soil_light playground flat_dock flat_boat flat_bridge flat_crosswalk`. A estação científica (`station`) e os personagens são desenhados por `drawStation` e `Art.character`.
