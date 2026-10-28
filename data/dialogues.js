// Falas dos personagens. who = id do personagem (src/art.js) ou 'nota' para o caderno de campo.
// *texto* aparece destacado. journal = desbloqueia conceito no diário ao exibir a fala.
const DIALOGUES = {
  // ---------- PRÓLOGO ----------
  p_chegada: [
    { who: 'nota', name: 'Caderno de campo', text: 'Arquipélago de Aurora. Chegamos de barco à Estação Aurora, onde fica o Coração do Clima. Luna deve estar me esperando.' },
    { who: 'nota', name: 'Caderno de campo', text: 'Para andar, use *W A S D* ou as *setas*. Siga a *seta dourada* até o objetivo.' },
  ],
  p_luna_intro: [
    { who: 'luna', text: 'Que bom que você chegou! Eu sou a Luna, cientista do clima aqui da Estação Aurora.' },
    { who: 'luna', text: 'Para conversar ou examinar algo, chegue perto e aperte *E* (ou toque no botão E).' },
    { who: 'luna', text: 'Temos um problema: o *Coração do Clima*, nossa estação científica, parou de funcionar. Sem ele, ninguém registra o tempo do arquipélago.' },
    { who: 'luna', text: 'Antes de consertar qualquer coisa, preciso saber se você pensa como cientista. Olhe para o céu...' },
    { who: 'luna', text: 'Hoje está chovendo. *Isso significa que o clima desta região é chuvoso?*', choices: [
      { text: 'Sim! Se está chovendo, o clima é chuvoso.', reply: [{ who: 'luna', text: 'Muita gente pensa assim! Mas um dia de chuva só mostra o que acontece *agora*. Vamos investigar antes de concluir.' }] },
      { text: 'Não sei... acho que precisamos observar mais.', reply: [{ who: 'luna', text: 'Ótimo instinto! Um cientista desconfia de conclusões tiradas de um único dia.' }] },
    ] },
    { who: 'luna', text: 'Investigue duas pistas: o *painel do tempo de hoje*, perto da trilha, e o *arquivo de 30 anos*, a oeste. Depois volte para conversar comigo.' },
  ],
  p_luna_wait: [
    { who: 'luna', text: 'Já olhou as duas pistas? O *painel do tempo de hoje* e o *arquivo de 30 anos*. A seta dourada mostra o caminho.' },
  ],
  p_luna_pre: [
    { who: 'luna', text: 'E então? O que o painel e o arquivo mostraram?' },
    { who: 'player', text: 'O painel fala do que está acontecendo hoje. O arquivo mostra o que costuma acontecer ao longo de muitos anos.' },
    { who: 'luna', text: 'Exato! Vamos organizar essas ideias. Separe as frases em *tempo atmosférico* e *clima*.' },
  ],
  p_luna_post: [
    { who: 'luna', text: 'Excelente! Agora você sabe a diferença: o *tempo* muda de hora em hora; o *clima* é o padrão de muitos anos.' },
    { who: 'luna', text: 'Então, respondendo à minha pergunta: a chuva de hoje *não basta* para dizer que o clima é chuvoso. Precisamos de registros longos.' },
    { who: 'luna', text: 'Venha, vamos ver o que aconteceu com o Coração do Clima. A porta fica no prédio da cúpula.' },
  ],
  p_luna_go: [{ who: 'luna', text: 'A porta do Coração do Clima fica bem na frente da cúpula. Vá na frente, eu já te alcanço!' }],
  p_luna_done: [{ who: 'luna', text: 'Abra o *mapa* (tecla M) para seguir até a Ilha dos Céus Mutantes. Boa viagem!' }],
  p_painel: [
    { who: 'nota', name: 'Painel do tempo — hoje', text: 'HOJE, 9h: *chuva fraca* · 22 °C · umidade do ar 90% · vento fraco vindo do mar.' },
    { who: 'nota', name: 'Painel do tempo — hoje', text: 'Previsão para a tarde: o céu deve abrir, com *sol entre nuvens*. Temperatura de até 27 °C.', journal: 'tempo_atmosferico' },
    { who: 'player', text: 'Então até o tempo de hoje vai mudar em poucas horas! O painel descreve o *momento*.' },
  ],
  p_arquivo_pre: [
    { who: 'player', text: 'Um arquivo com registros diários de 30 anos! Vou ver o que ele diz sobre Aurora.' },
  ],
  p_arquivo_pos: [
    { who: 'player', text: 'A chuva de hoje é só um dia. O *clima* é o padrão que aparece quando juntamos muitos anos de registros.' },
  ],
  p_instr: [
    { who: 'luna', text: 'Esse é um dos instrumentos do nosso jardim meteorológico. Logo você vai aprender a ler cada um deles na Ilha dos Céus Mutantes!' },
  ],
  p_coracao_fechado: [
    { who: 'nota', name: 'Porta do Coração do Clima', text: 'A porta está emperrada. Luna disse para investigar as pistas primeiro.' },
  ],
  p_coracao: [
    { who: 'luna', text: 'Veja: a antena está torta e os painéis estão apagados. Faltam os *quatro módulos* da estação!' },
    { who: 'luna', text: 'Uma grande tempestade espalhou os módulos pelas ilhas: Atmosfera, Água, Paisagens e Cidades. Cada ilha guarda um.' },
    { who: 'luna', text: 'Para recuperá-los, vamos investigar os fenômenos de cada lugar. Lembre-se: a ciência não controla o clima. Ela *observa, mede e explica*.' },
    { who: 'luna', text: 'Tome, esta é sua *caderneta de campo*. Tudo o que você descobrir vai para o *Diário científico* (tecla J).' },
  ],

  // ---------- CAPÍTULO 1 ----------
  c1_chegada: [
    { who: 'nota', name: 'Caderno de campo', text: 'Ilha dos Céus Mutantes. Dizem que aqui o céu muda de cara várias vezes no mesmo dia. Repare no quadro “Tempo agora”, no canto da tela.' },
  ],
  c1_luna_intro: [
    { who: 'luna', text: 'Boas-vindas à Ilha dos Céus Mutantes! Olhe para cima: em poucos minutos o céu muda de sol para nuvens, de garoa para ventania.' },
    { who: 'luna', text: 'Para entender o tempo, precisamos *medir*. Temos um jardim meteorológico no centro da ilha e um anemômetro no morro.' },
    { who: 'luna', text: 'Leia o *termômetro* (dentro do abrigo branco), o *pluviômetro* e o *anemômetro*. Depois converse com *Seu Joaquim*, o pescador — ele observa o céu há quarenta anos.' },
  ],
  c1_antes: [{ who: 'nota', name: 'Caderno de campo', text: 'Melhor falar com Luna primeiro. Ela está no acampamento da praia.' }],
  c1_luna_wait: [{ who: 'luna', text: 'Continue medindo! Precisamos ler os três instrumentos e ouvir o Seu Joaquim antes de analisar os registros.' }],
  c1_luna_reg: [{ who: 'luna', text: 'Ótimas medições! Agora vá até a minha *mesa de registros*, ao lado da barraca. Lá estão os dados desta semana.' }],
  c1_abrigo: [
    { who: 'nota', name: 'Abrigo meteorológico', text: 'Uma caixa branca, com frestas para o ar passar. Dentro dela, à sombra, fica o termômetro.' },
  ],
  c1_pluv: [{ who: 'nota', name: 'Pluviômetro', text: 'Um funil recolhe a chuva em um tubo com escala em milímetros. A água acumulada é das últimas 24 horas.' }],
  c1_anem: [{ who: 'nota', name: 'Anemômetro e biruta', text: 'No alto do morro, as conchas do anemômetro giram com o vento. Ao lado, a biruta listrada se enche de ar.' }],
  c1_ja_lido: [{ who: 'nota', name: 'Caderno de campo', text: 'Já registrei essa medição no Diário (tecla J).' }],
  c1_joaquim: [
    { who: 'joaquim', text: 'Ô, cientista! Aqui na ilha a gente diz: “não gostou do tempo? Espera meia hora”.' },
    { who: 'joaquim', text: 'De manhã sai sol, à tarde vem chuvarada, de noite venta. É o *tempo* que muda. Mas todo ano é parecido: verão chuvoso, inverno mais seco.' },
    { who: 'joaquim', text: 'Pra saber se vem chuva, eu olho meu *higrômetro*. Ele mostra a umidade do ar. Dá uma olhada!' },
  ],
  c1_joaquim_pos: [
    { who: 'joaquim', text: 'Isso aí! Mas um conselho de pescador velho: um dia úmido não diz como é o ano inteiro. Para isso, precisa anotar por muito tempo.' },
  ],
  c1_joaquim_done: [{ who: 'joaquim', text: 'Boa pescaria de dados pra você! Hehe.' }],
  c1_reg_cedo: [{ who: 'nota', name: 'Mesa de registros', text: 'Papéis com números da semana. Antes de analisar, preciso fazer minhas próprias medições e ouvir o Seu Joaquim.' }],
  c1_reg_pos: [{ who: 'player', text: 'Pronto! Cinco dias mostram como o *tempo* variou nesta semana — mas não bastam para descrever o clima. Vou contar para a Luna.' }],
  c1_luna_fim: [
    { who: 'luna', text: 'Perfeito! Você mediu os *elementos do clima* — temperatura, chuva, vento e umidade — e não confundiu uma semana com o clima da ilha.' },
    { who: 'luna', text: 'Uma última curiosidade: sabe por que existem as estações do ano? Não é porque a Terra fica mais perto ou mais longe do Sol.' },
    { who: 'luna', text: 'O eixo da Terra é *inclinado*. Durante a *translação*, ao longo do ano, cada hemisfério recebe a luz do Sol mais direta em uma época e mais inclinada em outra.', journal: 'estacoes_ano' },
    { who: 'luna', text: 'E o Sol aquece o planeta de forma desigual: isso movimenta o ar e forma os ventos. Pronto, encontrei o *Módulo Atmosfera* perto da biruta!' },
  ],
  c1_luna_done: [{ who: 'luna', text: 'Abra o mapa (M). Nosso próximo destino são as Montanhas das Nuvens!' }],

  // ---------- CAPÍTULO 2 ----------
  c2_chegada: [
    { who: 'nota', name: 'Caderno de campo', text: 'Montanhas das Nuvens. Deste lado, perto do mar, tudo é verde e úmido. Do outro lado da serra, dizem que quase não chove. Por quê?' },
  ],
  c2_luna_intro: [
    { who: 'luna', text: 'Sentiu a garoa? Aqui o vento sopra do mar e traz *ar úmido* contra a montanha.' },
    { who: 'luna', text: 'Primeira tarefa: suba a trilha e meça a temperatura nos *três marcos de altitude*. Repare no que acontece com o ar lá em cima.' },
    { who: 'luna', text: 'Depois, venha ao *Laboratório de Nuvens*, na barraca. Vamos simular o caminho do ar sobre a montanha.' },
  ],
  c2_luna_wait: [{ who: 'luna', text: 'Siga as missões: marcos de altitude, Laboratório de Nuvens, Mirante do Rio e Dona Cida, do outro lado da passagem.' }],
  c2_alt0: [{ who: 'nota', name: 'Marco da trilha — 50 m', text: 'Perto do mar, a 50 metros de altitude, o termômetro marca *24 °C*.' }],
  c2_alt1: [{ who: 'nota', name: 'Marco da trilha — 600 m', text: 'A 600 metros de altitude: *20 °C*. Está ficando mais fresco e a neblina aumenta.' }],
  c2_alt2: [
    { who: 'nota', name: 'Marco da passagem — 1.200 m', text: 'Na passagem da serra, a 1.200 metros: *17 °C*. As nuvens estão grudadas na encosta!' },
    { who: 'player', text: 'Quanto mais alto, mais frio: caiu 7 °C do mar até aqui. Será que isso explica as nuvens?', journal: 'temperatura_altitude' },
  ],
  c2_lab_cedo: [{ who: 'luna', text: 'Antes do laboratório, faça as medições nos três marcos de altitude. Vamos precisar desses dados!' }],
  c2_lab_pos: [{ who: 'luna', text: 'Viu? A montanha não “fabrica” chuva: ela obriga o ar a subir. Subindo, ele esfria, e o vapor vira nuvem.' }],
  c2_mirante: [{ who: 'nota', name: 'Mirante do Rio', text: 'Daqui se vê o mar, as nuvens na serra e o rio descendo de volta ao mar. Parece um grande ciclo...' }],
  c2_mirante_done: [{ who: 'nota', name: 'Mirante do Rio', text: 'A água do rio vai voltar ao mar — e o ciclo continua, sem começo nem fim.' }],
  c2_cida_cedo: [{ who: 'cida', text: 'Oi, jovem cientista! Faça primeiro o experimento da Luna e depois me conte por que aqui é tão seco.' }],
  c2_cida: [
    { who: 'cida', text: 'Boas-vindas ao lado seco da serra! Do outro lado chove quase todo dia. Aqui, a gente guarda água da chuva na *cisterna*.' },
    { who: 'cida', text: 'Meu avô dizia que “a serra segura a chuva”. Você, que fez o experimento, sabe explicar?' },
  ],
  c2_cida_pos: [{ who: 'cida', text: 'Então é isso! O ar chega aqui mais seco. Por isso nossas plantas são diferentes e a gente cuida tão bem da água.', journal: 'chuva_orografica' }],
  c2_cida_done: [{ who: 'cida', text: 'Volte sempre! E feche bem a cisterna, viu?' }],
  c2_luna_fim: [
    { who: 'luna', text: 'Você mediu a temperatura em altitudes diferentes, simulou a chuva na montanha e montou o ciclo da água. Que expedição!' },
    { who: 'luna', text: 'Lembre-se: o relevo *influencia* a chuva, mas não é o único fator. O vento, a umidade e a distância do mar também contam.' },
    { who: 'luna', text: 'Olha só o que a Dona Cida achou presa na cerca: o *Módulo Água*!' },
  ],
  c2_luna_done: [{ who: 'luna', text: 'Próxima parada: a Floresta e a Terra Seca. Abra o mapa (M).' }],

  // ---------- CAPÍTULO 3 ----------
  c3_chegada: [
    { who: 'nota', name: 'Caderno de campo', text: 'Uma ilha, duas paisagens: a oeste, floresta densa e úmida; a leste, terra seca com cactos. O riacho no meio separa os dois mundos.' },
  ],
  c3_luna_intro: [
    { who: 'luna', text: 'Aqui vamos agir como detetives da paisagem. Por que a vegetação é tão diferente dos dois lados do riacho?' },
    { who: 'luna', text: 'Junte *evidências*: os dados das duas *estações meteorológicas*, o *solo* de cada lado e o que dizem *Iara*, a bióloga, e *Seu Benedito*, o agricultor.' },
    { who: 'luna', text: 'Depois, organize tudo na *mesa de análise*, aqui perto da ponte.' },
  ],
  c3_luna_wait: [{ who: 'luna', text: 'Ainda faltam evidências. Confira as missões (tecla Q).' }],
  c3_estF: [{ who: 'nota', name: 'Estação da Floresta', text: 'Médias de 30 anos (dados fictícios): chuva de cerca de *2.400 mm por ano*, bem distribuída em todos os meses. Temperatura média em torno de *25 °C*.' }],
  c3_estS: [{ who: 'nota', name: 'Estação da Terra Seca', text: 'Médias de 30 anos (dados fictícios): cerca de *600 mm de chuva por ano*, quase toda de janeiro a abril. Depois, meses secos. Temperatura média em torno de *27 °C*.' }],
  c3_soloF: [{ who: 'nota', name: 'Solo da floresta', text: 'Escuro, úmido e fofo, cheio de folhas e galhos em decomposição. Isso é *matéria orgânica*.' }],
  c3_soloS: [{ who: 'nota', name: 'Solo da Terra Seca', text: 'Claro, seco e pedregoso, com pouca matéria orgânica. Na seca, a superfície racha.' }],
  c3_iara: [
    { who: 'iara', text: 'Olá! Sou a Iara, bióloga. Aqui chove o ano todo, então as árvores crescem altas e mantêm as folhas verdes.' },
    { who: 'iara', text: 'As folhas que caem viram adubo e deixam o solo escuro. E a floresta devolve umidade ao ar pela *transpiração* das plantas.' },
  ],
  c3_bene: [
    { who: 'benedito', text: 'Bom dia! Benedito, às ordens. Aqui a chuva vem forte no começo do ano e depois some por muitos meses.' },
    { who: 'benedito', text: 'Repara nas plantas: muitas *perdem as folhas na seca* para gastar menos água. O mandacaru *guarda água* no caule. É sabedoria da natureza!' },
  ],
  c3_ja: [{ who: 'nota', name: 'Caderno de campo', text: 'Já anotei essa evidência.' }],
  c3_analise_cedo: [{ who: 'nota', name: 'Mesa de análise', text: 'Antes de analisar, preciso reunir todas as evidências: estações, solos e as duas conversas.' }],
  c3_luna_fim: [
    { who: 'luna', text: 'Excelente trabalho de detetive! Você relacionou *clima, solo e vegetação* usando evidências.' },
    { who: 'luna', text: 'E foi cuidadoso: são *tendências*, não regras absolutas. O relevo, o tipo de rocha e as ações humanas também mudam a paisagem.' },
    { who: 'luna', text: 'O *Módulo Paisagens* estava escondido debaixo da ponte. Faltam só as cidades!' },
  ],
  c3_luna_done: [{ who: 'luna', text: 'Vamos para a cidade de Pedra-Sol. Abra o mapa (M).' }],

  // ---------- CAPÍTULO 4 ----------
  c4_chegada: [
    { who: 'nota', name: 'Caderno de campo', text: 'Cidade de Pedra-Sol, 14h. Muito asfalto, muito concreto, poucas árvores. O ar parece tremer de tão quente.' },
  ],
  c4_luna_intro: [
    { who: 'luna', text: 'Ufa, que calor! Os moradores dizem que o centro de Pedra-Sol “não esfria nunca”.' },
    { who: 'luna', text: 'Vamos investigar com dados. Use o termômetro em *três lugares*, todos às 14h: o *parque*, a *avenida* e o *estacionamento*.' },
    { who: 'luna', text: 'Medir no mesmo horário é importante: assim a comparação é justa.' },
  ],
  c4_luna_wait: [{ who: 'luna', text: 'Faltam medições. Os marcos com bandeirinha amarela mostram onde medir.' }],
  c4_luna_comp: [{ who: 'luna', text: 'Medições completas! Vamos comparar os números.' }],
  c4_luna_after_comp: [{ who: 'luna', text: 'Agora procure a *engenheira Marina*, em frente à prefeitura. Ela quer planejar um bairro mais fresco.' }],
  c4_mparque: [{ who: 'nota', name: 'Parque arborizado — 14h', text: 'Sombra das árvores, grama e uma fonte. Termômetro: *28 °C*.' }],
  c4_mrua: [{ who: 'nota', name: 'Avenida asfaltada — 14h', text: 'Asfalto escuro, prédios dos dois lados e quase nenhuma sombra. Termômetro: *34 °C*.' }],
  c4_mestac: [{ who: 'nota', name: 'Estacionamento — 14h', text: 'Um mar de asfalto e carros ao sol. Termômetro: *36 °C*.' }],
  c4_teo: [
    { who: 'teo', text: 'O escorregador tá pelando! Não dá pra brincar de tarde.' },
    { who: 'teo', text: 'No parque é bem mais fresquinho. Por que não tem árvore aqui também?' },
  ],
  c4_marina_cedo: [{ who: 'marina', text: 'Olá! Antes de planejar, preciso dos dados. Meça as temperaturas e compare com a Luna, por favor.' }],
  c4_marina: [
    { who: 'marina', text: 'Sou a Marina, engenheira da prefeitura. Seus dados mostram uma *ilha de calor*: o asfalto esquenta muito mais que o parque.' },
    { who: 'marina', text: 'Temos um orçamento para melhorar um bairro. Vamos testar ideias no *planejador urbano*?' },
  ],
  c4_marina_pos: [{ who: 'marina', text: 'Já comecei a plantar as primeiras árvores e a reformar dois telhados! Dê uma volta e repare na cidade.' }],
  c4_marina_done: [{ who: 'marina', text: 'Uma cidade mais verde também ajuda a água da chuva a infiltrar. Obrigada pela ajuda!' }],
  c4_luna_global: [
    { who: 'luna', text: 'Ficou mais fresco por aqui! Agora, um desafio importante.' },
    { who: 'luna', text: 'Tem gente dizendo que a ilha de calor e o aquecimento global são a mesma coisa. Vamos separar as ideias?' },
  ],
  c4_luna_fim: [
    { who: 'luna', text: 'Isso! A ilha de calor é *local*. As mudanças climáticas são *globais*. As duas têm influência humana, mas em escalas diferentes.' },
    { who: 'luna', text: 'E aqui está o *Módulo Cidades*. Agora temos os quatro! Vamos voltar à Estação Aurora para o grande desafio.' },
  ],
  c4_luna_done: [{ who: 'luna', text: 'Abra o mapa (M) e volte ao Coração do Clima!' }],

  // ---------- CAPÍTULO 5 ----------
  c5_chegada: [
    { who: 'nota', name: 'Caderno de campo', text: 'De volta à Estação Aurora, ao entardecer. Os quatro módulos estão na mochila. Três consoles brilham em volta da cúpula.' },
  ],
  c5_luna_intro: [
    { who: 'luna', text: 'Chegou a hora! Os módulos só funcionam se alguém usar tudo o que aprendeu para resolver problemas reais.' },
    { who: 'luna', text: 'Cada *console* traz um problema: uma *decisão com a previsão do tempo*, uma *comparação entre regiões* e o *plano de um bairro* com calor e alagamentos.' },
    { who: 'luna', text: 'Resolva os três e depois ative o *Coração do Clima*. Pode usar o Diário (J) à vontade: cientista consulta suas anotações!' },
  ],
  c5_luna_wait: [{ who: 'luna', text: 'Os consoles que já brilham em verde estão resolvidos. Falta pouco!' }],
  c5_luna_ready: [{ who: 'luna', text: 'Os três consoles estão verdes! Vá até a porta do Coração do Clima e ative a estação.' }],
  c5_cedo: [{ who: 'nota', name: 'Console', text: 'O console pisca, esperando. Melhor falar com Luna primeiro.' }],
  c5_resolvido: [{ who: 'nota', name: 'Console', text: 'Problema resolvido. A luz verde indica que este módulo está pronto.' }],
  c5_cidade_intro: [{ who: 'nota', name: 'Console 3 — Cidade', text: 'Pedido da prefeitura de Pedra-Sol: o bairro sofre com *calor* à tarde e *alagamentos* nas chuvas fortes. Planeje melhorias e teste com uma chuva forte.' }],
  c5_coracao_cedo: [{ who: 'luna', text: 'Ainda não! Primeiro resolva os três consoles.' }],
  c5_ativar: [
    { who: 'luna', text: 'Módulo Atmosfera... Módulo Água... Módulo Paisagens... Módulo Cidades... encaixados!' },
    { who: 'player', text: 'Ativando o Coração do Clima!' },
  ],
  c5_final: [
    { who: 'luna', text: 'Funcionou! Os sensores de todas as ilhas voltaram a enviar dados!' },
    { who: 'luna', text: 'Mas lembre: a estação *não controla* o clima. Ela mede e registra. Com muitos anos de dados, entendemos os padrões e tomamos decisões melhores.' },
    { who: 'luna', text: 'Agora você faz parte dos *Guardiões do Clima*. Obrigada por essa expedição!' },
  ],
};
