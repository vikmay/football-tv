const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const parser = vm.createContext({ require, console, process, fetch, AbortSignal });
vm.runInContext(fs.readFileSync('parse.js', 'utf8').replace(/main\(\)\.catch\([\s\S]*$/, ''), parser);

async function test() {
  const today = parser.getKyivTodayIso();
  const unix = Math.floor(new Date(`${today}T10:00:00Z`).getTime() / 1000);
  const feed = (id, status, home, away, stamp = unix) =>
    `~AA÷${id}¬AD÷${stamp}¬AB÷${status}¬CX÷${home}¬AF÷${away}¬`;
  const scheduled = feed('fixture', 1, 'Динамо Київ', 'Карпати Л.');
  const finished = feed('result', 3, 'Колос', 'Оболонь') + 'AG÷2¬AH÷1¬';
  const html = `<script>cjs.initialFeeds['fixtures'] = { data: \`${scheduled}\` };
    cjs.initialFeeds["results"] = { data: \`${finished}\` };</script>`;
  const events = parser.parseFlashscoreUplFixturesFromHtml(html);
  assert.equal(events.length, 1);
  const match = parser.mapEventToMatch(events[0], 'УПЛ', parser.getUplTeamName);
  const expected = new Date(unix * 1000).toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', hour12: false
  });
  assert.equal(match.time, expected);
  assert.equal(match.away, 'Карпати Львів');
  const merged = parser.mergeCurrentAndPreviousMatches([match], [{ ...match, time: '15:30' }]);
  assert.equal(merged[0].time, expected, 'fresh kickoff must replace cached 15:30');
  assert.equal(parser.mergeCurrentAndPreviousMatches([{ ...match, time: '' }], [match])[0].time, expected);

  // Conflicting AO is not kickoff: use AD (Unix UTC), then convert once to Kyiv.
  const conflicting = html.replace(`AD÷${unix}`, `AO÷${unix + 9000}¬AD÷${unix}`);
  assert.equal(parser.formatTime(parser.parseFlashscoreUplFixturesFromHtml(conflicting)[0]), expected);
  const requests = [];
  parser.fetch = async url => {
    requests.push(url);
    return { ok: true, text: async () => html };
  };
  const all = await parser.fetchUplEvents();
  assert.equal(all.length, 2, 'both upcoming fixtures and results must survive');
  assert.ok(all.some(event => event.strStatus === 'Scheduled'));
  assert.ok(all.some(event => event.strStatus === 'Match Finished'));
  assert.ok(requests.every(url => url.includes('flashscore.ua')), 'Flashscore takes priority over official calendar');
  assert.equal(parser.formatDateToIsoInTimeZone(new Date('2027-01-01T00:30:00Z'), 'Europe/Kyiv'), '2027-01-01');
  for (const [date, time] of [['2026-07-01T10:00:00Z', '13:00'], ['2026-12-01T11:00:00Z', '13:00']]) {
    assert.equal(parser.formatTime({ dateEvent: date.slice(0, 10), strTime: date.slice(11, 19) }), time);
  }
  console.log('Schedule feed parsing, source priority, cache updates and Kyiv summer/winter time: passed.');
}
test().catch(error => { console.error(error); process.exitCode = 1; });
