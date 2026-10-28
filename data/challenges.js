// Desafios e laboratórios. Todos os dados numéricos são FICTÍCIOS e DIDÁTICOS (identificados na tela).
// hint = pista quando erra; why = explicação quando acerta.
const FICT = 'Dados fictícios, criados para fins didáticos.';

const CHALLENGES = {
  // ---------- PRÓLOGO ----------
  p_arquivo: { type: 'info', kind: 'Arquivo da estação', title: 'Arquivo de 30 anos da Estação Aurora',
    figure: { kind: 'climograph', title: 'Estação Aurora — médias de 30 anos', rain: [260, 230, 210, 120, 60, 25, 15, 20, 55, 130, 190, 240], temp: [27, 27, 26, 25, 23, 21, 21, 22, 24, 25, 26, 27], caption: FICT },
    text: '<p>Este gráfico junta <b>30 anos</b> de registros diários.</p><ul><li>As <b>barras azuis</b> mostram a chuva média de cada mês.</li><li>A <b>linha vermelha</b> mostra a temperatura média.</li></ul><p>Em Aurora, os verões (dezembro a março) costumam ser <b>quentes e chuvosos</b>, e os invernos (junho a agosto) costumam ser <b>mais secos e amenos</b>.</p><p>Esse padrão que se repete ano após ano é o <b>clima</b>.</p>',
    concepts: ['clima'] },
  p_tempo_clima: { type: 'sort', kind: 'Desafio', title: 'Tempo ou clima?', concepts: ['tempo_atmosferico', 'clima'],
    prompt: 'Cada frase fala de um momento (tempo atmosférico) ou de um padrão de muitos anos (clima)?',
    categories: [
      { id: 'tempo', label: 'Tempo atmosférico', short: 'Tempo', desc: 'o que acontece agora, em horas ou poucos dias' },
      { id: 'clima', label: 'Clima', short: 'Clima', desc: 'o padrão observado ao longo de muitos anos' },
    ],
    items: [
      { t: 'Hoje de manhã choveu forte na estação.', cat: 'tempo', why: '“Hoje de manhã” é um momento específico: tempo atmosférico.', hint: 'Isso aconteceu em um momento só ou se repete há muitos anos?' },
      { t: 'Em Aurora, os verões costumam ser quentes e chuvosos.', cat: 'clima', why: '“Costumam” indica um padrão repetido por muitos anos: clima.', hint: 'Repare na palavra “costumam”. Ela fala de um dia ou de muitos anos?' },
      { t: 'Agora está ventando muito na praia.', cat: 'tempo', why: '“Agora” descreve a condição do momento: tempo atmosférico.', hint: 'A palavra “agora” dá uma pista sobre quanto tempo isso dura.' },
      { t: 'Nos últimos 30 anos, julho foi quase sempre o mês mais seco.', cat: 'clima', why: '30 anos de registros revelam um padrão: clima.', hint: 'Quantos anos de observação essa frase usa?' },
      { t: 'Amanhã a previsão é de sol entre nuvens.', cat: 'tempo', why: 'A previsão fala de um dia específico: é previsão do tempo.', hint: 'A previsão de amanhã descreve um dia só ou o padrão de décadas?' },
      { t: 'Nesta região, os invernos costumam ser secos e amenos.', cat: 'clima', why: 'Descreve como os invernos geralmente são, ano após ano: clima.', hint: 'Essa frase descreve um inverno só ou como os invernos geralmente são?' },
    ],
    wrap: 'Resumo: <b>tempo</b> = condição do momento; <b>clima</b> = padrão de muitos anos (cerca de 30).' },

  // ---------- CAPÍTULO 1 ----------
  c1_termometro: { type: 'quiz', kind: 'Leitura de instrumento', title: 'Termômetro do abrigo', concepts: ['instrumentos', 'elementos'],
    figure: { kind: 'thermometer', value: 26, caption: 'Leitura das 10h. ' + FICT },
    questions: [
      { q: 'Qual temperatura do ar o termômetro marca? Observe onde termina a coluna vermelha.', options: [
        { t: '22 °C', hint: 'Conte os tracinhos a partir do 20: cada um vale 2 °C.' },
        { t: '26 °C', ok: true, why: 'A coluna para três tracinhos acima do 20: 20 + 2 + 2 + 2 = 26 °C.' },
        { t: '30 °C', hint: 'A coluna não chega até o número 30. Conte os tracinhos de 2 em 2.' }] },
      { q: 'Por que o termômetro fica dentro de uma caixa branca, ventilada e na sombra?', options: [
        { t: 'Para medir a temperatura do ar, sem o aquecimento direto do Sol.', ok: true, why: 'Ao sol, o próprio termômetro esquentaria e mostraria um valor maior que a temperatura do ar.' },
        { t: 'Para proteger o termômetro dos animais.', hint: 'Pense no que aconteceria se o Sol batesse direto no termômetro.' },
        { t: 'Para a temperatura ficar sempre igual.', hint: 'O abrigo não impede a temperatura de mudar: ele só evita um erro de medição.' }] },
    ] },
  c1_pluviometro: { type: 'quiz', kind: 'Leitura de instrumento', title: 'Pluviômetro', concepts: ['instrumentos', 'elementos'],
    figure: { kind: 'raingauge', value: 12, caption: 'Chuva acumulada em 24 horas. ' + FICT },
    questions: [
      { q: 'Quanto choveu nas últimas 24 horas?', options: [
        { t: '6 mm', hint: 'Os números da escala vão de 5 em 5. A água passou do 10.' },
        { t: '12 mm', ok: true, why: 'A água chegou dois tracinhos acima do 10: 12 mm.' },
        { t: '20 mm', hint: 'A água não chegou ao número 20. Olhe com atenção a linha azul.' }] },
      { q: 'O que significa “choveu 12 mm”?', options: [
        { t: 'Que a água formaria uma camada de 12 mm de altura no chão, se não escorresse nem infiltrasse.', ok: true, why: 'Isso equivale a 12 litros de água em cada metro quadrado.' },
        { t: 'Que choveu durante 12 minutos.', hint: '“mm” é milímetro, uma medida de altura, não de tempo.' },
        { t: 'Que caíram 12 gotas no pluviômetro.', hint: 'O pluviômetro mede a altura da água acumulada, não o número de gotas.' }] },
    ] },
  c1_anemometro: { type: 'quiz', kind: 'Leitura de instrumento', title: 'Anemômetro e biruta', concepts: ['instrumentos', 'elementos'],
    figure: { kind: 'anemometer', caption: 'O mar fica a leste do morro. ' + FICT },
    questions: [
      { q: 'O que o anemômetro mede?', options: [
        { t: 'A velocidade do vento.', ok: true, why: 'Quanto mais forte o vento, mais rápido as conchas giram.' },
        { t: 'A direção do vento.', hint: 'Quem mostra a direção é a biruta ao lado. O anemômetro gira mais rápido quando...' },
        { t: 'A umidade do ar.', hint: 'Umidade é medida pelo higrômetro. As conchas giram com o quê?' }] },
      { q: 'A biruta se enche de ar e aponta para o oeste. De onde vem o vento?', options: [
        { t: 'Do leste, do lado do mar.', ok: true, why: 'A biruta aponta para onde o vento vai. Ele vem do lado oposto: do leste, onde fica o mar.' },
        { t: 'Do oeste.', hint: 'Imagine uma meia ao vento: ela estica para o lado para onde o vento vai.' }] },
    ] },
  c1_higrometro: { type: 'quiz', kind: 'Leitura de instrumento', title: 'O higrômetro de Seu Joaquim', concepts: ['instrumentos', 'elementos'],
    figure: { kind: 'hygrometer', value: 85, caption: FICT },
    questions: [
      { q: 'O higrômetro marca 85%. O que isso indica?', options: [
        { t: 'O ar está bem úmido, com muito vapor d’água.', ok: true, why: 'A umidade relativa perto de 100% indica ar quase saturado de vapor. Isso favorece nuvens e chuva, mas não garante que vai chover.' },
        { t: 'Que vai chover 85 mm.', hint: 'Chuva é medida em mm pelo pluviômetro. O higrômetro usa porcentagem (%).' },
        { t: 'Que a temperatura é de 85 °C.', hint: 'Temperatura é medida pelo termômetro, em °C.' }] },
    ] },
  c1_registros: { type: 'quiz', kind: 'Análise de dados', title: 'Registros da semana', concepts: ['tempo_atmosferico', 'clima', 'evidencias'],
    figure: { kind: 'table', head: ['Dia', 'Temp. máx.', 'Chuva', 'Vento'], rows: [['Segunda', '27 °C', '0 mm', 'fraco'], ['Terça', '25 °C', '4 mm', 'moderado'], ['Quarta', '22 °C', '18 mm', 'forte'], ['Quinta', '24 °C', '2 mm', 'moderado'], ['Sexta', '28 °C', '0 mm', 'fraco']], caption: 'Estação dos Céus Mutantes, uma semana de março. ' + FICT },
    questions: [
      { q: 'Em qual dia choveu mais?', options: [
        { t: 'Quarta-feira', ok: true, why: 'Quarta teve 18 mm, o maior valor da coluna “Chuva”.' },
        { t: 'Sexta-feira', hint: 'Na sexta não choveu (0 mm). Procure o maior número na coluna “Chuva”.' },
        { t: 'Terça-feira', hint: 'Terça teve 4 mm. Há um dia com mais chuva.' }] },
      { q: 'O que aconteceu com a temperatura no dia mais chuvoso?', options: [
        { t: 'Ela ficou mais baixa que nos dias sem chuva.', ok: true, why: 'Na quarta, com nuvens e chuva, a máxima foi 22 °C. Nos dias sem chuva passou de 27 °C. Nuvens bloqueiam parte da luz do Sol.' },
        { t: 'Ela foi a mais alta da semana.', hint: 'Compare a temperatura de quarta com a de sexta.' }] },
      { q: 'Alguém disse: “Choveu muito na quarta, então o clima da ilha é chuvoso”. O que você responde?', options: [
        { t: 'Cinco dias mostram o tempo desta semana. Para conhecer o clima, precisamos de registros de muitos anos.', ok: true, why: 'Uma semana é uma amostra muito pequena. O clima é descrito com médias de cerca de 30 anos.' },
        { t: 'Está certo, porque choveu 18 mm.', hint: 'Um único dia, ou uma semana, descreve o tempo ou o clima?' },
        { t: 'O clima é definido pelo dia mais quente da semana.', hint: 'O clima não depende de um único dia, nem do mais quente nem do mais chuvoso.' }] },
    ] },
  c1_elementos: { type: 'sort', kind: 'Desafio', title: 'Cada instrumento no seu elemento', concepts: ['instrumentos', 'elementos'],
    prompt: 'Relacione cada instrumento ou fenômeno ao elemento do clima.',
    categories: [{ id: 't', label: 'Temperatura' }, { id: 'p', label: 'Precipitação' }, { id: 'v', label: 'Vento' }, { id: 'u', label: 'Umidade' }],
    items: [
      { t: 'Termômetro', cat: 't', why: 'O termômetro mede a temperatura do ar, em °C.', hint: 'Que unidade aparece no termômetro? °C...' },
      { t: 'Pluviômetro', cat: 'p', why: 'O pluviômetro mede a chuva (precipitação), em mm.', hint: 'Ele tem um funil para recolher o quê?' },
      { t: 'Anemômetro', cat: 'v', why: 'O anemômetro mede a velocidade do vento.', hint: 'As conchas giram empurradas por...' },
      { t: 'Biruta', cat: 'v', why: 'A biruta mostra a direção do vento.', hint: 'A biruta se enche de ar em movimento.' },
      { t: 'Higrômetro', cat: 'u', why: 'O higrômetro mede a umidade relativa do ar, em %.', hint: 'Seu Joaquim usa para saber quanto vapor há no ar.' },
      { t: 'Granizo caindo do céu', cat: 'p', why: 'Granizo é uma forma de precipitação, assim como chuva e neve.', hint: 'Algo que cai da atmosfera é chamado de...' },
    ],
    wrap: 'Os elementos do clima podem ser medidos com instrumentos. Juntos, eles descrevem o tempo de cada momento.' },

  // ---------- CAPÍTULO 2 ----------
  c2_ciclo: { type: 'order', kind: 'Desafio', title: 'O ciclo da água', concepts: ['ciclo_agua'],
    prompt: 'Comece pelo ponto A (o mar aquecido pelo Sol) e organize as etapas do ciclo da água.',
    figure: { kind: 'watercycle', caption: 'Ilustração do Mirante do Rio.' },
    items: [
      { t: 'A — Evaporação: o Sol aquece o mar e a água vira vapor', hint: 'Para formar nuvem, primeiro a água precisa virar vapor com o calor do Sol.' },
      { t: 'B — Condensação: o vapor sobe, esfria e forma nuvens', hint: 'As nuvens se formam depois que o vapor sobe e esfria.' },
      { t: 'C — Precipitação: as gotas crescem e caem como chuva', hint: 'A chuva só cai depois que as nuvens se formam.' },
      { t: 'D — Escoamento e infiltração: a água corre para os rios e entra no solo', hint: 'A água só corre pelo chão depois de cair como chuva.' },
    ],
    hint: 'Siga as letras do desenho: mar, nuvem, chuva na montanha, rio.',
    why: 'Isso! Evaporação → condensação → precipitação → escoamento e infiltração. Depois o rio leva a água de volta ao mar e o ciclo recomeça. As plantas também liberam vapor pela transpiração.' },
  c2_sotavento: { type: 'quiz', kind: 'Desafio', title: 'O lado seco da serra', concepts: ['chuva_orografica'],
    questions: [
      { q: 'Por que o lado de Dona Cida é mais seco?', options: [
        { t: 'O ar deixou boa parte da umidade como chuva do outro lado; ao descer até aqui, ele aquece e fica mais seco.', ok: true, why: 'Esse é o efeito da “sombra de chuva”: o sotavento recebe ar que já perdeu umidade.' },
        { t: 'Porque deste lado a terra fica mais perto do Sol.', hint: 'A diferença de distância até o Sol é minúscula. Lembre do experimento: o que aconteceu com o ar ao passar pela montanha?' },
        { t: 'Porque o vento não consegue passar pela montanha.', hint: 'O vento passa, sim: no experimento, o ar chegou ao outro lado. Mas como ele chegou?' }] },
      { q: 'Como se chama o lado da montanha voltado para o vento úmido, onde chove mais?', options: [
        { t: 'Barlavento', ok: true, why: 'Barlavento é o lado que recebe o vento. O lado oposto é o sotavento.' },
        { t: 'Sotavento', hint: 'Sotavento é o lado protegido do vento, onde Dona Cida mora.' },
        { t: 'Planície', hint: 'Planície é uma forma de relevo, não um lado da montanha.' }] },
    ] },

  // ---------- CAPÍTULO 3 ----------
  c3_climogramas: { type: 'quiz', kind: 'Análise de gráficos', title: 'Dois climogramas', concepts: ['climograma'],
    figure: { kind: 'row', items: [
      { kind: 'climograph', title: 'Estação da Floresta', rain: [260, 250, 280, 230, 190, 150, 140, 130, 160, 200, 220, 250], temp: [26, 26, 26, 25, 25, 24, 24, 25, 25, 26, 26, 26] },
      { kind: 'climograph', title: 'Estação da Terra Seca', rain: [110, 130, 150, 100, 30, 10, 5, 3, 5, 10, 20, 50], temp: [28, 28, 27, 27, 26, 25, 25, 26, 27, 28, 29, 29] }],
      caption: 'Médias de 30 anos. ' + FICT },
    questions: [
      { q: 'Qual região recebe mais chuva ao longo do ano?', options: [
        { t: 'A Floresta', ok: true, why: 'As barras da Floresta são altas em todos os meses (cerca de 2.400 mm por ano).' },
        { t: 'A Terra Seca', hint: 'Compare a altura das barras azuis dos dois gráficos, mês a mês.' },
        { t: 'As duas recebem a mesma quantidade', hint: 'Olhe os meses de junho a setembro nos dois gráficos.' }] },
      { q: 'Como a chuva se distribui na Terra Seca?', options: [
        { t: 'Concentrada de janeiro a abril, com vários meses muito secos depois.', ok: true, why: 'Quase toda a chuva cai em quatro meses. De maio a dezembro chove muito pouco.' },
        { t: 'Bem distribuída em todos os meses.', hint: 'Veja os meses de junho a setembro: as barras quase somem.' },
        { t: 'Mais forte de junho a agosto.', hint: 'Procure os meses com as barras mais altas.' }] },
      { q: 'E a temperatura média?', options: [
        { t: 'As duas regiões são quentes; a Terra Seca é um pouco mais quente.', ok: true, why: 'As linhas vermelhas ficam entre 24 °C e 29 °C. A grande diferença entre as regiões está na chuva.' },
        { t: 'A Floresta é muito mais fria.', hint: 'Compare as linhas vermelhas: a diferença é de poucos graus.' }] },
    ] },
  c3_evidencias: { type: 'evidence', kind: 'Explicar com evidências', title: 'Por que as paisagens são diferentes?', concepts: ['clima_vegetacao_solo', 'evidencias'],
    claim: 'A oeste do riacho há uma floresta densa; a leste, vegetação baixa, com cactos e plantas que perdem as folhas na seca.',
    items: [
      { t: 'Oeste: chuva abundante e bem distribuída ao longo do ano (médias de 30 anos).', ok: true, hint: 'Os dados de chuva das estações ajudam a explicar a vegetação.' },
      { t: 'Leste: chuva concentrada em poucos meses e longa estação seca (médias de 30 anos).', ok: true, hint: 'A estação seca da Terra Seca também é uma evidência importante.' },
      { t: 'Solo da floresta escuro, úmido e rico em matéria orgânica.', ok: true, hint: 'O solo também conta: lembre do que você examinou dos dois lados.' },
      { t: 'Plantas do leste perdem as folhas na seca ou guardam água no caule.', ok: true, hint: 'O que Seu Benedito contou sobre as plantas também é evidência.' },
      { t: 'Hoje está fazendo sol na Terra Seca.', hint: 'O sol de hoje é tempo atmosférico, não clima. Um dia não explica a vegetação.' },
      { t: 'A ponte sobre o riacho é de madeira.', hint: 'Essa informação é verdadeira, mas não tem relação com a vegetação.' },
    ],
    why: 'Você combinou dados de clima, solo e observações das plantas. Boas explicações juntam várias evidências.' },
  c3_conclusao: { type: 'quiz', kind: 'Conclusão', title: 'Qual conclusão é mais cuidadosa?', concepts: ['clima_vegetacao_solo'],
    questions: [
      { q: 'Escolha a conclusão mais cuidadosa e científica:', options: [
        { t: 'Clima, solo, relevo e vegetação se influenciam. O clima ajuda muito a explicar a paisagem, mas não é o único fator.', ok: true, why: 'Na natureza, as relações são tendências. Sempre vale procurar outros fatores, como relevo, rochas e ações humanas.' },
        { t: 'Onde chove, sempre nasce uma floresta.', hint: 'Cuidado com a palavra “sempre”. Existem lugares chuvosos sem floresta, por exemplo, por causa do desmatamento.' },
        { t: 'O solo não tem nenhuma relação com a vegetação.', hint: 'Lembre do solo escuro da floresta: as folhas que caem formam esse solo.' }] },
    ] },

  // ---------- CAPÍTULO 4 ----------
  c4_medicoes: { type: 'quiz', kind: 'Análise de dados', title: 'Comparando as medições', concepts: ['ilha_calor'],
    figure: { kind: 'bars', unit: ' °C', min: 20, max: 40, items: [{ label: 'Parque', v: 28, col: '#4c8a37' }, { label: 'Avenida', v: 34, col: '#e0582f' }, { label: 'Estacionamento', v: 36, col: '#b5452f' }], caption: 'Medições às 14h do mesmo dia. ' + FICT },
    questions: [
      { q: 'Qual lugar estava mais quente?', options: [
        { t: 'O estacionamento', ok: true, why: '36 °C: muito asfalto ao sol e nenhuma sombra.' },
        { t: 'O parque', hint: 'O parque tem a barra mais curta. Procure a mais comprida.' },
        { t: 'A avenida', hint: 'A avenida estava quente, mas um lugar estava ainda mais.' }] },
      { q: 'Por que o parque estava mais fresco?', options: [
        { t: 'As árvores fazem sombra e liberam umidade; grama e solo aquecem menos que o asfalto.', ok: true, why: 'Sombra e transpiração das plantas refrescam o ar. O asfalto escuro absorve e guarda muito calor.' },
        { t: 'Porque o parque fica mais longe do Sol.', hint: 'Alguns quarteirões de distância não mudam nada em relação ao Sol. O que há de diferente no chão e na vegetação?' },
        { t: 'Porque as medições foram feitas em horários diferentes.', hint: 'Boa desconfiança! Mas todas foram feitas às 14h. A diferença vem do lugar.' }] },
      { q: 'Como se chama esse fenômeno, em que áreas construídas ficam mais quentes que áreas verdes próximas?', options: [
        { t: 'Ilha de calor urbana', ok: true, why: 'A ilha de calor é um fenômeno local, causado pela forma como construímos as cidades.' },
        { t: 'Chuva orográfica', hint: 'Chuva orográfica tem a ver com montanhas e ar úmido.' },
        { t: 'Estação seca', hint: 'Estação seca é um período do ano com pouca chuva.' }] },
    ] },
  c4_local_global: { type: 'sort', kind: 'Desafio', title: 'Local ou global?', concepts: ['mudanca_global', 'ilha_calor'],
    prompt: 'Cada frase fala da ilha de calor (fenômeno local) ou das mudanças climáticas globais (o planeta todo)?',
    categories: [
      { id: 'l', label: 'Ilha de calor (local)', short: 'Local', desc: 'acontece em partes de uma cidade' },
      { id: 'g', label: 'Mudança climática global', short: 'Global', desc: 'alterações no clima do planeta inteiro, ao longo de décadas' },
    ],
    items: [
      { t: 'O estacionamento está 8 °C mais quente que o parque ao lado.', cat: 'l', why: 'Diferença entre dois lugares próximos da mesma cidade: ilha de calor.', hint: 'A distância entre o parque e o estacionamento é grande ou pequena?' },
      { t: 'A temperatura média do planeta aumentou nas últimas décadas.', cat: 'g', why: 'Fala do planeta inteiro, ao longo de décadas: mudança climática global.', hint: 'A frase fala de uma cidade ou do planeta?' },
      { t: 'Plantar árvores deixou a praça do centro mais fresca à tarde.', cat: 'l', why: 'Uma ação local que alivia o calor de um lugar.', hint: 'O efeito aconteceu em uma praça ou no mundo todo?' },
      { t: 'A queima de combustíveis fósseis aumenta os gases de efeito estufa na atmosfera.', cat: 'g', why: 'Esses gases se espalham pela atmosfera de todo o planeta.', hint: 'Os gases ficam presos em uma rua ou se espalham pela atmosfera?' },
      { t: 'À noite, o centro da cidade demora mais para esfriar que o campo.', cat: 'l', why: 'Asfalto e concreto liberam à noite o calor guardado durante o dia: ilha de calor.', hint: 'Compare o centro e o campo próximos: escala local ou planetária?' },
      { t: 'Geleiras de várias partes do mundo estão diminuindo.', cat: 'g', why: 'Um sinal observado em muitos lugares do mundo: escala global.', hint: '“Várias partes do mundo” indica que escala?' },
    ],
    wrap: 'Os dois fenômenos têm influência humana, mas em escalas diferentes: a ilha de calor é local; as mudanças climáticas são globais.' },

  // ---------- CAPÍTULO 5 ----------
  c5_previsao: { type: 'quiz', kind: 'Problema 1 — Previsão do tempo', title: 'A trilha da turma', concepts: ['decisao_dados', 'tempo_atmosferico'],
    figure: { kind: 'table', head: ['Amanhã', 'Manhã (6h–12h)', 'Tarde (12h–18h)', 'Noite'], rows: [['Céu', 'sol entre nuvens', 'nublado, pancadas de chuva', 'nublado'], ['Chance de chuva', '10%', '80%', '40%'], ['Temperatura', '21 a 26 °C', 'até 27 °C', '22 °C'], ['Vento', 'fraco', 'moderado, com rajadas', 'fraco']], caption: 'Previsão do tempo para a Estação Aurora. ' + FICT },
    questions: [
      { q: 'A turma quer fazer uma trilha de 3 horas amanhã. Qual é o melhor plano?', options: [
        { t: 'Sair às 8h e voltar antes do meio-dia, levando capa de chuva por precaução.', ok: true, why: 'De manhã a chance de chuva é de só 10%. À tarde sobe para 80%, com rajadas de vento.' },
        { t: 'Sair às 14h, que é o horário mais quente.', hint: 'Veja a chance de chuva e o vento à tarde.' },
        { t: 'Cancelar, porque vai chover o dia inteiro.', hint: 'Compare a manhã e a tarde: a previsão é igual o dia todo?' }] },
      { q: '“80% de chance de chuva à tarde” significa que:', options: [
        { t: 'a chuva é bem provável, mas não é certeza.', ok: true, why: 'Previsões trabalham com probabilidade. 80% é alta, por isso vale se preparar.' },
        { t: 'vão cair 80 mm de chuva.', hint: 'A porcentagem é uma chance, não uma quantidade de chuva (mm).' },
        { t: 'vai chover durante 80% da tarde.', hint: 'A porcentagem indica a chance de chover, não quanto tempo a chuva dura.' }] },
      { q: 'Se amanhã chover muito, o clima da Estação Aurora vai mudar?', options: [
        { t: 'Não. Um dia chuvoso é tempo atmosférico; o clima é o padrão de muitos anos.', ok: true, why: 'Exatamente o que você descobriu no Prólogo!' },
        { t: 'Sim, o clima passa a ser chuvoso.', hint: 'Lembre da pergunta da Luna no Prólogo...' }] },
    ] },
  c5_regioes: { type: 'quiz', kind: 'Problema 2 — Comparar regiões', title: 'Três regiões do continente vizinho', concepts: ['clima_vegetacao_solo', 'temperatura_altitude', 'evidencias'],
    figure: { kind: 'table', head: ['Região', 'Chuva por ano', 'Meses secos', 'Temp. média', 'Relevo'], rows: [['Vale Verde', '1.900 mm', '1', '25 °C', 'planície com rios'], ['Planalto dos Ventos', '1.300 mm', '5', '19 °C', 'planalto a 1.100 m'], ['Sertão do Sol', '550 mm', '8', '28 °C', 'depressão baixa']], caption: 'Médias de 30 anos. ' + FICT },
    questions: [
      { q: 'Qual região provavelmente tem a vegetação mais densa e alta?', options: [
        { t: 'Vale Verde', ok: true, why: 'Muita chuva, quase sem meses secos e rios: condições que favorecem vegetação densa. É uma tendência, não uma regra.' },
        { t: 'Sertão do Sol', hint: 'Plantas grandes e densas precisam de muita água ao longo do ano. Compare chuva e meses secos.' },
        { t: 'Planalto dos Ventos', hint: 'Compare a chuva anual e os meses secos com os do Vale Verde.' }] },
      { q: 'Por que o Planalto dos Ventos tem a menor temperatura média?', options: [
        { t: 'Por causa da altitude: lugares mais altos costumam ser mais frios.', ok: true, why: 'Como nas Montanhas das Nuvens: a temperatura do ar geralmente diminui com a altitude.' },
        { t: 'Porque chove menos que no Vale Verde.', hint: 'O Sertão chove ainda menos e é o mais quente. Olhe a coluna “Relevo”.' },
        { t: 'Porque tem cinco meses secos.', hint: 'O Sertão tem oito meses secos e é o mais quente. A resposta está no relevo.' }] },
      { q: 'No Sertão do Sol, o que você espera encontrar com mais frequência nas plantas?', options: [
        { t: 'Adaptações à seca, como perder as folhas ou guardar água.', ok: true, why: 'Com oito meses secos, plantas que economizam água têm mais chance de sobreviver.' },
        { t: 'Folhas enormes, que precisam de chuva o ano todo.', hint: 'Oito meses secos combinam com plantas que gastam muita água?' }] },
    ] },
};

