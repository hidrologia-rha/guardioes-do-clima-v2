// Capítulos: mapa da região, missões e roteiros (scripts). Textos ficam em dialogues.js e challenges.js.
// Roteiros recebem a "api" de src/game.js (say, challenge, lab, complete, done...).

// Geografia da Estação Aurora (usada no Prólogo e no Capítulo 5)
const AURORA = {
  size: [1400, 1000], seed: 7, ground: 'lush', spawn: [700, 800],
  land: [[[60, 90], [380, 40], [900, 50], [1340, 100], [1370, 500], [1320, 800], [1000, 860], [780, 850], [700, 880], [620, 850], [400, 860], [120, 820], [40, 500]]],
  areas: [{ type: 'plaza', poly: [[530, 240], [870, 240], [910, 410], [490, 410]] }],
  paths: [
    { pts: [[700, 860], [700, 600], [700, 380]], w: 54 },
    { pts: [[700, 640], [540, 590], [400, 520]], w: 40 },
    { pts: [[700, 560], [880, 520], [1010, 530]], w: 40 },
  ],
  flats: [{ sprite: 'flat_dock', x: 700, y: 845 }, { sprite: 'flat_boat', x: 790, y: 950 }],
  clear: [[500, 120, 400, 320]],
  details: { grass: 1800, flowers: 500, pebbles: 200 },
  station: { sprite: 'station', x: 700, y: 300, top: 300, collide: { x: -130, y: -62, w: 260, h: 58 } },
  scatter: [
    { sprite: 'tree_round', n: 45 }, { sprite: 'palm', n: 9, rect: [80, 690, 1240, 160] },
    { sprite: 'shrub', n: 30 }, { sprite: 'flower_bush', n: 18 }, { sprite: 'rock', n: 10 }, { sprite: 'rock_big', n: 3 },
  ],
};

const CHAPTER_ORDER = ['prologo', 'cap1', 'cap2', 'cap3', 'cap4', 'cap5'];

