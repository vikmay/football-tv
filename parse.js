const fs = require("fs");

/**
 * Fetch matches for both leagues.
 * Strategy:
 * - UPL: official upl.ua calendar page
 * - Champions League: TheSportsDB recent past + upcoming events, with fallback for missing matches
 * - Extra competitions: Ukrainian clubs in European cups + Ukraine national team in international competitions
 * - Backup source: Flashscore fixtures pages when primary sources miss matches
 * - Keep only matches from 7 days ago to 7 days ahead
 */

// Read existing matches.json to preserve if fetch fails
let existingData = { "УПЛ": [], "Ліга чемпіонів": [], "Кубок України": [] };
try {
  existingData = JSON.parse(fs.readFileSync("matches.json", "utf8"));
} catch (e) {
  console.warn("⚠️ Could not read existing matches.json");
}

const REFRESH_META_FILE = "matches.meta.json";
const DEFAULT_REFRESH_TTL_MINUTES = 120;
const ACTIVE_REFRESH_TTL_MINUTES = 10;
const FORCE_REFRESH_ARGS = new Set(["--force", "--refresh", "--refresh-now"]);

function readRefreshMeta() {
  try {
    return JSON.parse(fs.readFileSync(REFRESH_META_FILE, "utf8"));
  } catch (e) {
    return null;
  }
}

function writeRefreshMeta(meta) {
  fs.writeFileSync(REFRESH_META_FILE, JSON.stringify(meta, null, 2));
}

function isActiveWindowData(matchesData) {
  const todayIso = getKyivTodayIso();
  const tomorrowIso = shiftIsoDate(todayIso, 1);

  return Object.values(matchesData)
    .filter(Array.isArray)
    .flat()
    .some(match => match?.dateIso === todayIso || match?.dateIso === tomorrowIso);
}

function getRefreshTtlMinutes(matchesData) {
  return isActiveWindowData(matchesData)
    ? ACTIVE_REFRESH_TTL_MINUTES
    : DEFAULT_REFRESH_TTL_MINUTES;
}

function isRefreshForced() {
  return process.argv.some(arg => FORCE_REFRESH_ARGS.has(arg)) || process.env.FORCE_REFRESH === "1";
}

function shouldReuseCachedMatches(matchesData) {
  if (isRefreshForced()) {
    return false;
  }

  const meta = readRefreshMeta();
  if (!meta?.lastUpdated) {
    return false;
  }

  const lastUpdatedMs = new Date(meta.lastUpdated).getTime();
  if (Number.isNaN(lastUpdatedMs)) {
    return false;
  }

  const ttlMinutes = typeof meta.ttlMinutes === "number" ? meta.ttlMinutes : getRefreshTtlMinutes(matchesData);
  const ageMinutes = (Date.now() - lastUpdatedMs) / 60000;

  return ageMinutes < ttlMinutes;
}

