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
  // Do not inject helpers: the page must render even when an external script
  // is missing or cached at an older version (the real kiosk failure).
  const browser = vm.createContext({ console: { log() {} },
    document: {
      getElementById: id => id === 'content' ? content : { innerHTML: '' },
      querySelector: selector => selector === '.header' ? { addEventListener() {} } : null
    },
    fetch: async url => ({ ok: true, json: async () => url.includes('manual_matches') ? [] : data })
  });
  const script = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/\s+load\(\);\s+setInterval\(load, 60000\);/, '');
  vm.runInContext(script, browser);
  const now = Date.now();
  for (const state of ['Live', 'HT', 'Scheduled', 'Match Finished']) {
    for (const age of [0, 15 * 60000, 16 * 60000]) {
      const sample = { status: state, scoreUpdatedAt: new Date(now - age).toISOString() };
      assert.equal(browser.isLiveMatch(sample, now), status.isLiveMatch(sample, now));
    }
  }
  await browser.load();
  assert.match(content.innerHTML, /Угорщина – Україна/);
  assert.match(content.innerHTML, /<span class="score">0 - 1<\/span><span class="match__live"/);
  assert.ok(content.innerHTML.includes(`<span class="match__kickoff" title="Час початку матчу">${live['Ліга націй УЄФА'][0].time}</span><span class="score">0 - 1</span>`));
  assert.equal((content.innerHTML.match(/Угорщина – Україна/g) || []).length, 1);

  const stale = { ...live['Ліга націй УЄФА'][0], scoreUpdatedAt: new Date(Date.now() - 16 * 60000).toISOString() };
  assert.equal(status.isLiveMatch(stale), false);
  assert.equal(status.isLiveMatch({ ...stale, scoreUpdatedAt: undefined }), false);
  // A failed source refresh must not make cached scores look fresh again.
  const unchanged = parser.applyCurrentScores({ test: [stale] }, []);
  assert.equal(unchanged.test[0].scoreUpdatedAt, stale.scoreUpdatedAt);
  data = { 'Ліга націй УЄФА': [stale] };
  await browser.load();
  assert.ok(!content.innerHTML.includes('class="match__live"'));
  assert.match(content.innerHTML, /Дані застаріли/);
  assert.match(content.innerHTML, /0 - 1/);

  const finishedEvents = parser.parseFlashscoreCupFeedData(raw.replace('AB÷2', 'AB÷3'));
  data = parser.applyCurrentScores(live, finishedEvents);
  await browser.load();
  assert.match(content.innerHTML, /<span class="score">0 - 1<\/span>/);
  assert.ok(!content.innerHTML.includes('class="match__live"'));
  assert.ok(!content.innerHTML.includes('class="match__kickoff"'));
  console.log('Daily feed → schedule → rendered LIVE/score → final result: passed.');
}
test().catch(error => { console.error(error); process.exitCode = 1; });