const CHAPTERS = {
  // ======================= PRÓLOGO =======================
  prologo: {
    label: 'Prólogo', title: 'A Estação Desaparecida', mapNum: 'P', next: 'cap1', reward: 'caderneta',
    synopsis: 'Na Estação Aurora, Luna faz uma pergunta: se hoje chove, o clima daqui é chuvoso? Investigue antes de responder.',
    concepts: ['tempo_atmosferico', 'clima'],
    outro: 'Você descobriu que o tempo muda a cada hora, mas o clima só aparece em muitos anos de registros.',
    tasks: [
      { id: 'p_luna', text: 'Converse com Luna', target: 'luna' },
      { id: 'p_pistas', text: 'Investigue as duas pistas', needs: ['p_painel', 'p_arquivo'], targets: ['painel', 'arquivo'] },
      { id: 'p_desafio', text: 'Conte a Luna o que descobriu', target: 'luna' },
      { id: 'p_coracao', text: 'Examine o Coração do Clima', target: 'coracao' },
    ],
    map: Object.assign({}, AURORA, {
      weather: { base: { rain: .35, clouds: .85, wind: .3, fog: .05, temp: 22, humid: 90 } },
      critters: { birds: 2 },
      objects: [
        AURORA.station,
        { sprite: 'bench', x: 560, y: 440 }, { sprite: 'lamp', x: 650, y: 520 }, { sprite: 'lamp', x: 655, y: 770 },
        { sprite: 'flower_bush', x: 640, y: 420 }, { sprite: 'flower_bush', x: 770, y: 425 },
        { sprite: 'biruta', x: 1110, y: 470 },
      ],
      npcs: [{ id: 'luna', char: 'luna', x: 770, y: 700, label: 'Luna' }],
      interact: [
        { id: 'painel', sprite: 'board', x: 600, y: 650, label: 'Painel do tempo de hoje', verb: 'Ler' },
        { id: 'arquivo', sprite: 'totem', x: 390, y: 480, label: 'Arquivo de 30 anos', verb: 'Consultar' },
        { id: 'coracao', x: 700, y: 330, top: 90, range: 70, label: 'Porta do Coração do Clima', verb: 'Examinar' },
        { id: 'deco1', sprite: 'abrigo', x: 990, y: 480, label: 'Abrigo meteorológico', say: 'p_instr' },
        { id: 'deco2', sprite: 'pluviometro', x: 1050, y: 520, label: 'Pluviômetro', say: 'p_instr' },
        { id: 'deco3', sprite: 'anemometro', x: 930, y: 500, label: 'Anemômetro', say: 'p_instr' },
      ],
    }),
    onEnter: api => api.say('p_chegada'),
    scripts: {
      async luna(api) {
        if (!api.done('p_luna')) { await api.say('p_luna_intro'); api.complete('p_luna'); return; }
        if (!api.all('p_painel', 'p_arquivo')) return api.say('p_luna_wait');
        if (!api.done('p_desafio')) {
          await api.say('p_luna_pre');
          if (await api.challenge('p_tempo_clima')) { api.complete('p_desafio'); await api.say('p_luna_post'); }
          return;
        }
        if (!api.done('p_coracao')) return api.say('p_luna_go');
        return api.say('p_luna_done');
      },
      async painel(api) { await api.say('p_painel'); api.complete('p_painel'); },
      async arquivo(api) {
        await api.say('p_arquivo_pre');
        if (await api.challenge('p_arquivo')) { api.complete('p_arquivo'); await api.say('p_arquivo_pos'); }
      },
      async coracao(api) {
        if (!api.done('p_desafio')) return api.say('p_coracao_fechado');
        if (api.done('p_coracao')) return api.say('p_luna_done');
        await api.say('p_coracao');
        api.complete('p_coracao');
        await api.finishChapter();
      },
    },
  },

  // ======================= CAPÍTULO 1 =======================
  cap1: {
    label: 'Capítulo 1', title: 'A Ilha dos Céus Mutantes', mapNum: '1', next: 'cap2', reward: 'modulo_atmosfera',
    synopsis: 'Nesta ilha o céu muda várias vezes por dia. Meça temperatura, chuva, vento e umidade e interprete os registros sem confundir tempo com clima.',
    concepts: ['elementos', 'instrumentos', 'estacoes_ano'],
    outro: 'Você leu instrumentos meteorológicos e percebeu que poucos dias de registros mostram o tempo, não o clima.',
    tasks: [
      { id: 'c1_luna', text: 'Encontre Luna no acampamento da praia', target: 'luna' },
      { id: 'c1_instr', text: 'Leia os instrumentos meteorológicos', needs: ['c1_term', 'c1_pluv', 'c1_anem'], targets: ['abrigo', 'pluviometro', 'anemometro'] },
      { id: 'c1_joaquim', text: 'Converse com Seu Joaquim, o pescador', target: 'joaquim' },
      { id: 'c1_reg', text: 'Analise os registros na mesa de Luna', target: 'registros' },
      { id: 'c1_fim', text: 'Entregue suas conclusões a Luna', target: 'luna' },
    ],
    map: {
      size: [1600, 1100], seed: 21, ground: 'lush', spawn: [310, 900],
      land: [[[120, 160], [500, 80], [900, 110], [1300, 70], [1520, 260], [1540, 620], [1460, 900], [1150, 1010], [800, 1040], [420, 1010], [150, 930], [70, 600]]],
      areas: [
        { type: 'sand', poly: [[140, 860], [420, 940], [800, 970], [1150, 940], [1450, 850], [1470, 920], [1150, 1020], [800, 1050], [420, 1020], [140, 940]] },
        { type: 'highland', poly: [[1050, 180], [1350, 140], [1480, 300], [1450, 480], [1200, 470], [1060, 350]] },
        { type: 'plaza', poly: [[700, 400], [960, 400], [980, 560], [690, 560]] },
      ],
      paths: [
        { pts: [[300, 920], [450, 840], [600, 700], [780, 580], [830, 470]], w: 46 },
        { pts: [[830, 470], [1000, 420], [1150, 360], [1240, 345]], w: 40 },
        { pts: [[780, 580], [1000, 700], [1180, 790]], w: 40 },
      ],
      flats: [{ sprite: 'flat_dock', x: 300, y: 950 }, { sprite: 'flat_boat', x: 1330, y: 1010 }],
      details: { grass: 2000, flowers: 500, pebbles: 300 },
      critters: { butterflies: 6, birds: 3 },
      weather: { cycle: [
        { dur: 22, rain: 0, clouds: .2, wind: .35, temp: 27, humid: 65 },
        { dur: 18, clouds: .75, wind: .5, temp: 25, humid: 75 },
        { dur: 18, rain: .45, clouds: .95, wind: .6, temp: 22, humid: 92 },
        { dur: 18, clouds: .45, wind: .9, temp: 24, humid: 70 }] },
      scatter: [
        { sprite: 'palm', n: 22, rect: [150, 760, 1300, 260], areas: ['sand', null] },
        { sprite: 'tree_round', n: 30, rect: [100, 100, 1000, 720] },
        { sprite: 'shrub', n: 25 }, { sprite: 'flower_bush', n: 14 }, { sprite: 'rock', n: 10 },
        { sprite: 'rock_big', n: 5, areas: ['highland'] }, { sprite: 'shrub', n: 8, areas: ['highland'] },
      ],
      objects: [
        { sprite: 'tent', x: 520, y: 760 }, { sprite: 'house', x: 1260, y: 760 }, { sprite: 'higrometro', x: 1335, y: 790 },
        { sprite: 'biruta', x: 1320, y: 360 }, { sprite: 'flower_bush', x: 720, y: 420 }, { sprite: 'flower_bush', x: 950, y: 545 },
      ],
      npcs: [
        { id: 'luna', char: 'luna', x: 460, y: 820, label: 'Luna' },
        { id: 'joaquim', char: 'joaquim', x: 1180, y: 830, label: 'Seu Joaquim' },
      ],
      interact: [
        { id: 'abrigo', sprite: 'abrigo', x: 770, y: 470, label: 'Abrigo do termômetro', verb: 'Ler' },
        { id: 'pluviometro', sprite: 'pluviometro', x: 900, y: 490, label: 'Pluviômetro', verb: 'Ler' },
        { id: 'anemometro', sprite: 'anemometro', x: 1250, y: 330, label: 'Anemômetro e biruta', verb: 'Observar' },
        { id: 'registros', sprite: 'table_notes', x: 610, y: 810, label: 'Mesa de registros', verb: 'Analisar' },
      ],
    },
    onEnter: api => api.say('c1_chegada'),
    scripts: {
      async luna(api) {
        if (!api.done('c1_luna')) { await api.say('c1_luna_intro'); api.complete('c1_luna'); return; }
        if (!api.all('c1_term', 'c1_pluv', 'c1_anem', 'c1_joaquim')) return api.say('c1_luna_wait');
        if (!api.done('c1_reg')) return api.say('c1_luna_reg');
        if (!api.done('c1_fim')) { await api.say('c1_luna_fim'); api.complete('c1_fim'); return api.finishChapter(); }
        return api.say('c1_luna_done');
      },
      abrigo: api => readInstrument(api, 'c1_term', 'c1_abrigo', 'c1_termometro', 'c1_temp', '26 °C às 10h'),
      pluviometro: api => readInstrument(api, 'c1_pluv', 'c1_pluv', 'c1_pluviometro', 'c1_chuva', '12 mm'),
      anemometro: api => readInstrument(api, 'c1_anem', 'c1_anem', 'c1_anemometro', 'c1_vento', '≈ 30 km/h, vento vindo do leste'),
      async joaquim(api) {
        if (!api.done('c1_luna')) return api.say('c1_antes');
        if (api.done('c1_joaquim')) return api.say('c1_joaquim_done');
        await api.say('c1_joaquim');
        if (await api.challenge('c1_higrometro')) {
          api.complete('c1_joaquim'); api.record('c1_umid', '85% de umidade relativa'); await api.say('c1_joaquim_pos');
        }
      },
      async registros(api) {
        if (!api.all('c1_term', 'c1_pluv', 'c1_anem', 'c1_joaquim')) return api.say('c1_reg_cedo');
        if (api.done('c1_reg')) return api.say('c1_ja_lido');
        if (!await api.challenge('c1_registros')) return;
        if (!await api.challenge('c1_elementos')) return;
        api.complete('c1_reg'); await api.say('c1_reg_pos');
      },
    },
  },

  // ======================= CAPÍTULO 2 =======================
  cap2: {
    label: 'Capítulo 2', title: 'As Montanhas das Nuvens', mapNum: '2', next: 'cap3', reward: 'modulo_agua',
    synopsis: 'De um lado da serra chove quase todo dia; do outro, quase nunca. Suba a trilha, faça experimentos e descubra o papel do relevo na chuva.',
    concepts: ['temperatura_altitude', 'chuva_orografica', 'ciclo_agua'],
    outro: 'Você viu o ar úmido subir a montanha, esfriar e formar nuvens, e montou o ciclo da água.',
    tasks: [
      { id: 'c2_luna', text: 'Encontre Luna no acampamento da encosta', target: 'luna' },
      { id: 'c2_alt', text: 'Meça a temperatura subindo a trilha', needs: ['c2_alt0', 'c2_alt1', 'c2_alt2'], targets: ['alt0', 'alt1', 'alt2'] },
      { id: 'c2_lab', text: 'Faça o experimento no Laboratório de Nuvens', target: 'lab' },
      { id: 'c2_ciclo', text: 'Monte o ciclo da água no Mirante do Rio', target: 'mirante' },
      { id: 'c2_cida', text: 'Atravesse a passagem e converse com Dona Cida', target: 'cida' },
      { id: 'c2_fim', text: 'Volte e conte tudo a Luna', target: 'luna' },
    ],
    map: {
      size: [1700, 1200], seed: 33, ground: 'lush', spawn: [330, 860],
      land: [[[250, 0], [1700, 0], [1700, 1200], [250, 1200], [220, 900], [240, 600], [200, 300]]],
      lakes: [[[230, 330], [420, 300], [600, 330], [780, 300], [860, 315], [860, 365], [780, 350], [600, 378], [420, 348], [230, 384]]],
      areas: [
        { type: 'highland', poly: [[700, 40], [1080, 40], [1080, 1160], [700, 1160]] },
        { type: 'dry', poly: [[1060, 40], [1660, 40], [1660, 1160], [1060, 1160]] },
      ],
      paths: [{ pts: [[320, 860], [460, 810], [560, 720], [650, 650], [760, 600], [900, 585], [1040, 590], [1200, 620], [1340, 660]], w: 44 }],
      flats: [{ sprite: 'flat_boat', x: 170, y: 880 }],
      details: { grass: 1800, flowers: 250, pebbles: 500, flowerCols: ['#f5f0e6', '#c58ae0'] },
      critters: { birds: 2 },
      weather: { zones: [
        { x: 0, rain: .5, clouds: .9, fog: .25, wind: .45, temp: 24, humid: 95 },
        { x: 650, rain: .55, clouds: .95, fog: .4, wind: .5, temp: 20, humid: 97 },
        { x: 860, rain: .3, clouds: .8, fog: .45, wind: .55, temp: 17, humid: 90 },
        { x: 1100, rain: 0, clouds: .25, fog: 0, heat: .15, wind: .4, temp: 25, humid: 45 },
        { x: 1700, rain: 0, clouds: .15, heat: .25, wind: .35, temp: 28, humid: 40 }] },
      scatter: [
        { sprite: 'tree_tropical', n: 26, rect: [250, 400, 470, 760] },
        { sprite: 'tree_tropical', n: 6, rect: [250, 60, 470, 230] },
        { sprite: 'fern', n: 40, rect: [250, 60, 470, 1100] },
        { sprite: 'pine', n: 14, rect: [700, 60, 160, 1100], areas: ['highland'] },
        { sprite: 'tree_dry', n: 14, areas: ['dry'] }, { sprite: 'cactus', n: 8, areas: ['dry'] },
        { sprite: 'dry_shrub', n: 30, areas: ['dry'] }, { sprite: 'rock', n: 12, areas: ['dry', 'highland'] },
      ],
      objects: [
        // muralha da serra (invisível) com uma passagem no meio
        { collide: { x: 860, y: 0, w: 140, h: 500 }, x: 0, y: 0 }, { collide: { x: 860, y: 680, w: 140, h: 520 }, x: 0, y: 0 },
        { sprite: 'mountain', x: 930, y: 500, collide: false }, { sprite: 'mountain', x: 1000, y: 300, v: 2, scale: .9, collide: false }, { sprite: 'mountain', x: 880, y: 230, v: 3, scale: .8, collide: false },
        { sprite: 'mountain', x: 930, y: 890, v: 1, scale: .6, collide: false }, { sprite: 'mountain', x: 950, y: 1180, v: 4, collide: false }, { sprite: 'mountain', x: 1020, y: 1030, v: 5, scale: .75, collide: false },
        { sprite: 'rock_big', x: 860, y: 690 }, { sprite: 'rock_big', x: 1000, y: 700, v: 2 },
        { sprite: 'cloud_bank', x: 830, y: 330 }, { sprite: 'cloud_bank', x: 860, y: 1000, v: 2 }, { sprite: 'cloud_bank', x: 870, y: 120, v: 3 },
        { sprite: 'house', x: 1430, y: 560 }, { sprite: 'cisterna', x: 1520, y: 620 },
      ],
      npcs: [
        { id: 'luna', char: 'luna', x: 420, y: 830, label: 'Luna' },
        { id: 'cida', char: 'cida', x: 1360, y: 640, label: 'Dona Cida' },
      ],
      interact: [
        { id: 'lab', sprite: 'tent', x: 520, y: 930, label: 'Laboratório de Nuvens', verb: 'Entrar', range: 80 },
        { id: 'alt0', sprite: 'thermo_post', x: 500, y: 770, label: 'Marco de 50 m', verb: 'Medir' },
        { id: 'alt1', sprite: 'thermo_post', x: 650, y: 610, label: 'Marco de 600 m', verb: 'Medir' },
        { id: 'alt2', sprite: 'thermo_post', x: 830, y: 550, label: 'Marco de 1.200 m', verb: 'Medir' },
        { id: 'mirante', sprite: 'board', x: 560, y: 450, label: 'Mirante do Rio', verb: 'Observar' },
      ],
    },
    onEnter: api => api.say('c2_chegada'),
    scripts: {
      async luna(api) {
        if (!api.done('c2_luna')) { await api.say('c2_luna_intro'); api.complete('c2_luna'); return; }
        if (!api.all('c2_alt0', 'c2_alt1', 'c2_alt2', 'c2_lab', 'c2_ciclo', 'c2_cida')) return api.say('c2_luna_wait');
        if (!api.done('c2_fim')) { await api.say('c2_luna_fim'); api.complete('c2_fim'); return api.finishChapter(); }
        return api.say('c2_luna_done');
      },
      alt0: api => measure(api, 'c2_alt0', 'c2_alt0', '24 °C'),
      alt1: api => measure(api, 'c2_alt1', 'c2_alt1', '20 °C'),
      alt2: api => measure(api, 'c2_alt2', 'c2_alt2', '17 °C'),
      async lab(api) {
        if (!api.all('c2_alt0', 'c2_alt1', 'c2_alt2')) return api.say('c2_lab_cedo');
        if (await api.lab('c2_orografia')) { api.complete('c2_lab'); await api.say('c2_lab_pos'); }
      },
      async mirante(api) {
        if (api.done('c2_ciclo')) return api.say('c2_mirante_done');
        await api.say('c2_mirante');
        if (await api.challenge('c2_ciclo')) api.complete('c2_ciclo');
      },
      async cida(api) {
        if (api.done('c2_cida')) return api.say('c2_cida_done');
        if (!api.done('c2_lab')) return api.say('c2_cida_cedo');
        await api.say('c2_cida');
        if (await api.challenge('c2_sotavento')) { api.complete('c2_cida'); await api.say('c2_cida_pos'); }
      },
    },
  },

  // ======================= CAPÍTULO 3 =======================
  cap3: {
    label: 'Capítulo 3', title: 'A Floresta e a Terra Seca', mapNum: '3', next: 'cap4', reward: 'modulo_paisagens',
    synopsis: 'Duas paisagens lado a lado. Reúna evidências de clima, solo e vegetação para explicar por que elas são tão diferentes.',
    concepts: ['climograma', 'clima_vegetacao_solo', 'evidencias'],
    outro: 'Você leu climogramas e explicou as paisagens com várias evidências, sem transformar tendências em regras absolutas.',
    tasks: [
      { id: 'c3_luna', text: 'Encontre Luna perto da ponte', target: 'luna' },
      { id: 'c3_dados', text: 'Colete os dados das duas estações', needs: ['c3_estF', 'c3_estS'], targets: ['estF', 'estS'] },
      { id: 'c3_solo', text: 'Examine o solo dos dois lados', needs: ['c3_soloF', 'c3_soloS'], targets: ['soloF', 'soloS'] },
      { id: 'c3_pessoas', text: 'Converse com Iara e Seu Benedito', needs: ['c3_iara', 'c3_bene'], targets: ['iara', 'benedito'] },
      { id: 'c3_analise', text: 'Compare as evidências na mesa de análise', target: 'analise' },
      { id: 'c3_fim', text: 'Fale com Luna', target: 'luna' },
    ],
    map: {
      size: [1800, 1100], seed: 44, ground: 'lush', spawn: [800, 560],
      lakes: [
        [[888, 0], [934, 0], [946, 250], [926, 512], [882, 512], [896, 250]],
        [[880, 610], [926, 610], [942, 850], [932, 1100], [886, 1100], [896, 850]],
      ],
      areas: [
        { type: 'forest', poly: [[0, 0], [850, 0], [850, 1100], [0, 1100]] },
        { type: 'dry', poly: [[980, 0], [1800, 0], [1800, 1100], [980, 1100]] },
      ],
      paths: [{ pts: [[120, 560], [500, 560], [880, 560], [1300, 560], [1700, 560]], w: 46 }, { pts: [[760, 560], [720, 680]], w: 36 }],
      flats: [{ sprite: 'flat_bridge', x: 910, y: 561 }],
      details: { grass: 1600, pebbles: 600, flowers: 120 },
      critters: { butterflies: 5, birds: 2 },
      weather: { zones: [
        { x: 0, fog: .35, clouds: .6, rain: .05, wind: .15, temp: 25, humid: 88 },
        { x: 840, fog: .3, clouds: .5, rain: 0, wind: .2, temp: 26, humid: 82 },
        { x: 1000, fog: 0, clouds: .1, rain: 0, heat: .35, wind: .3, temp: 31, humid: 40 },
        { x: 1800, fog: 0, clouds: .05, heat: .4, wind: .3, temp: 32, humid: 35 }] },
      scatter: [
        { sprite: 'tree_tropical', n: 44, areas: ['forest'] }, { sprite: 'fern', n: 45, areas: ['forest'] }, { sprite: 'shrub', n: 14, areas: ['forest'] },
        { sprite: 'tree_dry', n: 22, areas: ['dry'] }, { sprite: 'cactus', n: 16, areas: ['dry'] }, { sprite: 'dry_shrub', n: 40, areas: ['dry'] },
        { sprite: 'rock', n: 14, areas: ['dry'] }, { sprite: 'rock_big', n: 4, areas: ['dry'] }, { sprite: 'shrub', n: 8 },
      ],
      objects: [{ sprite: 'house', x: 1640, y: 640 }, { sprite: 'cisterna', x: 1540, y: 620 }],
      npcs: [
        { id: 'luna', char: 'luna', x: 790, y: 650, label: 'Luna' },
        { id: 'iara', char: 'iara', x: 260, y: 660, label: 'Iara, bióloga' },
        { id: 'benedito', char: 'benedito', x: 1540, y: 700, label: 'Seu Benedito' },
      ],
      interact: [
        { id: 'analise', sprite: 'table_notes', x: 700, y: 720, label: 'Mesa de análise', verb: 'Analisar' },
        { id: 'estF', sprite: 'station_mini', x: 360, y: 400, label: 'Estação da Floresta', verb: 'Ler dados' },
        { id: 'estS', sprite: 'station_mini', x: 1440, y: 400, label: 'Estação da Terra Seca', verb: 'Ler dados' },
        { id: 'soloF', sprite: 'soil_dark', x: 470, y: 820, top: 30, label: 'Amostra de solo', verb: 'Examinar' },
        { id: 'soloS', sprite: 'soil_light', x: 1320, y: 820, top: 30, label: 'Amostra de solo', verb: 'Examinar' },
      ],
    },
    onEnter: api => api.say('c3_chegada'),
    scripts: {
      async luna(api) {
        if (!api.done('c3_luna')) { await api.say('c3_luna_intro'); api.complete('c3_luna'); return; }
        if (!api.done('c3_analise')) return api.say('c3_luna_wait');
        if (!api.done('c3_fim')) { await api.say('c3_luna_fim'); api.complete('c3_fim'); return api.finishChapter(); }
        return api.say('c3_luna_done');
      },
      estF: api => measure(api, 'c3_estF', 'c3_estF', '≈ 2.400 mm/ano, chuva o ano todo · 25 °C', 'c3_ja'),
      estS: api => measure(api, 'c3_estS', 'c3_estS', '≈ 600 mm/ano, chuva de jan. a abr. · 27 °C', 'c3_ja'),
      soloF: api => measure(api, 'c3_soloF', 'c3_soloF', 'escuro, úmido, rico em matéria orgânica', 'c3_ja'),
      soloS: api => measure(api, 'c3_soloS', 'c3_soloS', 'claro, seco, pedregoso', 'c3_ja'),
      iara: api => talk(api, 'c3_iara', 'c3_iara'),
      benedito: api => talk(api, 'c3_bene', 'c3_bene'),
      async analise(api) {
        if (!api.all('c3_estF', 'c3_estS', 'c3_soloF', 'c3_soloS', 'c3_iara', 'c3_bene')) return api.say('c3_analise_cedo');
        if (api.done('c3_analise')) return api.say('c3_ja');
        for (const id of ['c3_climogramas', 'c3_evidencias', 'c3_conclusao']) if (!api.done('ok_' + id)) {
          if (!await api.challenge(id)) return;
          api.complete('ok_' + id);
        }
        api.complete('c3_analise');
      },
    },
  },

  // ======================= CAPÍTULO 4 =======================
  cap4: {
    label: 'Capítulo 4', title: 'A Cidade que Não Esfria', mapNum: '4', next: 'cap5', reward: 'modulo_cidades',
    synopsis: 'Em Pedra-Sol, o centro parece não esfriar nunca. Meça, compare e planeje uma cidade mais fresca.',
    concepts: ['ilha_calor', 'escoamento_urbano', 'mudanca_global'],
    outro: 'Você mediu a ilha de calor, testou soluções verdes e separou um fenômeno local das mudanças climáticas globais.',
    tasks: [
      { id: 'c4_luna', text: 'Encontre Luna no ponto de ônibus', target: 'luna' },
      { id: 'c4_med', text: 'Meça a temperatura em três lugares (14h)', needs: ['c4_mparque', 'c4_mrua', 'c4_mestac'], targets: ['mparque', 'mrua', 'mestac'] },
      { id: 'c4_comp', text: 'Compare as medições com Luna', target: 'luna' },
      { id: 'c4_lab', text: 'Planeje melhorias com a engenheira Marina', target: 'marina' },
      { id: 'c4_global', text: 'Responda ao desafio de Luna: local ou global?', target: 'luna' },
    ],
    map: {
      size: [1600, 1200], seed: 55, ground: 'sidewalk', spawn: [800, 1080],
      areas: [
        { type: 'asphalt', poly: [[1125, 0], [1600, 0], [1600, 275], [1125, 275]] },
        { type: 'park', poly: [[0, 805], [475, 805], [475, 1200], [0, 1200]] },
        { type: 'plaza', poly: [[565, 805], [1035, 805], [1035, 1200], [565, 1200]] },
        { type: 'asphalt', poly: [[1125, 805], [1600, 805], [1600, 1200], [1125, 1200]] },
        { type: 'plaza', poly: [[565, 365], [1035, 365], [1035, 715], [565, 715]] },
      ],
      paths: [
        { style: 'road', w: 90, pts: [[0, 320], [1600, 320]] }, { style: 'road', w: 90, pts: [[0, 760], [1600, 760]] },
        { style: 'road', w: 90, pts: [[520, 0], [520, 1200]] }, { style: 'road', w: 90, pts: [[1080, 0], [1080, 1200]] },
      ],
      flats: [{ sprite: 'flat_crosswalk', x: 800, y: 760 }],
      details: { grass: 500 },
      critters: { birds: 1 },
      weather: { base: { clouds: .1, heat: .45, wind: .1, temp: 34, humid: 45 }, after: { task: 'c4_lab', set: { heat: .28, temp: 32 } } },
      scatter: [{ sprite: 'tree_round', n: 14, areas: ['park'] }, { sprite: 'shrub', n: 10, areas: ['park'] }, { sprite: 'flower_bush', n: 8, areas: ['park'] }],
      objects: [
        { sprite: 'building', x: 130, y: 250, v: 0 }, { sprite: 'building', x: 340, y: 250, v: 1, hideIf: 'c4_lab' }, { sprite: 'building_green', x: 340, y: 250, v: 1, showIf: 'c4_lab' },
        { sprite: 'building', x: 660, y: 250, v: 2 }, { sprite: 'building', x: 900, y: 250, v: 3 },
        { sprite: 'building', x: 130, y: 690, v: 4 }, { sprite: 'building', x: 340, y: 690, v: 5 },
        { sprite: 'building', x: 1220, y: 690, v: 6, hideIf: 'c4_lab' }, { sprite: 'building_green', x: 1220, y: 690, v: 6, showIf: 'c4_lab' },
        { sprite: 'building', x: 1460, y: 690, v: 7 }, { sprite: 'building', x: 1480, y: 1150, v: 8 },
        { sprite: 'prefeitura', x: 800, y: 640 },
        { sprite: 'car', x: 1200, y: 120, v: 1 }, { sprite: 'car', x: 1330, y: 230, v: 2 }, { sprite: 'car', x: 1480, y: 110, v: 3, hideIf: 'c4_lab' },
        { sprite: 'car', x: 1240, y: 240, v: 4, hideIf: 'c4_lab' }, { sprite: 'car', x: 1520, y: 240, v: 5 },
        { sprite: 'fountain', x: 240, y: 900 }, { sprite: 'bench', x: 120, y: 1100 }, { sprite: 'bench', x: 380, y: 1120 },
        { sprite: 'playground', x: 1280, y: 980 }, { sprite: 'lamp', x: 600, y: 850 }, { sprite: 'lamp', x: 1000, y: 850 }, { sprite: 'bench', x: 700, y: 1000 },
        // árvores plantadas depois do planejamento
        ...[[1480, 110], [1240, 240], [450, 380], [600, 390], [1000, 390], [1150, 390], [450, 720], [1150, 720], [600, 1150], [1000, 1150], [1200, 880], [1520, 880]]
          .map(([x, y], i) => ({ sprite: 'tree_round', x, y, v: i % 5, scale: .8, showIf: 'c4_lab' })),
      ],
      npcs: [
        { id: 'luna', char: 'luna', x: 880, y: 1060, label: 'Luna' },
        { id: 'marina', char: 'marina', x: 690, y: 700, label: 'Eng. Marina' },
        { id: 'teo', char: 'teo', x: 1360, y: 1030, label: 'Téo' },
      ],
      interact: [
        { id: 'mparque', sprite: 'thermo_post', x: 330, y: 960, label: 'Parque arborizado', verb: 'Medir' },
        { id: 'mrua', sprite: 'thermo_post', x: 1035, y: 520, label: 'Avenida asfaltada', verb: 'Medir' },
        { id: 'mestac', sprite: 'thermo_post', x: 1380, y: 150, label: 'Estacionamento', verb: 'Medir' },
      ],
    },
    onEnter: api => api.say('c4_chegada'),
    scripts: {
      async luna(api) {
        if (!api.done('c4_luna')) { await api.say('c4_luna_intro'); api.complete('c4_luna'); return; }
        if (!api.all('c4_mparque', 'c4_mrua', 'c4_mestac')) return api.say('c4_luna_wait');
        if (!api.done('c4_comp')) {
          await api.say('c4_luna_comp');
          if (await api.challenge('c4_medicoes')) { api.complete('c4_comp'); await api.say('c4_luna_after_comp'); }
          return;
        }
        if (!api.done('c4_lab')) return api.say('c4_luna_after_comp');
        if (!api.done('c4_global')) {
          await api.say('c4_luna_global');
          if (await api.challenge('c4_local_global')) { api.complete('c4_global'); await api.say('c4_luna_fim'); return api.finishChapter(); }
          return;
        }
        return api.say('c4_luna_done');
      },
      mparque: api => measure(api, 'c4_mparque', 'c4_mparque', '28 °C'),
      mrua: api => measure(api, 'c4_mrua', 'c4_mrua', '34 °C'),
      mestac: api => measure(api, 'c4_mestac', 'c4_mestac', '36 °C'),
      teo: api => api.say('c4_teo'),
      async marina(api) {
        if (api.done('c4_lab')) return api.say('c4_marina_done');
        if (!api.done('c4_comp')) return api.say('c4_marina_cedo');
        await api.say('c4_marina');
        if (await api.lab('c4_cidade')) { api.complete('c4_lab'); api.refresh(); await api.say('c4_marina_pos'); }
      },
    },
  },

  // ======================= CAPÍTULO 5 =======================
  cap5: {
    label: 'Capítulo 5', title: 'O Grande Desafio Climático', mapNum: '5', next: null, reward: 'nucleo',
    synopsis: 'Use tudo o que aprendeu para resolver três problemas reais e reativar o Coração do Clima.',
    concepts: ['decisao_dados'],
    outro: 'O Coração do Clima voltou a funcionar.',
    tasks: [
      { id: 'c5_luna', text: 'Converse com Luna na estação', target: 'luna' },
      { id: 'c5_prob', text: 'Resolva os três problemas dos consoles', needs: ['c5_p1', 'c5_p2', 'c5_p3'], targets: ['console1', 'console2', 'console3'] },
      { id: 'c5_ativar', text: 'Ative o Coração do Clima', target: 'coracao' },
    ],
    map: Object.assign({}, AURORA, {
      weather: { base: { clouds: .35, wind: .25, temp: 25, humid: 70 }, tint: 'rgba(255,140,60,.10)' },
      critters: { butterflies: 6, birds: 3 },
      objects: [
        AURORA.station,
        { sprite: 'bench', x: 560, y: 440 }, { sprite: 'lamp', x: 650, y: 520 }, { sprite: 'lamp', x: 655, y: 770 },
        { sprite: 'abrigo', x: 990, y: 480 }, { sprite: 'pluviometro', x: 1050, y: 520 }, { sprite: 'anemometro', x: 930, y: 500 }, { sprite: 'biruta', x: 1110, y: 470 },
      ],
      npcs: [{ id: 'luna', char: 'luna', x: 770, y: 700, label: 'Luna' }],
      interact: [
        { id: 'console1', sprite: 'console', x: 560, y: 520, doneFlag: 'c5_p1', label: 'Console 1 — Previsão', verb: 'Resolver' },
        { id: 'console2', sprite: 'console', x: 850, y: 470, doneFlag: 'c5_p2', label: 'Console 2 — Regiões', verb: 'Resolver' },
        { id: 'console3', sprite: 'console', x: 860, y: 640, doneFlag: 'c5_p3', label: 'Console 3 — Cidade', verb: 'Resolver' },
        { id: 'coracao', x: 700, y: 330, top: 90, range: 70, label: 'Coração do Clima', verb: 'Ativar' },
      ],
    }),
    onEnter: api => api.say('c5_chegada'),
    scripts: {
      async luna(api) {
        if (!api.done('c5_luna')) { await api.say('c5_luna_intro'); api.complete('c5_luna'); return; }
        return api.say(api.all('c5_p1', 'c5_p2', 'c5_p3') ? 'c5_luna_ready' : 'c5_luna_wait');
      },
      console1: api => consoleProblem(api, 'c5_p1', () => api.challenge('c5_previsao')),
      console2: api => consoleProblem(api, 'c5_p2', () => api.challenge('c5_regioes')),
      console3: api => consoleProblem(api, 'c5_p3', async () => { await api.say('c5_cidade_intro'); return api.lab('c5_cidade'); }),
      async coracao(api) {
        if (Progress.state.finished) return api.say('c5_final');
        if (!api.all('c5_p1', 'c5_p2', 'c5_p3')) return api.say('c5_coracao_cedo');
        await api.say('c5_ativar');
        api.complete('c5_ativar');
        await api.ending();
      },
    },
  },
};

// ---------- Roteiros reutilizáveis ----------
async function readInstrument(api, task, intro, challenge, recKey, recVal) {
  if (!api.done('c1_luna')) return api.say('c1_antes');
  if (api.done(task)) return api.say('c1_ja_lido');
  await api.say(intro);
  if (await api.challenge(challenge)) { api.complete(task); api.record(recKey, recVal); }
}
async function measure(api, task, dialogue, value, already = 'c1_ja_lido') {
  if (api.done(task)) return api.say(already);
  await api.say(dialogue);
  api.complete(task); api.record(task, value);
}
async function talk(api, task, dialogue) { await api.say(dialogue); api.complete(task); }
async function consoleProblem(api, task, run) {
  if (!api.done('c5_luna')) return api.say('c5_cedo');
  if (api.done(task)) return api.say('c5_resolvido');
  if (await run()) api.complete(task);
}