// Grade do bairro: b = prédio, r = rua (vertical), h = rua (horizontal), p = estacionamento, g = área verde
const BAIRRO = ['brpprb', 'brpprg', 'hhhhhh', 'bprbpb'];

const LABS = {
  c2_orografia: { type: 'orografia', title: 'Laboratório de Nuvens', concepts: ['chuva_orografica', 'temperatura_altitude'],
    intro: 'O vento sopra do mar em direção à montanha. Mude a umidade e a altura e observe o caminho do ar.',
    steps: [
      { short: 'Ar úmido soprado contra a montanha', text: '1. Escolha umidade <b>Alta</b> e clique em <b>Soprar o vento do mar</b>. Observe a temperatura e o que acontece quando o ar passa da linha do nível de condensação.', until: 'rainHigh' },
      { short: 'Onde chove mais', quiz: { q: '2. Onde se formaram as nuvens e a chuva?', options: [
        { t: 'Na encosta voltada para o mar (barlavento).', ok: true, why: 'O ar úmido sobe por esse lado, esfria e o vapor se condensa.' },
        { t: 'Igualmente nos dois lados da montanha.', hint: 'Compare os dois pluviômetros da simulação: barlavento e sotavento.' },
        { t: 'Sobre o mar.', hint: 'Sobre o mar o ar ainda não subiu. Onde ele começa a subir?' }] } },
      { short: 'Por que forma nuvem', quiz: { q: '3. Por que o vapor virou nuvem ao subir a montanha?', options: [
        { t: 'O ar esfriou ao subir, e o vapor d’água se condensou em gotículas.', ok: true, why: 'Veja os termômetros: 26 °C no mar e bem menos no topo. Ar mais frio guarda menos vapor.' },
        { t: 'Porque a montanha produz nuvens.', hint: 'A montanha não fabrica nuvens: ela obriga o ar a subir. O que acontece com a temperatura?' },
        { t: 'Porque o ar esquentou ao subir.', hint: 'Compare as temperaturas no nível do mar e no topo.' }] } },
      { short: 'Teste com ar seco', text: '4. Agora troque para umidade <b>Baixa</b> e deixe o vento soprar por alguns segundos.', until: 'lowObserved' },
      { short: 'Comparação', quiz: { q: '5. Com o ar seco (umidade baixa), o que aconteceu?', options: [
        { t: 'O ar subiu e esfriou, mas tinha pouco vapor: quase não formou nuvens nem chuva.', ok: true, why: 'Para chover, não basta subir: é preciso ter bastante vapor d’água no ar.' },
        { t: 'Choveu ainda mais do que antes.', hint: 'Olhe o contador de chuva da simulação.' }] } },
    ],
    wrap: 'Conclusão: o relevo obriga o ar a subir; ao subir, ele esfria e o vapor se condensa. Por isso o barlavento recebe mais chuva e o sotavento costuma ser mais seco.' },
  c4_cidade: { type: 'cidade', title: 'Planejador urbano de Pedra-Sol', concepts: ['ilha_calor', 'escoamento_urbano'],
    intro: 'Escolha uma ferramenta e toque nas quadras para mudar o bairro. Meta: deixar o bairro mais fresco às 14h.',
    grid: BAIRRO, budget: 10, goals: { temp: 1.5 },
    hints: { temp: 'Dica: árvores esfriam a própria quadra e também as vizinhas. Os estacionamentos são as quadras mais quentes.', runoff: '' },
    wrap: 'Seu plano baixou a temperatura média do bairro! Árvores e áreas verdes fazem sombra e liberam umidade, refrescando o ar.' },
  c5_cidade: { type: 'cidade', title: 'Problema 3 — Bairro sem calor e sem alagamento', concepts: ['ilha_calor', 'escoamento_urbano'],
    intro: 'O bairro sofre com calor à tarde e com alagamentos nas chuvas fortes. Cumpra as duas metas e teste o plano com uma chuva forte.',
    grid: BAIRRO, budget: 16, goals: { temp: 2, runoff: 70, rainTest: true },
    hints: { temp: 'Dica: a temperatura ainda está alta. Árvores nos estacionamentos refrescam a quadra e as vizinhas.', runoff: 'Dica: muita água ainda escorre. Telhados verdes, piso permeável e áreas com árvores ajudam a água a infiltrar. O toldo faz sombra, mas não segura a água.' },
    wrap: 'Plano aprovado! Menos calor e menos água correndo pelas ruas: as soluções verdes ajudam nos dois problemas ao mesmo tempo.' },
};

// Atividades que entram no relatório de aprendizagem (desafios avaliados + laboratórios).
const ACTIVITIES = {};
function registerActivities() {
  for (const [id, c] of Object.entries(CHALLENGES)) if (c.type !== 'info') ACTIVITIES[id] = { title: c.title, concepts: c.concepts || [] };
  for (const [id, l] of Object.entries(LABS)) ACTIVITIES[id] = { title: l.title, concepts: l.concepts || [] };
}
registerActivities();
