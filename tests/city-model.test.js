// Autoteste do modelo didático da cidade: as metas dos laboratórios precisam ser alcançáveis dentro do orçamento.
// Rodar: node tests/city-model.test.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const load = (f, name) => new Function(fs.readFileSync(path.join(__dirname, '..', f), 'utf8') + `; return ${name};`)();
const CityModel = load('src/climate-lab.js', 'CityModel');
const { LABS } = load('data/challenges.js', '{ LABS }');

const base = CityModel.evaluate(LABS.c4_cidade.grid, {});
assert.strictEqual(base.cost, 0);
assert.ok(base.avgTemp > 31 && base.runoff > 85, 'bairro inicial deve ser quente e impermeável');

// Plano do capítulo 4: 4 estacionamentos viram áreas com árvores (custo 8 <= 10)
const plan4 = { '0,2': 'trees', '0,3': 'trees', '1,2': 'trees', '1,3': 'trees' };
const r4 = CityModel.evaluate(LABS.c4_cidade.grid, plan4);
assert.ok(r4.cost <= LABS.c4_cidade.budget, 'cap4: dentro do orçamento');
assert.ok(base.avgTemp - r4.avgTemp >= LABS.c4_cidade.goals.temp, `cap4: meta de temperatura (${base.avgTemp} -> ${r4.avgTemp})`);

// Plano do capítulo 5: árvores + piso permeável + telhados verdes (custo <= 16)
const plan5 = Object.assign({}, plan4, { '3,1': 'perm', '3,4': 'perm', '0,0': 'roof', '1,0': 'roof' });
const r5 = CityModel.evaluate(LABS.c5_cidade.grid, plan5);
const g5 = LABS.c5_cidade.goals;
assert.ok(r5.cost <= LABS.c5_cidade.budget, `cap5: orçamento (${r5.cost})`);
assert.ok(base.avgTemp - r5.avgTemp >= g5.temp, `cap5: temperatura (${base.avgTemp} -> ${r5.avgTemp})`);
assert.ok(r5.runoff <= g5.runoff, `cap5: escoamento (${r5.runoff}%)`);

// Toldo dá sombra mas não melhora o escoamento (mensagem pedagógica do jogo)
const shade = CityModel.evaluate(LABS.c4_cidade.grid, { '0,2': 'shade' });
assert.ok(shade.avgTemp < base.avgTemp && shade.runoff === base.runoff);

console.log('ok — base', base.avgTemp, '°C', base.runoff + '%', '| cap4', r4.avgTemp, '°C | cap5', r5.avgTemp, '°C', r5.runoff + '%', 'custo', r5.cost);
