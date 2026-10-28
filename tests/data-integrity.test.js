// Confere se todos os diálogos, desafios, laboratórios e alvos de missão citados nos capítulos existem.
// Rodar: node tests/data-integrity.test.js
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const ctx = vm.createContext({});
for (const f of ['educational-content', 'dialogues', 'challenges', 'chapters'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', f + '.js'), 'utf8') + `\n;this.__${f.replace('-', '_')} = 1;`, ctx);
const g = vm.runInContext('({ EDU, DIALOGUES, CHALLENGES, LABS, CHAPTERS, CHAPTER_ORDER })', ctx);
const src = fs.readFileSync(path.join(__dirname, '..', 'data', 'chapters.js'), 'utf8');
const errors = [];
const chk = (ok, msg) => { if (!ok) errors.push(msg); };

for (const [, id] of src.matchAll(/(?:say|readInstrument\(api, '[^']+'|measure\(api, '[^']+'|talk\(api, '[^']+')\(?,? ?'(\w+)'/g)) chk(g.DIALOGUES[id], 'diálogo inexistente: ' + id);
for (const [, id] of src.matchAll(/challenge\('(\w+)'\)/g)) chk(g.CHALLENGES[id], 'desafio inexistente: ' + id);
for (const [, id] of src.matchAll(/lab\('(\w+)'\)/g)) chk(g.LABS[id], 'laboratório inexistente: ' + id);

for (const id of g.CHAPTER_ORDER) {
  const ch = g.CHAPTERS[id], m = ch.map;
  const ents = new Set([...(m.npcs || []), ...(m.interact || [])].map(e => e.id));
  for (const t of ch.tasks) for (const tg of t.needs ? t.targets : [t.target]) chk(ents.has(tg), `${id}: alvo de missão sem entidade: ${tg}`);
  for (const e of m.interact || []) chk(ch.scripts[e.id] || e.say, `${id}: interação sem roteiro: ${e.id}`);
  for (const e of m.npcs || []) chk(ch.scripts[e.id] || e.say, `${id}: personagem sem roteiro: ${e.id}`);
  chk(g.EDU.items[ch.reward], `${id}: recompensa inexistente`);
  for (const c of ch.concepts) chk(g.EDU.concepts[c], `${id}: conceito inexistente ${c}`);
}
for (const [id, c] of Object.entries(g.CHALLENGES)) {
  for (const k of c.concepts || []) chk(g.EDU.concepts[k], `${id}: conceito inexistente ${k}`);
  if (c.type === 'quiz') for (const q of c.questions) chk(q.options.filter(o => o.ok).length === 1, `${id}: pergunta sem exatamente 1 resposta certa: ${q.q}`);
  if (c.type === 'quiz') for (const q of c.questions) for (const o of q.options) chk(o.ok ? (o.why || q.why) : o.hint, `${id}: opção sem ${o.ok ? 'explicação' : 'pista'}: ${o.t}`);
  if (c.type === 'sort') for (const it of c.items) chk(it.hint && it.why && c.categories.some(k => k.id === it.cat), `${id}: cartão incompleto ${it.t}`);
}
for (const d of Object.values(g.DIALOGUES)) for (const l of d) if (l.journal) chk(g.EDU.concepts[l.journal], 'conceito de diário inexistente: ' + l.journal);

assert.deepStrictEqual(errors, []);
console.log(`ok — ${g.CHAPTER_ORDER.length} capítulos, ${Object.keys(g.DIALOGUES).length} diálogos, ${Object.keys(g.CHALLENGES).length} desafios, ${Object.keys(g.LABS).length} laboratórios`);
