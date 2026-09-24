const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { isLiveStatus } = require('./match-status.js');
const source = fs.readFileSync('parse.js', 'utf8').replace(/main\(\)\.catch\([\s\S]*$/, '');
const context = vm.createContext({ require, console, process, fetch });
vm.runInContext(source, context);
const today = context.getKyivTodayIso();
const [, month, day] = today.split('-');
const badAway = 'Косово . До Вашої уваги Ліга націй УЄФА 2026/2027 результати live';
const pollutedHtml = `<p>${day}.${month}. Австрія - ${badAway}</p>`;
assert.equal(context.parseFlashscoreFixtureEvents(pollutedHtml).length, 0);
const validHtml = `<p>${day}.${month}. 19:00 Австрія - Косово</p>`;
const validEvents = context.parseFlashscoreFixtureEvents(validHtml);
assert.equal(validEvents.length, 1);
assert.equal(validEvents[0].strAwayTeam, 'Косово');
assert.equal(validEvents[0].strTime, '19:00:00');
const cleanMatch = { home: 'Австрія', away: 'Косово', dateIso: today, time: '19:00', league: 'Ліга націй УЄФА' };
const cached = context.dedupeScheduleSections({ 'Ліга націй УЄФА': [
  { ...cleanMatch, away: badAway, time: '00:00' }, cleanMatch
] });
assert.equal(cached['Ліга націй УЄФА'].length, 1);
assert.equal(cached['Ліга націй УЄФА'][0].time, '19:00');
const match = { home: 'England', away: 'Spain', league: 'Ліга націй УЄФА', dateIso: today, time: '21:45', status: 'Live', score: '0 - 0' };
for (const status of ['Live', '1st Half', 'HT', 'Half Time', '2H', 'Extra Time', 'Penalties']) {
  assert.ok(isLiveStatus(status), status);
  assert.equal(context.normalizeMatchSnapshot({ ...match, status }).score, '0 - 0');
}
for (const status of ['Scheduled', 'Match Finished', 'Postponed', 'Cancelled', 'FT']) assert.ok(!isLiveStatus(status));
const another = { ...match, home: 'France', away: 'Italy', status: 'Scheduled', score: '' };
assert.equal(context.mergeCurrentAndPreviousMatches([another], [match]).length, 2);
assert.equal(context.mergeCurrentAndPreviousMatches([another], [{ ...match, status: 'Scheduled', score: '' }]).length, 2);
const finished = { ...match, status: 'Match Finished', score: '2 - 1' };
assert.equal(context.mergeCurrentAndPreviousMatches([finished], [match])[0].status, 'Match Finished');
const timestamp = Math.floor(new Date(today + 'T18:45:00Z').getTime() / 1000);
for (const [code, expected] of [['1', 'Scheduled'], ['2', 'Live'], ['3', 'Match Finished'], ['4', 'Postponed']]) {
  const feed = `~AA÷test¬AD÷${timestamp}¬CX÷England¬AF÷Spain¬AB÷${code}¬AG÷0¬AH÷0`;
  assert.equal(context.parseFlashscoreCupFeedData(feed)[0].strStatus, expected);
}
const event = { dateEvent: today, strHomeTeam: 'England', strAwayTeam: 'Spain', strTime: '21:45', intHomeScore: 0, intAwayScore: 0 };
assert.equal(context.dedupeEvents([{ ...event, strStatus: 'Live' }, { ...event, strStatus: 'Match Finished' }])[0].strStatus, 'Match Finished');
const html = fs.readFileSync('index.html', 'utf8');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert.ok(html.includes('class="match__live"'));
// Exercise the competition selector with foreign teams and no network calls.
context.fetchFlashscoreCompetitionEvents = async () => [];
context.fetchCompetitionEvents = async () => [{ ...event, strStatus: 'Live' }];
context.fetchExtraMatches().then(result => {
  assert.equal(result.leagueMatches['Ліга націй УЄФА'].length, 1);
  assert.equal(result.nationalMatches.length, 0);
  console.log('Live status, score preservation, schedule retention and Nations League checks passed.');
}).catch(error => { console.error(error); process.exitCode = 1; });