// Team name mapping for UPL and Ukrainian teams in other competitions
const uplTeamNames = {
  "Dynamo Kyiv": "Динамо Київ",
  "Dynamo": "Динамо Київ",
  "Shakhtar Donetsk": "Шахтар Донецьк",
  "Shakhtar": "Шахтар Донецьк",
  "Ukraine": "Україна",
  "FC Metalist Kharkiv": "Металіст Харків",
  "Metalist 1925 Kharkiv": "Металіст 1925 Харків",
  "Metalist 1925": "Металіст 1925 Харків",
  "Dnipro-1": "Дніпро-1",
  "Kryvbas KR": "Кривбас",
  "Kryvbas Kryvyi Rih": "Кривбас",
  "Kryvbas": "Кривбас",
  "Kolos Kovalivka": "Колос Ковалівка",
  "Kolos": "Колос Ковалівка",
  "Vorskla Poltava": "Ворскла Полтава",
  "Vorskla": "Ворскла Полтава",
  "Oleksandriya": "Олександрія",
  "Olexandriya": "Олександрія",
  "FC Oleksandriya": "Олександрія",
  "Zorya Luhansk": "Зоря Луганськ",
  "Zorya": "Зоря Луганськ",
  "Chornomorets": "Чорноморець Одеса",
  "Lviv": "Львів",
  "Veres Rivne": "Верес Рівне",
  "Veres": "Верес Рівне",
  "Karpaty Lviv": "Карпати Львів",
  "Karpaty": "Карпати Львів",
  "Rukh Lviv": "Рух Львів",
  "Ruh": "Рух Львів",
  "Obolon-Brovar Kyiv": "Оболонь Київ",
  "Obolon Kyiv": "Оболонь Київ",
  "Obolon Kiev": "Оболонь Київ",
  "Obolon-Brovar": "Оболонь Київ",
  "Obolon": "Оболонь Київ",
  "LNZ Cherkasy": "ЛНЗ Черкаси",
  "LNZ": "ЛНЗ Черкаси",
  "Epitsentr Kamianets-Podilsky": "Епіцентр Кам'янець-Подільський",
  "Epitsentr Dunaivtsi": "Епіцентр Дунаївці",
  "Epitsentr Dunayivtsi": "Епіцентр Дунаївці",
  "FC Epitsentr": "Епіцентр",
  "Epicentr": "Епіцентр",
  "Bukovyna": "Буковина Чернівці",
  "Bukovyna (Ч)": "Буковина Чернівці",
  "Bukovina": "Буковина Чернівці",
  "Bukovina (Ch)": "Буковина Чернівці",
  "Chernihiv": "Чернігів",
  "Chernihiv (Ч)": "Чернігів",
  "Dynamo (К)": "Динамо Київ",
  "Dynamo (K)": "Динамо Київ",
  "Metalist 1925": "Металіст 1925 Харків",
  "Metalist 1925 (Х)": "Металіст 1925 Харків",
  "Minai": "Мінай",
  "Mynai": "Мінай",
  "Polissya Zhytomyr": "Полісся Житомир",
  "Polissya": "Полісся Житомир",
  "Inhulets": "Інгулець",
  "Tytan Armyansk": "Титан Армянськ",
  "Desna Chernihiv": "Десна Чернігів",
  "Mariupol": "Маріуполь",
  "Kremin Kremenchuk": "Кремінь Кременчук",
  "Hirnyk-Sport Khorostkiv": "Гірник-Спорт Хоростків",
  "Nyva Ternopil": "Нива Тернопіль",
  "Bukovyna Chernivtsi": "Буковина Чернівці",
  "Tavriya Simferopol": "Таврія Сімферополь",
  "SC Dnipro-1": "СД Дніпро-1",
  "Livyi Bereh": "Лівий Берег",
  "Kudrivka": "Кудрівка",
  "FC Kudrivka": "Кудрівка",
  "Poltava": "Полтава",
  "SC Poltava": "СК Полтава"
};

function getUplTeamName(englishName) {
  return uplTeamNames[englishName] || englishName;
}

const ukrainianClubAliases = new Set(
  Object.keys(uplTeamNames).filter(name => name !== "Ukraine")
);

const extraCompetitionConfigs = [
  {
    id: 4481,
    name: "Ліга Європи",
    type: "club",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/europe/europa-league/fixtures/"
    ]
  },
  {
    id: 4483,
    name: "Ліга конференцій",
    type: "club",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/europe/conference-league/fixtures/"
    ]
  },
  {
    id: 4484,
    name: "Суперкубок УЄФА",
    type: "club",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/europe/uefa-super-cup/fixtures/"
    ]
  },
  {
    id: 4399,
    name: "Ліга націй УЄФА",
    type: "national",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/europe/uefa-nations-league/fixtures/"
    ]
  },
  {
    id: 4424,
    name: "Чемпіонат світу",
    type: "national",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/world/world-cup/fixtures/"
    ]
  },
  {
    id: 4476,
    name: "Чемпіонат Європи",
    type: "national",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/europe/euro/fixtures/"
    ]
  }
];

function isUkrainianClubName(name) {
  return ukrainianClubAliases.has(name);
}

function isUkraineNationalTeamName(name) {
  return name === "Ukraine";
}

function isExtraCompetitionMatch(event, type) {
  if (!event) {
    return false;
  }

  if (type === "club") {
    return isUkrainianClubName(event.strHomeTeam) || isUkrainianClubName(event.strAwayTeam);
  }

  if (type === "national") {
    return isUkraineNationalTeamName(event.strHomeTeam) || isUkraineNationalTeamName(event.strAwayTeam);
  }

  return false;
}

async function fetchJson(url, label) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`❌ ${label}:`, err.message || err);
    return null;
  }
}

async function fetchText(url, label) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.text();
  } catch (err) {
    console.error(`❌ ${label}:`, err.message || err);
    return null;
  }
}

function formatDateToIsoInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;
  const day = parts.find(part => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getKyivTodayIso() {
  return formatDateToIsoInTimeZone(new Date(), "Europe/Kyiv");
}

function shiftIsoDate(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateToIsoInTimeZone(date, "UTC");
}

function isoDateToDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function formatDateUk(dateString) {
  const todayIso = getKyivTodayIso();
  const matchDate = isoDateToDisplayDate(dateString);
  const weekdays = [
    "неділя",
    "понеділок",
    "вівторок",
    "середа",
    "четвер",
    "пʼятниця",
    "субота"
  ];
  const weekday = weekdays[matchDate.getUTCDay()];

  if (dateString === todayIso) {
    return (
      "Сьогодні, " +
      matchDate.toLocaleDateString("uk-UA", {
        timeZone: "Europe/Kyiv",
        day: "numeric",
        month: "long"
      })
    );
  }

  return `${weekday}, ${matchDate.toLocaleDateString("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "numeric",
    month: "long"
  })}`;
}

function formatTime(event) {
  const sourceTime = event.strTimeLocal || event.strTime;

  if (!sourceTime) {
    return "00:00";
  }

  if (event.isLocalTime) {
    return sourceTime.substring(0, 5);
  }

  if (event.dateEvent && event.strTime) {
    const utcDate = new Date(`${event.dateEvent}T${event.strTime}Z`);

    if (!Number.isNaN(utcDate.getTime())) {
      return utcDate.toLocaleTimeString("uk-UA", {
        timeZone: "Europe/Kyiv",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  }

  return sourceTime.substring(0, 5);
}

function formatScore(event) {
  if (
    event.intHomeScore !== null &&
    event.intHomeScore !== undefined &&
    event.intAwayScore !== null &&
    event.intAwayScore !== undefined
  ) {
    return `${event.intHomeScore} - ${event.intAwayScore}`;
  }

  return "";
}

function formatCompetitionStage(event) {
  const roundValue = event.intRound ?? event.strRound ?? event.strEventRound ?? event.strStage ?? event.intStage;

  const roundNumber = typeof roundValue === "string" ? Number(roundValue) : roundValue;
  if (!Number.isFinite(roundNumber)) {
    return "";
  }

  if (roundNumber === 125) {
    return "Чвертьфінал";
  }

  if (roundNumber === 150) {
    return "Півфінал";
  }

  if (roundNumber === 200) {
    return "Фінал";
  }

  return "";
}

function formatCompetitionLabel(leagueLabel, event) {
  const stage = formatCompetitionStage(event);

  if (!stage) {
    return leagueLabel;
  }

  return `${leagueLabel} (${stage})`;
}

function mapEventToMatch(event, leagueLabel, mapTeamName = name => name) {
  return {
    home: mapTeamName(event.strHomeTeam),
    away: mapTeamName(event.strAwayTeam),
    league: formatCompetitionLabel(leagueLabel, event),
    time: formatTime(event),
    date: formatDateUk(event.dateEvent),
    dateIso: event.dateEvent,
    status: event.strStatus || "Scheduled",
    score: formatScore(event)
  };
}

function sortByDateTimeAsc(a, b) {
  return (
    new Date(a.strTimestamp || `${a.dateEvent}T${a.strTime || "00:00:00"}`) -
    new Date(b.strTimestamp || `${b.dateEvent}T${b.strTime || "00:00:00"}`)
  );
}

function dedupeEvents(events) {
  return events.filter((event, index, arr) =>
    arr.findIndex(item =>
      (item.idEvent && event.idEvent && item.idEvent === event.idEvent) ||
      (
        item.dateEvent === event.dateEvent &&
        item.strHomeTeam === event.strHomeTeam &&
        item.strAwayTeam === event.strAwayTeam
      )
    ) === index
  );
}

function makeFallbackEvent({
  idEvent,
  dateEvent,
  strHomeTeam,
  strAwayTeam,
  intHomeScore,
  intAwayScore,
  strTime = "20:00:00",
  strStatus = "Match Finished"
}) {
  return {
    idEvent,
    dateEvent,
    strTime,
    strStatus,
    strHomeTeam,
    strAwayTeam,
    intHomeScore,
    intAwayScore
  };
}

function getChampionsLeagueFallbackEvents() {
  const knownEvents = [
    makeFallbackEvent({
      idEvent: "ucl-fallback-2026-04-14-liverpool-psg",
      dateEvent: "2026-04-14",
      strHomeTeam: "Liverpool",
      strAwayTeam: "Paris Saint-Germain",
      intHomeScore: 0,
      intAwayScore: 2
    }),
    makeFallbackEvent({
      idEvent: "ucl-fallback-2026-04-14-atletico-barcelona",
      dateEvent: "2026-04-14",
      strHomeTeam: "Atletico Madrid",
      strAwayTeam: "Barcelona",
      intHomeScore: 1,
      intAwayScore: 2
    }),
    makeFallbackEvent({
      idEvent: "ucl-fallback-2026-04-15-arsenal-sporting",
      dateEvent: "2026-04-15",
      strHomeTeam: "Arsenal",
      strAwayTeam: "Sporting CP",
      intHomeScore: 0,
      intAwayScore: 0
    }),
    makeFallbackEvent({
      idEvent: "ucl-fallback-2026-04-15-bayern-real",
      dateEvent: "2026-04-15",
      strHomeTeam: "Bayern Munich",
      strAwayTeam: "Real Madrid",
      intHomeScore: 4,
      intAwayScore: 3
    })
  ];

  return knownEvents.filter(event => isDateWithinWindow(event.dateEvent));
}

function getConferenceLeagueFallbackEvents() {
  const knownEvents = [
    makeFallbackEvent({
      idEvent: "conf-fallback-2026-04-16-az-alkmaar-shakhtar",
      dateEvent: "2026-04-16",
      strHomeTeam: "AZ Alkmaar",
      strAwayTeam: "Shakhtar Donetsk",
      intHomeScore: 2,
      intAwayScore: 2
    })
  ];

  return knownEvents.filter(event => isDateWithinWindow(event.dateEvent));
}

function getCupFallbackEvents() {
  const knownEvents = [
    makeFallbackEvent({
      idEvent: "uaf-cup-fallback-2026-04-21-bukovyna-dynamo",
      dateEvent: "2026-04-21",
      strTime: "18:00:00",
      strHomeTeam: "Буковина Чернівці",
      strAwayTeam: "Динамо Київ"
    }),
    makeFallbackEvent({
      idEvent: "uaf-cup-fallback-2026-04-22-metalist1925-chernihiv",
      dateEvent: "2026-04-22",
      strTime: "18:00:00",
      strHomeTeam: "Металіст 1925 Харків",
      strAwayTeam: "Чернігів"
    })
  ];

  return knownEvents.filter(event => isDateWithinWindow(event.dateEvent));
}

function decodeHtmlText(text) {
  return text
    .replace(/&/g, "&")
    .replace(/&#x27;|'/g, "'")
    .replace(/"/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

function htmlToPlainText(html) {
  return decodeHtmlText(
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function getDateWindow() {
  const todayIso = getKyivTodayIso();
  const minDateIso = shiftIsoDate(todayIso, -7);
  const maxDateIso = shiftIsoDate(todayIso, 7);

  return { minDateIso, maxDateIso };
}

function isDateWithinWindow(dateString) {
  const { minDateIso, maxDateIso } = getDateWindow();
  return dateString >= minDateIso && dateString <= maxDateIso;
}

function parseDmyToIso(dateText) {
  const [day, month, year] = dateText.split("/");
  return `${year}-${month}-${day}`;
}

function parseDotDmyToIso(dateText) {
  const [day, month, year] = dateText.split(".");
  return `${year}-${month}-${day}`;
}

function cleanExtractedText(text) {
  return decodeHtmlText(text)
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTntUplEvents(html) {
  const sections = html.split(/<div class="section-title-4[^"]*">(\d{2}\/\d{2}\/\d{4})<\/div>/);
  const events = [];

  for (let i = 1; i < sections.length; i += 2) {
    const dateText = sections[i];
    const dateEvent = parseDmyToIso(dateText);

    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const sectionHtml = sections[i + 1] || "";
    const cards = sectionHtml.split(/<div data-testid="match-card"/).slice(1);

    for (const cardHtml of cards) {
      const homeMatch = cardHtml.match(/text-right">([^<]+)<\/div>/);
      const awayMatch = cardHtml.match(/text-left">([^<]+)<\/div>/);

      if (!homeMatch || !awayMatch) {
        continue;
      }

      const values = [...cardHtml.matchAll(/<span class="overflow-hidden whitespace-nowrap">([^<]+)<\/span>/g)]
        .map(match => decodeHtmlText(match[1]))
        .filter(Boolean);

      const homeTeam = decodeHtmlText(homeMatch[1]);
      const awayTeam = decodeHtmlText(awayMatch[1]);
      const plainText = htmlToPlainText(cardHtml);

      let strTime = "00:00:00";
      let intHomeScore = null;
      let intAwayScore = null;
      let strStatus = "Scheduled";

      if (values.length >= 2 && /^\d+$/.test(values[0]) && /^\d+$/.test(values[1])) {
        intHomeScore = Number(values[0]);
        intAwayScore = Number(values[1]);
        strStatus = "Match Finished";
      } else if (values.length >= 1 && /^\d{1,2}:\d{2}$/.test(values[0])) {
        strTime = `${values[0]}:00`;
      } else {
        const betweenTeams = plainText.split(homeTeam)[1]?.split(awayTeam)[0]?.trim() || "";

        const scoreMatch = betweenTeams.match(/\b(\d+)\s+(\d+)\b/);
        if (scoreMatch) {
          intHomeScore = Number(scoreMatch[1]);
          intAwayScore = Number(scoreMatch[2]);
          strStatus = "Match Finished";
        } else {
          const timeMatch = betweenTeams.match(/\b(\d{1,2}:\d{2})\b/);
          if (timeMatch) {
            strTime = `${timeMatch[1]}:00`;
          }
        }
      }

      const idMatch = cardHtml.match(/_mtc(\d+)/);

      events.push({
        idEvent: idMatch ? `tnt-${idMatch[1]}` : `tnt-${dateEvent}-${homeTeam}-${awayTeam}`,
        dateEvent,
        strTime,
        strStatus,
        strHomeTeam: homeTeam,
        strAwayTeam: awayTeam,
        intHomeScore,
        intAwayScore,
        isLocalTime: true
      });
    }
  }

  const uniqueEvents = events.filter((event, index, arr) =>
    arr.findIndex(item => item.idEvent === event.idEvent) === index
  );

  return uniqueEvents.sort(sortByDateTimeAsc);
}

function parseOfficialUplEvents(html) {
  const sections = html.split(/<div class="tour-date">(\d{2}\.\d{2}\.\d{4})<\/div>/);
  const events = [];

  for (let i = 1; i < sections.length; i += 2) {
    const dateText = sections[i];
    const dateEvent = parseDotDmyToIso(dateText);

    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const sectionHtml = sections[i + 1] || "";
    const cards = sectionHtml.split(/<div class="tour-match">/).slice(1);

    for (const cardHtml of cards) {
      const homeMatch = cardHtml.match(/<div class="team first-team">[\s\S]*?<div class="logo">[\s\S]*?<\/div>\s*([^<]+?)\s*<\/div>/);
      const awayMatch = cardHtml.match(/<div class="team second-team">[\s\S]*?<div class="logo">[\s\S]*?<\/div>\s*([^<]+?)\s*<\/div>/);
      const resultMatch = cardHtml.match(/<div class="resualt">[\s\S]*?<a [^>]*>([^<]+)<\/a>/);
      const reportMatch = cardHtml.match(/\/report\/view\/(\d+)/);

      if (!homeMatch || !awayMatch) {
        continue;
      }

      const homeTeam = cleanExtractedText(homeMatch[1]);
      const awayTeam = cleanExtractedText(awayMatch[1]);
      const resultText = cleanExtractedText(resultMatch?.[1] || "");

      let strTime = "00:00:00";
      let intHomeScore = null;
      let intAwayScore = null;
      let strStatus = "Scheduled";

      if (/^\d{1,2}:\d{2}$/.test(resultText)) {
        strTime = `${resultText}:00`;
      } else {
        const scoreMatch = resultText.match(/^(\d+)\s*:\s*(\d+)$/);

        if (scoreMatch) {
          intHomeScore = Number(scoreMatch[1]);
          intAwayScore = Number(scoreMatch[2]);
          strStatus = "Match Finished";
        }
      }

      events.push({
        idEvent: reportMatch ? `upl-official-${reportMatch[1]}` : `upl-official-${dateEvent}-${homeTeam}-${awayTeam}`,
        dateEvent,
        strTime,
        strStatus,
        strHomeTeam: homeTeam,
        strAwayTeam: awayTeam,
        intHomeScore,
        intAwayScore,
        isLocalTime: true
      });
    }
  }

  return dedupeEvents(events).sort(sortByDateTimeAsc);
}

function parseFlashscoreFixtureEvents(html) {
  const text = htmlToPlainText(html)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const currentYear = Number(getKyivTodayIso().slice(0, 4));
  const events = [];
  const chunks = text.split(/(?=\b\d{2}\.\d{2}\.)/g).map(chunk => chunk.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const dateMatch = chunk.match(/^(\d{2})\.(\d{2})\.\s*(.+)$/);
    if (!dateMatch) {
      continue;
    }

    const [, day, month, rest] = dateMatch;
    const dateEvent = `${currentYear}-${month}-${day}`;

    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const fragments = rest
      .split(",")
      .map(part => part.trim())
      .filter(Boolean);

    for (const fragment of fragments) {
      if (/^Показати більше/i.test(fragment)) {
        continue;
      }

      const match = fragment.match(/^(.+?)\s*-\s*(.+)$/);
      if (!match) {
        continue;
      }

      const homeTeam = cleanExtractedText(match[1]);
      const awayTeam = cleanExtractedText(match[2]);

      if (!homeTeam || !awayTeam) {
        continue;
      }

      events.push({
        idEvent: `flashscore-${dateEvent}-${homeTeam}-${awayTeam}`,
        dateEvent,
        strTime: "00:00:00",
        strStatus: "Scheduled",
        strHomeTeam: homeTeam,
        strAwayTeam: awayTeam,
        intHomeScore: null,
        intAwayScore: null,
        isLocalTime: true
      });
    }
  }

  return dedupeEvents(events).sort(sortByDateTimeAsc);
}

function parseCupUafEvents(html) {
  const text = htmlToPlainText(html)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const calendarSection = text.split("Календар матчів")[1]?.split("Новини")[0] || text;
  const events = [];
  const matchPattern = /(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})\s+(.+?)\s*-\s+(.+?)(?=\s+\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}\s+|$)/g;

  for (const match of calendarSection.matchAll(matchPattern)) {
    const [, dateText, timeText, homeTeamRaw, awayTeamRaw] = match;
    const dateEvent = parseDotDmyToIso(dateText);

    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const homeTeam = getUplTeamName(cleanExtractedText(homeTeamRaw));
    const awayTeam = getUplTeamName(cleanExtractedText(awayTeamRaw));

    if (!homeTeam || !awayTeam) {
      continue;
    }

    events.push({
      idEvent: `uaf-cup-${dateEvent}-${homeTeam}-${awayTeam}`.replace(/\s+/g, "-"),
      dateEvent,
      strTime: `${timeText}:00`,
      strStatus: "Scheduled",
      strHomeTeam: homeTeam,
      strAwayTeam: awayTeam,
      intHomeScore: null,
      intAwayScore: null,
      isLocalTime: true
    });
  }

  const parsedEvents = dedupeEvents(events).sort(sortByDateTimeAsc);

  if (parsedEvents.length > 0) {
    return parsedEvents;
  }

  return getCupFallbackEvents();
}

async function fetchCupEvents() {
  const cupUrl = "https://kubok.uaf.ua/";
  const cupHtml = await fetchText(cupUrl, "Кубок України fetch error");

  if (!cupHtml) {
    const fallbackEvents = getCupFallbackEvents();
    console.log(`⚠️ Кубок України source unavailable, using fallback schedule: ${fallbackEvents.length} matches in ±7 days window`);
    return fallbackEvents.length > 0 ? fallbackEvents : null;
  }

  const events = parseCupUafEvents(cupHtml);

  if (events.length > 0) {
    if (events.some(event => event.idEvent.startsWith("uaf-cup-fallback-"))) {
      console.log(`⚠️ Кубок України source incomplete, using fallback schedule: ${events.length} matches in ±7 days window`);
    } else {
      console.log(`✅ Кубок України fetched: ${events.length} matches in ±7 days window`);
    }
    return events;
  }

  console.log("⚠️ Кубок України source empty, keeping existing");
  return null;
}

async function fetchUplEvents() {
  const officialUrl = "https://upl.ua/en/tournaments/championship/428/calendar";
  const officialHtml = await fetchText(officialUrl, "УПЛ official upl.ua fetch error");

  if (officialHtml) {
    const events = parseOfficialUplEvents(officialHtml);

    if (events.length > 0) {
      console.log(`✅ УПЛ fetched from official upl.ua: ${events.length} matches in ±7 days window`);
      return events;
    }
  }

  const flashscoreUrl = "https://www.flashscore.ua/soccer/ukraine/premier-league/fixtures/";
  const flashscoreHtml = await fetchText(flashscoreUrl, "УПЛ Flashscore fetch error");

  if (flashscoreHtml) {
    const events = parseFlashscoreFixtureEvents(flashscoreHtml);

    if (events.length > 0) {
      console.log(`⚠️ УПЛ official source empty, fallback to Flashscore: ${events.length} matches in ±7 days window`);
      return events;
    }
  }

  const tntUrl = "https://www.tntsports.co.uk/football/ukrainian-premier-league/2025-2026/calendar-results.shtml";
  const tntHtml = await fetchText(tntUrl, "УПЛ TNT Sports fetch error");

  if (tntHtml) {
    const events = parseTntUplEvents(tntHtml);

    if (events.length > 0) {
      console.log(`⚠️ УПЛ official source empty, fallback to TNT Sports: ${events.length} matches in ±7 days window`);
      return events;
    }
  }

  console.log("⚠️ UPL web sources returned no matches, falling back to TheSportsDB");
  return fetchLeagueEvents(4354, "УПЛ");
}

async function fetchCompetitionEvents(leagueId, leagueName) {
  const nextUrl = `https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=${leagueId}`;
  const pastUrl = `https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=${leagueId}`;

  const [nextData, pastData] = await Promise.all([
    fetchJson(nextUrl, `${leagueName} next events fetch error`),
    fetchJson(pastUrl, `${leagueName} past events fetch error`)
  ]);

  const nextEvents = Array.isArray(nextData?.events) ? nextData.events : [];
  const pastEvents = Array.isArray(pastData?.events) ? pastData.events : [];

  const allEvents = [...pastEvents, ...nextEvents];
  const uniqueEvents = dedupeEvents(allEvents);
  return uniqueEvents.filter(event => isDateWithinWindow(event.dateEvent)).sort(sortByDateTimeAsc);
}

async function fetchLeagueEvents(leagueId, leagueName) {
  const rangeEvents = await fetchCompetitionEvents(leagueId, leagueName);

  if (rangeEvents.length > 0) {
    console.log(`✅ ${leagueName} fetched: ${rangeEvents.length} matches in ±7 days window`);
    return rangeEvents;
  }

  console.log(`⚠️ ${leagueName} returned no matches in ±7 days window, keeping existing`);
  return null;
}

async function fetchChampionsLeagueEvents() {
  const apiEvents = await fetchLeagueEvents(4480, "Ліга чемпіонів");
  const fallbackEvents = getChampionsLeagueFallbackEvents();

  if (!fallbackEvents.length) {
    return apiEvents;
  }

  const mergedEvents = dedupeEvents([
    ...(apiEvents || []),
    ...fallbackEvents
  ])
    .filter(event => isDateWithinWindow(event.dateEvent))
    .sort(sortByDateTimeAsc);

  if (!apiEvents || mergedEvents.length > apiEvents.length) {
    console.log(`⚠️ Ліга чемпіонів source incomplete, merged fallback matches: ${mergedEvents.length}`);
  }

  return mergedEvents;
}

async function fetchFlashscoreCompetitionEvents(url, label) {
  const urlsToTry = [url];

  if (url.includes("/fixtures/")) {
    urlsToTry.push(url.replace("/fixtures/", "/results/"));
  } else if (url.includes("/results/")) {
    urlsToTry.push(url.replace("/results/", "/fixtures/"));
  }

  for (const candidateUrl of urlsToTry) {
    const html = await fetchText(candidateUrl, `${label} Flashscore fetch error`);

    if (!html) {
      continue;
    }

    const events = parseFlashscoreFixtureEvents(html);

    if (events.length > 0) {
      return events;
    }
  }

  return [];
}

async function fetchExtraMatches() {
  const clubMatches = [];
  const nationalMatches = [];

  for (const config of extraCompetitionConfigs) {
    const apiEvents = await fetchCompetitionEvents(config.id, config.name);
    const apiRelevantEvents = apiEvents.filter(event => isExtraCompetitionMatch(event, config.type));
    let mergedRelevantEvents = [...apiRelevantEvents];

    if (config.name === "Ліга конференцій") {
      mergedRelevantEvents = dedupeEvents([
        ...mergedRelevantEvents,
        ...getConferenceLeagueFallbackEvents()
      ])
        .filter(event => isDateWithinWindow(event.dateEvent))
        .sort(sortByDateTimeAsc);
    }

    if (Array.isArray(config.flashscoreUrls)) {
      for (const url of config.flashscoreUrls) {
        const flashscoreEvents = await fetchFlashscoreCompetitionEvents(url, config.name);
        const flashscoreRelevantEvents = flashscoreEvents.filter(event => isExtraCompetitionMatch(event, config.type));

        if (flashscoreRelevantEvents.length) {
          mergedRelevantEvents = dedupeEvents([
            ...mergedRelevantEvents,
            ...flashscoreRelevantEvents
          ]).filter(event => isDateWithinWindow(event.dateEvent)).sort(sortByDateTimeAsc);

          console.log(`⚠️ ${config.name}: merged Flashscore fallback with ${flashscoreRelevantEvents.length} Ukrainian-related matches in ±7 days window`);
        }
      }
    }

    if (!mergedRelevantEvents.length) {
      continue;
    }

    console.log(`✅ ${config.name}: found ${mergedRelevantEvents.length} Ukrainian-related matches in ±7 days window`);

    const mappedMatches = mergedRelevantEvents.map(event =>
      mapEventToMatch(event, config.name, getUplTeamName)
    );

    if (config.type === "club") {
      clubMatches.push(...mappedMatches);
    } else if (config.type === "national") {
      nationalMatches.push(...mappedMatches);
    }
  }

  return { clubMatches, nationalMatches };
}

async function main() {
  const matches = {
    "УПЛ": existingData["УПЛ"] || [],
    "Ліга чемпіонів": existingData["Ліга чемпіонів"] || existingData["Champions League"] || [],
    "Кубок України": existingData["Кубок України"] || [],
    "Ліга Європи": existingData["Ліга Європи"] || [],
    "Ліга конференцій": existingData["Ліга конференцій"] || [],
    "Суперкубок УЄФА": existingData["Суперкубок УЄФА"] || [],
    "Ліга націй УЄФА": existingData["Ліга націй УЄФА"] || [],
    "Чемпіонат світу": existingData["Чемпіонат світу"] || [],
    "Чемпіонат Європи": existingData["Чемпіонат Європи"] || [],
    "Українські клуби в Європі": existingData["Українські клуби в Європі"] || [],
    "Збірна України": existingData["Збірна України"] || []
  };

  if (shouldReuseCachedMatches(existingData)) {
    const meta = readRefreshMeta();
    const ttlMinutes = typeof meta?.ttlMinutes === "number" ? meta.ttlMinutes : getRefreshTtlMinutes(existingData);
    const ageMinutes = meta?.lastUpdated ? Math.max(0, Math.round((Date.now() - new Date(meta.lastUpdated).getTime()) / 60000)) : 0;
    console.log(`⏭️ Cache fresh (${ageMinutes}m old, TTL ${ttlMinutes}m), reusing existing matches.json`);
    return;
  }

  const [uplEvents, clEvents, cupEvents, extraMatches] = await Promise.all([
    fetchUplEvents(),
    fetchChampionsLeagueEvents(),
    fetchCupEvents(),
    fetchExtraMatches()
  ]);

  if (uplEvents) {
    matches["УПЛ"] = uplEvents.map(event =>
      mapEventToMatch(event, "УПЛ", getUplTeamName)
    );
  }

  if (clEvents) {
    matches["Ліга чемпіонів"] = clEvents.map(event =>
      mapEventToMatch(event, "Ліга чемпіонів")
    );
  }

  if (cupEvents) {
    matches["Кубок України"] = cupEvents.map(event =>
      mapEventToMatch(event, "Кубок України", getUplTeamName)
    );
  }

  matches["Українські клуби в Європі"] = extraMatches.clubMatches;
  matches["Збірна України"] = extraMatches.nationalMatches;

  fs.writeFileSync("matches.json", JSON.stringify(matches, null, 2));
  writeRefreshMeta({
    lastUpdated: new Date().toISOString(),
    ttlMinutes: getRefreshTtlMinutes(matches),
    forceRefresh: isRefreshForced()
  });
  console.log("✅ matches.json updated");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
});
