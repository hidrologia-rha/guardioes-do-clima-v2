# Relatório de testes — 28/10/2026

Ambiente: Windows 11, Python 3.14 (`python -m http.server 8765`), Node 24, navegador embutido do Claude Desktop (Chromium). Testes no navegador foram feitos com o roteiro `tests/autoplay.js`, que usa as mesmas funções da interface (cliques nos botões dos desafios, diálogos, mapa), mais verificações manuais por captura de tela.

## Resultado por item

| Item | Como foi testado | Resultado |
|---|---|---|
| Carregamento inicial | abrir `http://localhost:8765` | ✅ tela inicial animada, sem erros |
| Erros de JavaScript | contador de `error`/`unhandledrejection` durante campanha e testes de colisão/toque | ✅ nenhum erro (um erro antigo no console era de uma versão intermediária, antes de os capítulos 1–5 existirem) |
| Menu inicial | Novo jogo (com confirmação ao sobrescrever save), Continuar, Configurações, Para professores | ✅ |
| Movimentação | teclas simuladas (W/D) e eixo do joystick | ✅ personagem anda; joystick gera eixo (−0,92 para cima) |
| Colisões | andar contra o prédio da estação e em direção ao mar | ✅ para em y = 308 diante do prédio; não entra na água |
| Interações | diálogos, escolhas, painéis, instrumentos, NPCs, consoles | ✅ |
| Desafios | quiz, classificar, ordenar, evidências, fichas; erro proposital → pista; acerto → explicação | ✅ pista contextual exibida, nova tentativa permitida |
| Laboratórios | Laboratório de Nuvens (passos guiados), planejador urbano (plano vazio recusado com dica; plano válido aceito; teste de chuva) | ✅ |
| Progressão | campanha completa a partir de **Novo jogo**: Prólogo → Cap. 1 → … → Cap. 5 | ✅ 6/6 capítulos, 15/15 conceitos no diário, 6/6 itens |
| Salvamento e carregamento | salvar no meio do Cap. 1, recarregar a página, Continuar | ✅ capítulo, posição (800, 620), tarefas e medições restaurados |
| Mudança visual da cidade | após o planejador do Cap. 4 | ✅ árvores e telhados verdes aparecem; carros saem; HUD baixa de 34 °C para 32 °C |
| Redimensionamento | painel estreito (~800 px), largura desktop e emulação de celular 375×812 | ✅ HUD se reorganiza; controles de toque aparecem; zoom ajusta para o mapa preencher a tela; sem rolagem horizontal |
| Conclusão da campanha | ativar o Coração do Clima | ✅ estação brilha, diálogo final, tela de encerramento, relatório |
| Relatório de aprendizagem | após a campanha e no menu de pausa | ✅ atividades, conceitos (bons indícios / vale revisar / não praticado) e recomendações; botão de impressão |
| Modelo da cidade | `node tests/city-model.test.js` | ✅ metas dos caps. 4 e 5 alcançáveis dentro do orçamento; toldo não reduz escoamento |
| Integridade dos dados | `node tests/data-integrity.test.js` | ✅ diálogos/desafios/alvos existem; cada pergunta tem 1 resposta certa, pistas e explicações |

## Problemas encontrados e corrigidos
- Painéis abriam atrás da tela inicial e da tela final (z-index) → corrigido.
- Árvores grandes escondiam o personagem → objetos altos à frente dele ficam translúcidos.
- Montanhas do Cap. 2 bloqueavam a passagem → colisão da serra virou muralha invisível com passagem.
- Em computadores lentos o jogo e o laboratório ficavam em câmera lenta → passos fixos de 50 ms.
- Rótulos sobrepostos no Laboratório de Nuvens; árvores vazando das quadras no planejador → reposicionados/recortados.
- Joystick falhava se `setPointerCapture` lançasse erro → protegido.
- Textos com gênero (“Bem-vindo”, “um Guardião”) → linguagem neutra; “cinco módulos” → “quatro módulos”.

## Pendências / não verificado
- **Abrir por `file://` (duplo clique):** o navegador de testes converte arquivos locais em instantâneos estáticos, então não foi possível testar. O jogo usa apenas scripts clássicos e nenhum `fetch`, o que funciona em `file://` nos navegadores atuais; se algum navegador bloquear, use o servidor local.
- **Toque real** em tablet/celular: testado só com eventos simulados.
- **Áudio:** sintetizado via WebAudio; volume e legendas verificados no código e na interface, mas o som não foi ouvido no ambiente de teste.
- **Taxa de quadros:** o painel de testes roda a poucos quadros por segundo (limitação do ambiente); o custo medido de desenho é ~1,8 ms por quadro.
- **Leitores de tela:** marcação acessível (rótulos, `aria-live`, foco) incluída, mas não testada com leitor de tela real.
- Validação pedagógica com professores e estudantes reais ainda não foi feita.
