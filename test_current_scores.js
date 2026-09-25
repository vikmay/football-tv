const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const status = require('./match-status.js');
const parser = vm.createContext({ require, console, process, fetch, AbortSignal });
vm.runInContext(fs.readFileSync('parse.js', 'utf8').replace(/main\(\)\.catch\([\s\S]*$/, ''), parser);

async function test() {
  const today = parser.getKyivTodayIso();
  const kickoff = Math.floor(new Date(`${today}T18:45:00Z`).getTime() / 1000);
  // Fields captured from Flashscore's daily feed for Hungary–Ukraine, 25 Sep 2026.
  const raw = `SA÷1¬~AA÷jDSIyx2c¬AD÷${kickoff}¬AB÷2¬AC÷13¬CX÷Угорщина¬AG÷0¬AF÷Україна¬AH÷1¬`;
  const scheduled = { home: 'Угорщина', away: 'Україна', dateIso: today,
    time: '21:45', league: 'Ліга націй УЄФА', status: 'Scheduled', score: '' };
  const another = { ...scheduled, home: 'Австрія', away: 'Косово' };
  const table = [{ position: 1, team: 'Динамо Київ' }];
  const original = { 'Ліга націй УЄФА': [scheduled, another], 'Збірна України': [scheduled], 'Таблиця УПЛ': table };
  const requests = [];
  parser.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, text: async () => raw };
  };
  const events = await parser.fetchCurrentScoreEvents();
  assert.equal(requests.length, 2);
  assert.ok(requests.every(r => r.options.headers['x-fsign']));
  const live = parser.applyCurrentScores(original, events);
  assert.equal(live['Ліга націй УЄФА'][0].status, 'Live');
  assert.equal(live['Ліга націй УЄФА'][0].score, '0 - 1');
  assert.equal(live['Збірна України'][0].score, '0 - 1');
  assert.equal(live['Ліга націй УЄФА'][1], another);
  assert.equal(live['Таблиця УПЛ'], table);
  assert.equal(scheduled.status, 'Scheduled');
  assert.equal(parser.applyCurrentScores(live, [])['Ліга націй УЄФА'][0].score, '0 - 1');

  const content = { innerHTML: '' };
  let data = live;
  const browser = vm.createContext({ ...status, console: { log() {} },
    document: {
      getElementById: id => id === 'content' ? content : { innerHTML: '' },
      querySelector: selector => selector === '.header' ? { addEventListener() {} } : null
    },
    fetch: async url => ({ ok: true, json: async () => url.includes('manual_matches') ? [] : data })
  });
  const script = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/\s+load\(\);\s+setInterval\(load, 60000\);/, '');
  vm.runInContext(script, browser);
  await browser.load();
  assert.match(content.innerHTML, /Угорщина – Україна/);
  assert.match(content.innerHTML, /<span class="score">0 - 1<\/span><span class="match__live"/);
  assert.equal((content.innerHTML.match(/Угорщина – Україна/g) || []).length, 1);

  const finishedEvents = parser.parseFlashscoreCupFeedData(raw.replace('AB÷2', 'AB÷3'));
  data = parser.applyCurrentScores(live, finishedEvents);
  await browser.load();
  assert.match(content.innerHTML, /<span class="score">0 - 1<\/span>/);
  assert.ok(!content.innerHTML.includes('class="match__live"'));
  console.log('Daily feed → schedule → rendered LIVE/score → final result: passed.');
}
test().catch(error => { console.error(error); process.exitCode = 1; });
