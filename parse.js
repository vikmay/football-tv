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
const RECENT_RESULTS_TTL_MINUTES = 5;
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

function hasRecentFinishedMatches(matchesData) {
  const todayIso = getKyivTodayIso();
  const yesterdayIso = shiftIsoDate(todayIso, -1);

  return Object.values(matchesData)
    .filter(Array.isArray)
    .flat()
    .some(match =>
      match?.status === "Match Finished" &&
      typeof match?.dateIso === "string" &&
      match.dateIso >= yesterdayIso &&
      match.dateIso <= todayIso
    );
}

function getRefreshTtlMinutes(matchesData) {
  if (hasRecentFinishedMatches(matchesData)) {
    return RECENT_RESULTS_TTL_MINUTES;
  }

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
  "Рух": "Рух Львів",
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
  "Буковина": "Буковина Чернівці",
  "Chernihiv": "Чернігів",
  "Chernihiv (Ч)": "Чернігів",
  "Dynamo (К)": "Динамо Київ",
  "Dynamo (K)": "Динамо Київ",
  "Динамо К.": "Динамо Київ",
  "Шахтар Д.": "Шахтар Донецьк",
  "Металіст 1925": "Металіст 1925 Харків",
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
  "Ahrobiznes Volochysk": "Агробізнес Волочиськ",
  "Agrobiznes Volochysk": "Агробізнес Волочиськ",

  // Flashscore results (UПЛ) often returns short Cyrillic variants
  "Рух": "Рух Львів",
  "Зоря": "Зоря Луганськ",
  "Верес": "Верес Рівне",
  "Оболонь": "Оболонь Київ",
  "Полісся Ж.": "Полісся Житомир",
  "Карпати Л.": "Карпати Львів",
  "Металіст 1925": "Металіст 1925 Харків",

  // keep existing canonical names for completeness
  "Полісся Житомир": "Полісся Житомир",
  "Карпати Львів": "Карпати Львів",
  "Оболонь Київ": "Оболонь Київ",

  "Poltava": "Полтава",
  "SC Poltava": "СК Полтава",
  "Aston Villa": "Астон Вілла",
  "Nottingham Forest": "Ноттінгем Форест"
};

function getUplTeamName(englishName) {
  // important: normalize encoding/entities before matching
  const raw = cleanExtractedText(String(englishName || ""));
  const lower = raw.toLowerCase();

  // Flashscore інколи дає коротку форму: "Агробізнес" / "Agrobiznes"
  // Без цього мапінгу у нас з'являвся дублікат.
  if (
    raw.includes("Агробізнес") ||
    raw.includes("Ахробізнес") ||
    lower.includes("agrobiznes") ||
    lower.includes("ahrobiznes")
  ) {
    return uplTeamNames["Agrobiznes Volochysk"] || "Агробізнес Волочиськ";
  }

  return uplTeamNames[raw] || uplTeamNames[englishName] || raw;
}

function normalizeCupTeamName(name) {
  const mappedName = getUplTeamName(name);
  const cupAliases = {
    "Буковина": "Буковина Чернівці",
    "Буковина Чернівці": "Буковина Чернівці",
    "Металіст 1925": "Металіст 1925 Харків",
    "Металіст 1925 Харків": "Металіст 1925 Харків",
    "Динамо К.": "Динамо Київ",
    "Динамо Київ": "Динамо Київ",
    "Чернігів": "Чернігів"
  };

  return cupAliases[mappedName] || mappedName;
}

const ukrainianClubAliases = new Set(
  [
    ...Object.keys(uplTeamNames).filter(name => name !== "Ukraine"),
    ...Object.values(uplTeamNames).filter(name => name !== "Україна")
  ]
);

function transliterateLatinToCyrillic(text) {
  const rules = [
    ["shch", "щ"],
    ["sch", "щ"],
    ["yo", "йо"],
    ["yu", "ю"],
    ["ya", "я"],
    ["zh", "ж"],
    ["kh", "х"],
    ["ts", "ц"],
    ["ch", "ч"],
    ["sh", "ш"],
    ["ie", "є"],
    ["yi", "ї"],
    ["i", "і"],
    ["g", "г"],
    ["a", "а"],
    ["b", "б"],
    ["v", "в"],
    ["d", "д"],
    ["e", "е"],
    ["z", "з"],
    ["y", "и"],
    ["k", "к"],
    ["l", "л"],
    ["m", "м"],
    ["n", "н"],
    ["o", "о"],
    ["p", "п"],
    ["r", "р"],
    ["s", "с"],
    ["t", "т"],
    ["u", "у"],
    ["f", "ф"],
    ["c", "к"],
    ["j", "дж"],
    ["w", "в"],
    ["q", "к"],
    ["x", "кс"]
  ];

  let result = String(text || "").toLowerCase();

  for (const [latin, cyrillic] of rules) {
    result = result.replaceAll(latin, cyrillic);
  }

  return result;
}

const flashscoreClubAliases = {
  "psg": "псж",
  "paris sg": "псж",
  "paris saint-germain": "псж",
  "bayern munich": "баварія мюнхен",
  "fc bayern munchen": "баварія мюнхен",
  "arsenal": "арсенал",
  "atletico": "атлетіко",
  "atlético madrid": "атлетіко",
  "nottingham": "ноттінгем форест",
  "nottingham forest": "ноттінгем форест",
  "aston villa": "астон вілла",
  "crystal palace": "кристал пелес",
  "braga": "брага",
  "freiburg": "фрайбург",
  "strasbourg": "страсбург",
  "rayo vallecano": "райо вальєкано",
  "fiorentina": "фіорентина",
  "real betis": "реал бетіс",
  "athletic bilbao": "атлетик більбао",
  "manchester united": "манчестер юнайтед",

  // UPL: prevent duplicate match rows when one source uses short/variant team names
  "рух": "рух львів",
  "рух львів": "рух львів",

  "оболонь": "оболонь київ",
  "оболонь київ": "оболонь київ",

  "зоря": "зоря луганськ",
  "зоря луганськ": "зоря луганськ",

  "колос": "колос ковалівка",
  "колос ковалівка": "колос ковалівка",

  "верес": "верес рівне",
  "верес рівне": "верес рівне",

  "полісся": "полісся житомир",
  "полісся ж.": "полісся житомир",
  "полісся житомир": "полісся житомир",

  "карпати л.": "карпати львів",
  "карпати львів": "карпати львів",

  "полтава": "ск полтава",
  "ск полтава": "ск полтава"
};

function normalizeClubLookupName(name) {
  const cleaned = cleanExtractedText(String(name || ""))
    .replace(/\s+/g, " ")
    .replace(/^[«"]+|[»"]+$/g, "")
    .trim();

  const lowered = cleaned.toLowerCase();
  const transliterated = transliterateLatinToCyrillic(cleaned);

  return flashscoreClubAliases[lowered] || flashscoreClubAliases[transliterated] || transliterated;
}


// Non-soccer teams Flashscore sometimes mis-categorizes under "world-championship"

// World Cup team name mapping (English → Ukrainian)
const worldCupTeamNames = {
  "Mexico": "Мексика",
  "South Korea": "Південна Корея",
  "Czech Republic": "Чехія",
  "South Africa": "Південна Африка",
  "Switzerland": "Швейцарія",
  "Canada": "Канада",
  "Qatar": "Катар",
  "Bosnia and Herzegovina": "Боснія і Герцеговина",
  "Bosnia & Herzegovina": "Боснія і Герцеговина",
  "Brazil": "Бразилія",
  "Morocco": "Марокко",
  "Scotland": "Шотландія",
  "Haiti": "Гаїті",
  "United States": "США",
  "USA": "США",
  "Turkey": "Туреччина",
  "Australia": "Австралія",
  "Paraguay": "Парагвай",
  "Germany": "Німеччина",
  "Ecuador": "Еквадор",
  "Ivory Coast": "Кот-д'Івуар",
  "Curacao": "Кюрасао",
  "Curaçao": "Кюрасао",
  "Netherlands": "Нідерланди",
  "Japan": "Японія",
  "Sweden": "Швеція",
  "Tunisia": "Туніс",
  "Belgium": "Бельгія",
  "Iran": "Іран",
  "Egypt": "Єгипет",
  "New Zealand": "Нова Зеландія",
  "Spain": "Іспанія",
  "Uruguay": "Уругвай",
  "Saudi Arabia": "Саудівська Аравія",
  "Cape Verde": "Кабо-Верде",
  "France": "Франція",
  "Senegal": "Сенегал",
  "Norway": "Норвегія",
  "Iraq": "Ірак",
  "Argentina": "Аргентина",
  "Austria": "Австрія",
  "Algeria": "Алжир",
  "Jordan": "Йорданія",
  "Portugal": "Португалія",
  "Colombia": "Колумбія",
  "DR Congo": "ДР Конго",
  "Uzbekistan": "Узбекистан",
  "England": "Англія",
  "Croatia": "Хорватія",
  "Panama": "Панама",
  "Ghana": "Гана",
  "Italy": "Італія",
  "Denmark": "Данія",
  "Poland": "Польща",
  "Serbia": "Сербія",
  "Nigeria": "Нігерія",
  "Cameroon": "Камерун",
  "Chile": "Чилі",
  "Peru": "Перу",
  "Ukraine": "Україна",
  "Slovakia": "Словаччина",
  "Romania": "Румунія",
  "Greece": "Греція",
  "Hungary": "Угорщина",
  "Slovenia": "Словенія",
  "Ireland": "Ірландія",
  "Montenegro": "Чорногорія",
  "Albania": "Албанія",
  "North Macedonia": "Північна Македонія",
  "Georgia": "Грузія",
  "Armenia": "Вірменія",
  "Azerbaijan": "Азербайджан",
  "Kazakhstan": "Казахстан",
  "Israel": "Ізраїль",
  "Cyprus": "Кіпр",
  "Malta": "Мальта",
  "Moldova": "Молдова",
  "Estonia": "Естонія",
  "Latvia": "Латвія",
  "Lithuania": "Литва",
  "China": "Китай",
  "Venezuela": "Венесуела",
  "Bolivia": "Болівія",
  "Costa Rica": "Коста-Рика",
  "Jamaica": "Ямайка",
  "Honduras": "Гондурас",
  "El Salvador": "Сальвадор",
  "Guatemala": "Гватемала",
  "Cuba": "Куба",
  "Dominican Republic": "Домініканська Республіка"
};

function getWorldCupTeamName(englishName) {
  const cleaned = cleanExtractedText(String(englishName || "")).trim();
  return worldCupTeamNames[cleaned] || cleaned;
}

function isFlashscoreBrokenTeamName(name) {
  // Flashscore sometimes splits a team name at a hyphen, creating a short fragment
  // like "Кот" when the real name is "Кот-д’Івуар".
  // We filter out such fragments here.
  const cleaned = String(name || "").trim();
  const minRealTeamNameLength = 3;
  if (cleaned.length < minRealTeamNameLength) return true;
  // Name that starts with a hyphen-apostrophe combo (e.g. "д’Івуар - Еквадор")
  // means the away team was split from the home team at the same hyphen.
  if (/^[дл]'|^[дл][’']/.test(cleaned)) return true;
  return false;
}

const nonSoccerTeams = new Set([
  "Arizona Diamondbacks", "Washington Nationals", "Chicago Cubs", "San Francisco Giants",
  "Boston Red Sox", "Baltimore Orioles", "Seattle Mariners", "New York Mets",
  "New York Yankees", "Los Angeles Dodgers", "Houston Astros", "Atlanta Braves",
  "St. Louis Cardinals", "Philadelphia Phillies", "Milwaukee Brewers", "Miami Marlins",
  "Cincinnati Reds", "Pittsburgh Pirates", "Detroit Tigers", "Cleveland Guardians",
  "Chicago White Sox", "Kansas City Royals", "Minnesota Twins", "Texas Rangers",
  "Los Angeles Angels", "Oakland Athletics", "Tampa Bay Rays", "Toronto Blue Jays",
  "Colorado Rockies", "San Diego Padres"
]);

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
    type: "worldcup",
    flashscoreUrls: [
      "https://www.flashscore.ua/soccer/world/world-championship/fixtures/",
      "https://www.flashscore.ua/soccer/world/world-championship/results/"
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
  const normalizedName = normalizeClubLookupName(name);
  const mappedName = getUplTeamName(normalizedName);

  return (
    ukrainianClubAliases.has(normalizedName) ||
    ukrainianClubAliases.has(mappedName) ||
    [...ukrainianClubAliases].some(alias => normalizeClubLookupName(alias) === normalizedName)
  );
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

  // worldcup — show ALL matches
  if (type === "worldcup") {
    return true;
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

function normalizeMatchSnapshot(match) {
  const hasValidScore = typeof match.score === "string" && match.score.trim() !== "";
  // Розширюємо перевірку на статуси завершеного матчу (Match Finished, FT, AET)
  const isFinished = match.status === "Match Finished" || match.status === "FT" || match.status === "AET";

  return {
    ...match,
    status: isFinished && hasValidScore ? "Match Finished" : (match.status || "Scheduled"),
    score: isFinished && hasValidScore ? match.score : "",
    originalTime: match.originalTime || match.time // Зберігаємо оригінальний час для коректного сортування
  };
}

function isActiveOrFinishedMatch(match) {
  if (!match) {
    return false;
  }

  return match.status === "Match Finished" || match.status === "Live" || match.status === "In Progress" || match.status === "1st Half" || match.status === "2nd Half";
}

function mergeCurrentAndPreviousMatches(currentMatches, previousMatches) {
  const current = Array.isArray(currentMatches) ? currentMatches : [];
  const previous = Array.isArray(previousMatches) ? previousMatches : [];
  const byIdentity = new Map();

  const getStableKey = match => {
    const home = normalizeClubLookupName(match?.home || "");
    const away = normalizeClubLookupName(match?.away || "");
    const league = String(match?.league || "");
    // Використовуємо оригінальний час для ключа, навіть якщо в .time вже записано результат
    const time = String(match?.originalTime || match?.time || "");
    return `${match?.dateIso || ""}|${time}|${league}|${home}|${away}`;
  };

  const getStatusRank = match => {
    const status = String(match?.status || "");
    const hasScore = String(match?.score || "").trim() !== "";

    if (status === "Match Finished" && hasScore) {
      return 3000;
    }

    if (status === "Match Finished") {
      return 2500;
    }

    if (status === "Live" || status === "In Progress" || status === "1st Half" || status === "2nd Half") {
      return 2000;
    }

    if (hasScore) {
      return 1500;
    }

    if (status === "Scheduled" || status === "Not Started") {
      return 1000;
    }

    return 0;
  };

  const getScore = match => {
    const nameScore = String(match?.home || "").length + String(match?.away || "").length;
    const idScore = String(match?.idEvent || "").length / 1000;
    return getStatusRank(match) + nameScore + idScore;
  };

  for (const match of [...previous, ...current]) {
    const key = getStableKey(match);
    const existing = byIdentity.get(key);

    if (!existing) {
      byIdentity.set(key, match);
      continue;
    }

    const existingScoreText = String(existing?.score || "").trim();
    const incomingScoreText = String(match?.score || "").trim();

    const existingIsFinished = String(existing?.status || "") === "Match Finished";
    const incomingIsFinished = String(match?.status || "") === "Match Finished";

    // System fix:
    // якщо обидва матчі finished і score відрізняється — беремо incoming (current),
    // інакше "0 - 0" може лишатися з кешу.
    if (
      existingIsFinished &&
      incomingIsFinished &&
      existingScoreText &&
      incomingScoreText &&
      existingScoreText !== incomingScoreText
    ) {
      byIdentity.set(key, match);
      continue;
    }

    const existingScore = getScore(existing);
    const incomingScore = getScore(match);

    if (incomingScore > existingScore) {
      byIdentity.set(key, match);
      continue;
    }

    if (incomingScore === existingScore && String(match?.idEvent || "").length > String(existing?.idEvent || "").length) {
      byIdentity.set(key, match);
    }
  }

  return [...byIdentity.values()].sort((a, b) => {
    const aTime = a.originalTime || a.time || "00:00";
    const bTime = b.originalTime || b.time || "00:00";
    const aDate = `${a.dateIso || "9999-12-31"}T${aTime}`;
    const bDate = `${b.dateIso || "9999-12-31"}T${bTime}`;
    return new Date(aDate) - new Date(bDate);
  });
}

function dedupeMatchesByPairKeepLatestDate(matches) {
  const list = Array.isArray(matches) ? matches : [];
  const byPair = new Map();

  const toComparableDateTime = match => {
    const time = typeof match?.originalTime === "string" ? match.originalTime : (typeof match?.time === "string" ? match.time : "00:00");
    const dateIso = typeof match?.dateIso === "string" && match.dateIso ? match.dateIso : "0001-01-01";
    return `${dateIso}T${time}`;
  };

  const getKey = match => {
    const league = String(match?.league || "");
    const home = getUplTeamName(String(match?.home || ""));
    const away = getUplTeamName(String(match?.away || ""));
    // Direction-aware: A (home) vs B (away) — важливо, щоб не “склеїти” реальні матчі в різні дні
    return `${league}|${home}|${away}`;
  };

  for (const match of list) {
    const key = getKey(match);
    const existing = byPair.get(key);

    if (!existing) {
      byPair.set(key, match);
      continue;
    }

    const existingDt = toComparableDateTime(existing);
    const incomingDt = toComparableDateTime(match);

    if (incomingDt > existingDt) {
      byPair.set(key, match);
      continue;
    }

    if (incomingDt === existingDt) {
      const existingIsFinished = String(existing?.status || "") === "Match Finished";
      const incomingIsFinished = String(match?.status || "") === "Match Finished";

      const existingHasScore = String(existing?.score || "").trim() !== "";
      const incomingHasScore = String(match?.score || "").trim() !== "";

      // Prefer finished matches with a real score over scheduled/empty duplicates
      if (incomingIsFinished && incomingHasScore && (!existingIsFinished || !existingHasScore)) {
        byPair.set(key, match);
        continue;
      }

      if (
        incomingIsFinished === existingIsFinished &&
        incomingHasScore === existingHasScore &&
        String(match?.idEvent || "").length > String(existing?.idEvent || "").length
      ) {
        byPair.set(key, match);
        continue;
      }
    }
  }

  return [...byPair.values()].sort(sortByDateTimeAsc);
}

function dedupeMatchesByIdentity(matches, excludedMatches = []) {
  const excludeKeys = new Set(
    (Array.isArray(excludedMatches) ? excludedMatches : []).map(match => {
      const home = normalizeClubLookupName(match?.home || "");
      const league = String(match?.league || "");
      const time = String(match?.time || "");
      return `${match?.dateIso || ""}|${time}|${league}|${home}`;
    })
  );

  return (Array.isArray(matches) ? matches : []).filter(match => {
    const home = normalizeClubLookupName(match?.home || "");
    const league = String(match?.league || "");
    const time = String(match?.time || "");
    return !excludeKeys.has(`${match?.dateIso || ""}|${time}|${league}|${home}`);
  });
}

function dedupeScheduleSections(matches) {
  const sectionOrder = [
    "УПЛ",
    "Ліга чемпіонів",
    "Кубок України",
    "Ліга Європи",
    "Ліга конференцій",
    "Суперкубок УЄФА",
    "Ліга націй УЄФА",
    "Чемпіонат світу",
    "Чемпіонат Європи",
    "Українські клуби в Європі",
    "Збірна України",
    "Таблиця УПЛ"
  ];

  const getTextScore = item =>
    String(item?.home || "").length + String(item?.away || "").length;

  const result = {};

  for (const sectionName of sectionOrder) {
    const items = Array.isArray(matches?.[sectionName]) ? matches[sectionName] : [];

    if (sectionName === "Таблиця УПЛ") {
      const seenRows = new Set();
      result[sectionName] = items.filter(item => {
        if (!item || typeof item !== "object") {
          return false;
        }

        const rowKey = `table|${item.position || ""}|${normalizeClubLookupName(item.team || "")}`;
        if (seenRows.has(rowKey)) {
          return false;
        }
        seenRows.add(rowKey);
        return true;
      });
      continue;
    }

    const bySlot = new Map();

    for (const item of items) {
      if (!item || typeof item !== "object") {
        continue;
      }

      // For World Cup: dedupe by (date + league + home + away) without time,
      // because Flashscore may return the same match with 00:00 and real time.
      // Prefer the one with a real time.
      const isWc = sectionName === "Чемпіонат світу";
      const itemTime = String(item.originalTime || item.time || "");
      const slotKey = isWc
        ? `${item.dateIso || ""}|${String(item.league || "")}|${normalizeClubLookupName(item.home || "")}|${normalizeClubLookupName(item.away || "")}`
        : sectionName === "УПЛ"
          ? (() => {
            const homeKey = getUplTeamName(String(item.home || ""));
            const awayKey = getUplTeamName(String(item.away || ""));
            const pairKey = [homeKey, awayKey].sort().join("|");
            return `${item.dateIso || ""}|${itemTime}|${String(item.league || "")}|${pairKey}`;
          })()
          : `${item.dateIso || ""}|${itemTime}|${String(item.league || "")}|${normalizeClubLookupName(item.home || "")}|${normalizeClubLookupName(item.away || "")}`;
      const existing = bySlot.get(slotKey);

      if (!existing) {
        bySlot.set(slotKey, item);
        continue;
      }

      // Prefer the match with a real time over 00:00 placeholder
      const existingTime = String(existing?.originalTime || existing?.time || "");
      const incomingTime = String(item?.originalTime || item?.time || "");
      const existingIsPlaceholder = existingTime === "00:00" || existingTime === "00:00:00";
      const incomingIsPlaceholder = incomingTime === "00:00" || incomingTime === "00:00:00";

      if (incomingIsPlaceholder && !existingIsPlaceholder) {
        continue; // keep existing with real time
      }
      if (existingIsPlaceholder && !incomingIsPlaceholder) {
        bySlot.set(slotKey, item);
        continue;
      }

      const existingScore = getTextScore(existing);
      const incomingScore = getTextScore(item);

      if (incomingScore > existingScore) {
        bySlot.set(slotKey, item);
        continue;
      }

      if (incomingScore === existingScore && String(item?.idEvent || "").length > String(existing?.idEvent || "").length) {
        bySlot.set(slotKey, item);
      }
    }

    const cleanedItems = [...bySlot.values()].filter(item => {
      // For УПЛ: skip placeholder times
      if (sectionName === "УПЛ") {
        const t = String(item?.originalTime || item?.time || "");
        if (t === "00:00" || t === "00:00:00") return false;
      }
      return true;
    });

    result[sectionName] = cleanedItems.sort(sortByDateTimeAsc);
  }

  for (const [sectionName, items] of Object.entries(matches || {})) {
    if (sectionOrder.includes(sectionName)) {
      continue;
    }
    result[sectionName] = Array.isArray(items) ? items : [];
  }

  return result;
}

function mapEventToMatch(event, leagueLabel, mapTeamName = name => name) {
  return normalizeMatchSnapshot({
    home: mapTeamName(event.strHomeTeam),
    away: mapTeamName(event.strAwayTeam),
    league: formatCompetitionLabel(leagueLabel, event),
    time: formatTime(event),
    date: formatDateUk(event.dateEvent),
    dateIso: event.dateEvent,
    status: event.strStatus || "Scheduled",
    score: formatScore(event)
  });
}

function sortByDateTimeAsc(a, b) {
  const aTime = a.originalTime || a.strTime || a.time || "00:00:00";
  const bTime = b.originalTime || b.strTime || b.time || "00:00:00";
  const aDate = a.dateEvent || a.dateIso || "0001-01-01";
  const bDate = b.dateEvent || b.dateIso || "0001-01-01";

  return (
    new Date(`${aDate}T${aTime}`) - new Date(`${bDate}T${bTime}`)
  );
}

function dedupeEvents(events) {
  const getSlotKey = event =>
    [
      event?.dateEvent || "",
      String(event?.strTime || ""),
      String(event?.league || ""),
      normalizeClubLookupName(event?.strHomeTeam || ""),
      normalizeClubLookupName(event?.strAwayTeam || "")
    ].join("|");

  const getTextScore = event =>
    String(event?.strHomeTeam || "").length + String(event?.strAwayTeam || "").length;

  const getFinishedScore = event =>
    event?.strStatus === "Match Finished" || (event?.intHomeScore !== null && event?.intHomeScore !== undefined && event?.intAwayScore !== null && event?.intAwayScore !== undefined)
      ? 1000
      : 0;

  const getQualityScore = event =>
    getFinishedScore(event) +
    getTextScore(event) +
    (String(event?.idEvent || "").length / 1000);

  const groups = new Map();

  for (const event of Array.isArray(events) ? events : []) {
    const key = getSlotKey(event);
    const bucket = groups.get(key) || [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  const result = [];

  for (const bucket of groups.values()) {
    const sortedBucket = [...bucket].sort((a, b) => {
      const qualityDiff = getQualityScore(b) - getQualityScore(a);
      if (qualityDiff !== 0) {
        return qualityDiff;
      }
      return String(b?.idEvent || "").length - String(a?.idEvent || "").length;
    });

    result.push(sortedBucket[0]);
  }

  return result;
}

function mergeEventMetadata(baseEvents, metadataEvents) {
  return baseEvents.map(event => {
    const metadataEvent = metadataEvents.find(item =>
      (item.idEvent && event.idEvent && item.idEvent === event.idEvent) ||
      (
        item.dateEvent === event.dateEvent &&
        item.strHomeTeam === event.strHomeTeam &&
        item.strAwayTeam === event.strAwayTeam
      )
    );

    if (!metadataEvent) {
      return event;
    }

    const metadataPatch = {};
    for (const key of ["intRound", "strRound", "strEventRound", "strStage", "intStage"]) {
      if (metadataEvent[key] !== undefined && metadataEvent[key] !== null) {
        metadataPatch[key] = metadataEvent[key];
      }
    }

    return {
      ...event,
      ...metadataPatch
    };
  });
}

function getMatchIdentity(event) {
  return [
    event?.dateEvent || "",
    normalizeCupTeamName(event?.strHomeTeam || ""),
    normalizeCupTeamName(event?.strAwayTeam || "")
  ].join("|");
}

function normalizeCupEvent(event) {
  return {
    ...event,
    strHomeTeam: normalizeCupTeamName(event.strHomeTeam),
    strAwayTeam: normalizeCupTeamName(event.strAwayTeam)
  };
}

function parseFlashscoreCupFeedData(data) {
  const events = [];
  const blocks = data.split("~AA÷").slice(1);

  for (const block of blocks) {
    const adMatch = block.match(/(?:^|¬)AD÷(\d{10})/);
    const homeMatch = block.match(/(?:^|¬)CX÷([^¬]+)/);
    const awayMatch = block.match(/(?:^|¬)AF÷([^¬]+)/);
    const roundMatch = block.match(/(?:^|¬)ER÷([^¬]+)/);
    const scoreHomeMatch = block.match(/(?:^|¬)AG÷(\d+)/);
    const scoreAwayMatch = block.match(/(?:^|¬)AH÷(\d+)/);
    const statusCode = block.match(/(?:^|¬)AB÷(\d+)/)?.[1];

    if (!adMatch || !homeMatch || !awayMatch) {
      continue;
    }

    const kickoff = new Date(Number(adMatch[1]) * 1000);
    if (Number.isNaN(kickoff.getTime())) {
      continue;
    }

    const dateEvent = formatDateToIsoInTimeZone(kickoff, "Europe/Kyiv");
    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    let homeTeam = getUplTeamName(cleanExtractedText(homeMatch[1]));
    let awayTeam = getUplTeamName(cleanExtractedText(awayMatch[1]));

    // Fix: Flashscore иногда разделяет составные названия команд через дефис
    // например "Кот-д’Івуар" превращается в home="Кот", away="д’Івуар - Еквадор"
    const awayLower = awayTeam.toLowerCase();
    if (
      awayLower.startsWith("д'") ||
      awayLower.startsWith("д’") ||
      awayLower.startsWith("де ") ||
      (awayLower.startsWith("і ") && homeTeam.length < 6)
    ) {
      const combined = homeTeam + "-" + awayTeam;
      const parts = combined.split(" - ");
      if (parts.length === 2) {
        const maybeHome = parts[0].trim();
        const maybeAway = parts[1].trim();
        if (maybeHome && maybeAway && maybeAway.length > 2) {
          homeTeam = maybeHome;
          awayTeam = maybeAway;
        }
      }
    }

    const hasScore = Boolean(scoreHomeMatch && scoreAwayMatch);

    // Flashscore statusCode can differ between fixtures/results pages and even across leagues.
    // For UI we only need the presence of a score to mark the match as finished.
    const isFinished = hasScore;

    const roundText = cleanExtractedText(roundMatch?.[1] || "");
    const intRound = roundText.includes("Півфін") ? 150 : roundText.includes("Чвертьфін") ? 125 : roundText.includes("Фінал") ? 200 : undefined;

    events.push({
      idEvent: `flashscore-cup-${dateEvent}-${homeTeam}-${awayTeam}`.replace(/\s+/g, "-"),
      dateEvent,
      strTime: kickoff.toLocaleTimeString("uk-UA", {
        timeZone: "Europe/Kyiv",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
      strStatus: isFinished ? "Match Finished" : "Scheduled",
      strHomeTeam: homeTeam,
      strAwayTeam: awayTeam,
      intHomeScore: hasScore ? Number(scoreHomeMatch[1]) : null,
      intAwayScore: hasScore ? Number(scoreAwayMatch[1]) : null,
      intRound,
      isLocalTime: true
    });
  }

  return dedupeEvents(events).sort(sortByDateTimeAsc);
}

function mergeCupEvents(baseEvents, metadataEvents) {
  const byIdentity = new Map();

  for (const sourceEvent of [...baseEvents, ...metadataEvents].map(normalizeCupEvent)) {
    const key = getMatchIdentity(sourceEvent);
    const existingEvent = byIdentity.get(key);

    if (!existingEvent) {
      byIdentity.set(key, sourceEvent);
      continue;
    }

    const existingFinished = existingEvent.strStatus === "Match Finished" && existingEvent.intHomeScore !== null && existingEvent.intAwayScore !== null;
    const sourceFinished = sourceEvent.strStatus === "Match Finished" && sourceEvent.intHomeScore !== null && sourceEvent.intAwayScore !== null;

    if (sourceFinished && !existingFinished) {
      byIdentity.set(key, {
        ...existingEvent,
        ...sourceEvent,
        strStatus: sourceEvent.strStatus,
        intHomeScore: sourceEvent.intHomeScore,
        intAwayScore: sourceEvent.intAwayScore
      });
      continue;
    }

    if (existingFinished && !sourceFinished) {
      continue;
    }

    byIdentity.set(key, {
      ...existingEvent,
      ...sourceEvent,
      strHomeTeam: existingEvent.strHomeTeam || sourceEvent.strHomeTeam,
      strAwayTeam: existingEvent.strAwayTeam || sourceEvent.strAwayTeam,
      strTime: sourceEvent.strTime || existingEvent.strTime,
      intRound: sourceEvent.intRound ?? existingEvent.intRound,
      isLocalTime: sourceEvent.isLocalTime ?? existingEvent.isLocalTime
    });
  }

  return [...byIdentity.values()].sort(sortByDateTimeAsc);
}

function makeFallbackEvent({
  idEvent,
  dateEvent,
  strHomeTeam,
  strAwayTeam,
  intHomeScore,
  intAwayScore,
  intRound,
  strTime = "20:00:00",
  strStatus = "Match Finished",
  isLocalTime = false
}) {
  return {
    idEvent,
    dateEvent,
    strTime,
    strStatus,
    strHomeTeam,
    strAwayTeam,
    intHomeScore,
    intAwayScore,
    intRound,
    isLocalTime
  };
}

function getChampionsLeagueFallbackEvents() {
  return [];
}

function getEuropaLeagueFallbackEvents() {
  return [];
}

function getConferenceLeagueFallbackEvents() {
  return [];
}

function getCupFallbackEvents() {
  const knownEvents = [
    makeFallbackEvent({
      idEvent: "uaf-cup-fallback-2026-04-21-bukovyna-dynamo",
      dateEvent: "2026-04-21",
      strTime: "18:00:00",
      strStatus: "Scheduled",
      strHomeTeam: "Буковина Чернівці",
      strAwayTeam: "Динамо Київ",
      intRound: 150,
      isLocalTime: true
    }),
    makeFallbackEvent({
      idEvent: "uaf-cup-fallback-2026-04-22-metalist1925-chernihiv",
      dateEvent: "2026-04-22",
      strTime: "18:00:00",
      strStatus: "Scheduled",
      strHomeTeam: "Металіст 1925 Харків",
      strAwayTeam: "Чернігів",
      intRound: 150,
      isLocalTime: true
    })
  ];

  return knownEvents.filter(event => isDateWithinWindow(event.dateEvent));
}

function decodeHtmlText(text) {
  return String(text || "")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/"|"|&#x22;/gi, "\"")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&amp;/gi, "&") // Подвійне декодування для надійності
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
  const minDateIso = shiftIsoDate(todayIso, -30);
  const maxDateIso = shiftIsoDate(todayIso, 60);

  return { minDateIso, maxDateIso };
}

function isDateWithinWindow(dateString) {
  const { minDateIso, maxDateIso } = getDateWindow();
  return dateString >= minDateIso && dateString <= maxDateIso;
}

function filterMatchesWithinWindow(matches) {
  return Object.fromEntries(
    Object.entries(matches || {}).map(([sectionName, items]) => [
      sectionName,
      Array.isArray(items)
        ? items.filter(item => !item?.dateIso || isDateWithinWindow(item.dateIso))
        : []
    ])
  );
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

      // Fallback:
      // On some UPL calendar cards the “resualt” block doesn’t contain time (leaves it as 00:00:00),
      // while kickoff time is still present elsewhere inside cardHtml.
      if (strStatus === "Scheduled" && strTime === "00:00:00") {
        const cardText = cleanExtractedText(cardHtml);
        const timeMatch = cardText.match(/\b\d{1,2}:\d{2}\b/);
        if (timeMatch) {
          strTime = `${timeMatch[0]}:00`;
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

function parseFlashscoreUplSummaryResults(summaryData) {
  const summary = String(summaryData || "");
  const events = [];

  // summary-results format: AD÷<unix> ... CX÷<home> ... AF÷<away>
  const matchRe = /AD÷(\d{10})[\s\S]*?CX÷([^¬]+)[\s\S]*?AF÷([^¬]+)/g;

  let m;
  while ((m = matchRe.exec(summary)) !== null) {
    const unix = m[1];
    const homeRaw = m[2];
    const awayRaw = m[3];

    const kickoff = new Date(Number(unix) * 1000);
    if (Number.isNaN(kickoff.getTime())) {
      continue;
    }

    const dateEvent = formatDateToIsoInTimeZone(kickoff, "Europe/Kyiv");
    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const homeTeam = getUplTeamName(cleanExtractedText(homeRaw));
    const awayTeam = getUplTeamName(cleanExtractedText(awayRaw));

    if (!homeTeam || !awayTeam) {
      continue;
    }

    const strTime = kickoff.toLocaleTimeString("uk-UA", {
      timeZone: "Europe/Kyiv",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    events.push({
      idEvent: `flashscore-upl-summary-${dateEvent}-${homeTeam}-${awayTeam}-${unix}`.replace(/\s+/g, "-"),
      dateEvent,
      strTime,
      strStatus: "Scheduled",
      strHomeTeam: homeTeam,
      strAwayTeam: awayTeam,
      intHomeScore: null,
      intAwayScore: null,
      isLocalTime: true
    });
  }

  return dedupeEvents(events).sort(sortByDateTimeAsc);
}

function parseFlashscoreUplFixturesFromHtml(html) {
  // Flashscore fixtures page for UPL encodes kickoff in initialFeeds blocks:
  // ~AAГ· ... AOГ·<unix> ... CXГ·<home> ... AFГ·<away>
  const text = htmlToPlainText(html)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const events = [];
  const blocks = text.split("~AAГ·").slice(1);

  for (const block of blocks) {
    const aoMatch = block.match(/(?:^|В¬)AOГ·(\d{10})/);
    const homeMatch = block.match(/(?:^|В¬)CXГ·([^В¬]+)/);
    const awayMatch = block.match(/(?:^|В¬)AFГ·([^В¬]+)/);

    if (!aoMatch || !homeMatch || !awayMatch) {
      continue;
    }

    const kickoff = new Date(Number(aoMatch[1]) * 1000);
    if (Number.isNaN(kickoff.getTime())) {
      continue;
    }

    const dateEvent = formatDateToIsoInTimeZone(kickoff, "Europe/Kyiv");
    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const homeTeam = getUplTeamName(cleanExtractedText(homeMatch[1]));
    const awayTeam = getUplTeamName(cleanExtractedText(awayMatch[1]));

    if (!homeTeam || !awayTeam) {
      continue;
    }

    const strTime = kickoff.toLocaleTimeString("uk-UA", {
      timeZone: "Europe/Kyiv",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    events.push({
      idEvent: `flashscore-upl-fixture-${dateEvent}-${homeTeam}-${awayTeam}-${aoMatch[1]}`.replace(/\s+/g, "-"),
      dateEvent,
      strTime,
      strStatus: "Scheduled",
      strHomeTeam: homeTeam,
      strAwayTeam: awayTeam,
      intHomeScore: null,
      intAwayScore: null,
      isLocalTime: true
    });
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

  const isNoiseText = value =>
    /Flashscore\.ua|Live результати|УПЛ 2026|Ліга чемпіонів|Ліга Європи|Ліга конференцій|більше спорту|Правила користування|Політика конфіденційності|Copyright|Gambling Therapy|Встановити конфіденційність|18\+|Показати більше/i.test(value);

  const getQualityScore = value => {
    const normalized = cleanExtractedText(value);
    const lengthScore = normalized.length;
    const wordScore = normalized.split(/\s+/).filter(Boolean).length * 8;
    const cyrillicScore = /[А-Яа-яІіЇїЄєҐґ]/.test(normalized) ? 15 : 0;
    return lengthScore + wordScore + cyrillicScore;
  };

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
      if (isNoiseText(fragment)) {
        continue;
      }

      const timeMatch = fragment.match(/\b(\d{1,2}:\d{2})\b/);
      const timePart = timeMatch?.[1];
      const timeForEvent = timePart ? `${timePart}:00` : "00:00:00";

      const fragmentWithoutTime = fragment.replace(/\b\d{1,2}:\d{2}\b/g, "").trim();

      const match = fragmentWithoutTime.match(/^(.+?)\s*-\s*(.+)$/);
      if (!match) {
        continue;
      }

      const homeTeam = cleanExtractedText(match[1]);
      const awayTeam = cleanExtractedText(match[2]);

      if (!homeTeam || !awayTeam || isNoiseText(homeTeam) || isNoiseText(awayTeam)) {
        continue;
      }

      events.push({
        idEvent: `flashscore-${dateEvent}-${homeTeam}-${awayTeam}`,
        dateEvent,
        strTime: timeForEvent,
        strStatus: "Scheduled",
        strHomeTeam: homeTeam,
        strAwayTeam: awayTeam,
        intHomeScore: null,
        intAwayScore: null,
        isLocalTime: true,
        __quality: getQualityScore(homeTeam) + getQualityScore(awayTeam)
      });
    }
  }

  const deduped = dedupeEvents(events)
    .sort((a, b) => (b.__quality || 0) - (a.__quality || 0) || sortByDateTimeAsc(a, b))
    .map(({ __quality, ...event }) => event);

  return deduped;
}

function parseFlashscoreDrawPageEvents(html) {
  const text = htmlToPlainText(html).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const events = [];
  const matches = [...text.matchAll(/(\d{2})\.(\d{2})\.\s+\[([^\]]+)\]\(\/match\/soccer\/[^)]+\),\s+\[([^\]]+)\]\(\/match\/soccer\/[^)]+\)/g)];

  const isNoiseText = value =>
    /Flashscore\.ua|Live результати|УПЛ 2026|Ліга чемпіонів|Ліга Європи|Ліга конференцій|більше спорту|Правила користування|Політика конфіденційності|Copyright|Gambling Therapy|Встановити конфіденційність|18\+|Показати більше/i.test(value);

  for (const match of matches) {
    const [, day, month, homeRaw, awayRaw] = match;
    const dateEvent = `${getKyivTodayIso().slice(0, 4)}-${month}-${day}`;

    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const homeTeam = cleanExtractedText(homeRaw);
    const awayTeam = cleanExtractedText(awayRaw);

    if (!homeTeam || !awayTeam || isNoiseText(homeTeam) || isNoiseText(awayTeam)) {
      continue;
    }

    events.push({
      idEvent: `flashscore-draw-${dateEvent}-${homeTeam}-${awayTeam}`.replace(/\s+/g, "-"),
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

  return dedupeEvents(events).sort(sortByDateTimeAsc);
}


function parseWorldCupGroupStandingsFromHtml(html) {
  const tableMatch = String(html || "").match(/<table[^>]+class="[^"]*standings[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    return [];
  }
  const tableHtml = tableMatch[1];
  const rowPattern = /<tr[\s\S]*?<\/tr>/gi;
  const rows = [];

  for (const rowHtml of tableHtml.matchAll(rowPattern)) {
    const rowText = String(rowHtml[0]);
    if (rowText.includes("<th") || rowText.includes("thead")) continue; // Пропускаємо заголовок

    const tdMatches = [...rowText.matchAll(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi)];
    // Таблиці можуть мати від 8 до 12 колонок залежно від джерела
    if (tdMatches.length < 8) {
      continue;
    }

    const cellTexts = tdMatches.map(m => {
      const text = htmlToPlainText(m[1]).replace(/\s+/g, " ").trim();
      // Видаляємо все, крім цифр та мінуса для числових значень
      return text;
    });

    const getInt = (idx) => {
      if (idx >= cellTexts.length) return 0;
      const val = parseInt(cellTexts[idx].replace(/[^\d-]/g, ''));
      return isNaN(val) ? 0 : val;
    };

    const position = getInt(0);
    const teamName = getWorldCupTeamName(cellTexts[1]);
    const played = getInt(2);
    const wins = getInt(3);
    const draws = getInt(4);
    const losses = getInt(5);
    const goalsFor = getInt(6);
    const goalsAgainst = getInt(7);
    const goalDifference = getInt(8);
    const points = getInt(9) || getInt(tdMatches.length - 1); // Останній стовпчик зазвичай очки

    if (!teamName) {
      continue;
    }

    const numericValues = [position, played, wins, draws, losses, goalsFor, goalsAgainst, goalDifference, points];
    if (numericValues.some(v => !Number.isFinite(v))) {
      continue;
    }

    rows.push({
      position,
      teamName,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points
    });
  }

  return rows.sort((a, b) => a.position - b.position);
}

function isValidStandings(standings) {
  if (!standings || Object.keys(standings).length === 0) return true;
  // Вважаємо таблицю валідною, якщо розпарсено хоча б одну команду
  return Object.values(standings).flat().length > 0;
}

async function fetchWorldCup2026GroupStandings() {
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  const result = {};

  for (const letter of letters) {
    const url = `https://worldcupstats.football/groups/${letter}/`;
    const html = await fetchText(url, `WC 2026 group ${letter} standings fetch error`);

    if (!html) {
      result[letter.toUpperCase()] = [];
      continue;
    }

    result[letter.toUpperCase()] = parseWorldCupGroupStandingsFromHtml(html);
  }

  return result;
}

function parseCupUafEvents(html) {
  const text = htmlToPlainText(html)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const calendarSection = text.split("Календар матчів")[1]?.split("Новини")[0] || text;
  const events = [];

  const matchPattern = /(\d{2}\.\d{2}\.\d{4})\s+(.+?)(?=\s+\d{2}\.\d{2}\.\d{4}\s+|$)/g;
  const timePattern = /(\d{2}:\d{2})/;
  const scorePattern = /\b(\d+)\s*[:\-]\s*(\d+)\b/;

  for (const match of calendarSection.matchAll(matchPattern)) {
    const [, dateText, blockText] = match;
    const dateEvent = parseDotDmyToIso(dateText);

    if (!isDateWithinWindow(dateEvent)) {
      continue;
    }

    const normalizedBlock = cleanExtractedText(blockText);
    const teamsMatch = normalizedBlock.match(/^(.+?)\s*-\s*(.+?)(?:\s+\d{2}:\d{2}|\s+\d+\s*[:\-]\s*\d+|$)/);

    if (!teamsMatch) {
      continue;
    }

    const homeTeam = getUplTeamName(cleanExtractedText(teamsMatch[1]));
    const awayTeam = getUplTeamName(cleanExtractedText(teamsMatch[2]));

    if (!homeTeam || !awayTeam) {
      continue;
    }

    const timeMatch = normalizedBlock.match(timePattern);
    const scoreMatch = normalizedBlock.match(scorePattern);

    let strTime = "00:00:00";
    let strStatus = "Scheduled";
    let intHomeScore = null;
    let intAwayScore = null;

    if (scoreMatch) {
      intHomeScore = Number(scoreMatch[1]);
      intAwayScore = Number(scoreMatch[2]);
      strStatus = "Match Finished";
    } else if (timeMatch) {
      strTime = `${timeMatch[1]}:00`;
    }

    events.push({
      idEvent: `uaf-cup-${dateEvent}-${homeTeam}-${awayTeam}`.replace(/\s+/g, "-"),
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

  const parsedEvents = dedupeEvents(events).sort(sortByDateTimeAsc);

  if (parsedEvents.length > 0) {
    return mergeEventMetadata(parsedEvents, getCupFallbackEvents());
  }

  return getCupFallbackEvents();
}

async function fetchCupEvents() {
  const cupUrl = "https://kubok.uaf.ua/";
  const flashscoreResultsUrl = "https://www.flashscore.ua/soccer/ukraine/ukrainian-cup/results/";
  const flashscoreFixturesUrl = "https://www.flashscore.ua/soccer/ukraine/ukrainian-cup/fixtures/";

  const [cupHtml, flashscoreResultsHtml, flashscoreFixturesHtml] = await Promise.all([
    fetchText(cupUrl, "Кубок України fetch error"),
    fetchText(flashscoreResultsUrl, "Кубок України Flashscore results fetch error"),
    fetchText(flashscoreFixturesUrl, "Кубок України Flashscore fixtures fetch error")
  ]);

  const cupEvents = cupHtml ? parseCupUafEvents(cupHtml) : [];
  const flashscoreEvents = dedupeEvents([
    ...(flashscoreResultsHtml ? parseFlashscoreCupFeedData((flashscoreResultsHtml.match(/cjs\.initialFeeds\['results'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i) || [])[1] || "") : []),
    ...(flashscoreFixturesHtml ? parseFlashscoreCupFeedData((flashscoreFixturesHtml.match(/cjs\.initialFeeds\['fixtures'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i) || [])[1] || "") : [])
  ]).sort(sortByDateTimeAsc);

  const mergedEvents = cupEvents.length > 0 ? mergeCupEvents(cupEvents, flashscoreEvents) : flashscoreEvents;

  if (mergedEvents.length > 0) {
    if (flashscoreEvents.some(event => event.strStatus === "Match Finished")) {
      console.log(`✅ Кубок України fetched with Flashscore results merge: ${mergedEvents.length} matches in ±7 days window`);
    } else if (cupEvents.some(event => event.idEvent.startsWith("uaf-cup-fallback-"))) {
      console.log(`⚠️ Кубок України source incomplete, using fallback schedule: ${mergedEvents.length} matches in ±7 days window`);
    } else {
      console.log(`✅ Кубок України fetched: ${mergedEvents.length} matches in ±7 days window`);
    }
    return mergedEvents;
  }

  const fallbackEvents = getCupFallbackEvents();
  if (fallbackEvents.length > 0) {
    console.log(`⚠️ Кубок України source unavailable, using fallback schedule: ${fallbackEvents.length} matches in ±7 days window`);
    return fallbackEvents;
  }

  console.log("⚠️ Кубок України source empty, keeping existing");
  return null;
}

const uplStandingsTeamNames = {
  "Shakhtar": "Шахтар Донецьк",
  "Shakhtar Donetsk": "Шахтар Донецьк",
  "LNZ": "ЛНЗ Черкаси",
  "LNZ Cherkasy": "ЛНЗ Черкаси",
  "Polissya": "Полісся Житомир",
  "Polissya Zhytomyr": "Полісся Житомир",
  "Metalist 1925": "Металіст 1925 Харків",
  "Metalist 1925 Kharkiv": "Металіст 1925 Харків",
  "Dynamo": "Динамо Київ",
  "Dynamo Kyiv": "Динамо Київ",
  "Kryvbas": "Кривбас",
  "Kryvbas Kryvyi Rih": "Кривбас",
  "Kolos": "Колос Ковалівка",
  "Kolos Kovalivka": "Колос Ковалівка",
  "Karpaty": "Карпати Львів",
  "Karpaty Lviv": "Карпати Львів",
  "Zorya": "Зоря Луганськ",
  "Zorya Luhansk": "Зоря Луганськ",
  "Veres": "Верес Рівне",
  "Veres Rivne": "Верес Рівне",
  "Epicentr": "Епіцентр Кам'янець-Подільський",
  "Epitsentr": "Епіцентр Кам'янець-Подільський",
  "Obolon": "Оболонь Київ",
  "Obolon Kyiv": "Оболонь Київ",
  "Kudrivka": "Кудрівка",
  "Ruh": "Рух Львів",
  "Ruh Lviv": "Рух Львів",
  "Olexandriya": "Олександрія",
  "Oleksandriya": "Олександрія",
  "Poltava": "Полтава"
};

function normalizeUplStandingsTeamName(name) {
  return uplStandingsTeamNames[name] || getUplTeamName(name);
}

function formatUplStandingsTeamName(name) {
  const normalized = decodeHtmlText(name)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^«+/, "")
    .replace(/»+$/, "")
    .replace(/^"+/, "")
    .replace(/"+$/, "");

  const cleaned = normalized.replace(/»/g, "").trim();

  if (cleaned === "Епіцентр Кам'янець-Подільський") {
    return "Епіцентр";
  }

  const duplicateMatch = cleaned.match(/^(.+?)\s+\1$/i);
  if (duplicateMatch) {
    return duplicateMatch[1];
  }

  return cleaned;
}

function shouldDropCitySuffix() {
  return false;
}

function fetchUplStandingsFromOfficialPage(html) {
  const tableMatch = html.match(/<table class="table table-gray table-num">([\s\S]*?)<\/table>/i);

  if (!tableMatch) {
    return [];
  }

  const tableHtml = tableMatch[1];
  const rowPattern = /<tr\b[\s\S]*?<\/tr>/gi;
  const rows = [];

  for (const rowHtml of tableHtml.matchAll(rowPattern)) {
    const rowHtmlText = rowHtml[0];
    const cellValues = [...rowHtmlText.matchAll(/<td>([\s\S]*?)<\/td>/gi)]
      .map(match => cleanExtractedText(match[1]))
      .filter(value => value !== "");

    if (cellValues.length < 10) {
      continue;
    }

    const position = Number(cellValues[0]);
    const teamCellMatch = rowHtmlText.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    const logoMatch = rowHtmlText.match(/<img[^>]+src="([^"]+)"/i);
    const played = Number(cellValues[2]);
    const wins = Number(cellValues[3]);
    const draws = Number(cellValues[4]);
    const losses = Number(cellValues[5]);
    const goalsFor = Number(cellValues[6]);
    const goalsAgainst = Number(cellValues[7]);
    const goalDifference = Number(cellValues[8]);
    const points = Number(cellValues[9]);

    if (
      !Number.isFinite(position) ||
      [played, wins, draws, losses, goalsFor, goalsAgainst, goalDifference, points].some(value => !Number.isFinite(value))
    ) {
      continue;
    }

    const cleanedTeamText = formatUplStandingsTeamName(teamCellMatch?.[1] || cellValues[1]);
    const displayTeamName = normalizeUplStandingsTeamName(cleanedTeamText);

    rows.push({
      position,
      team: displayTeamName,
      emblem: logoMatch ? `https://upl.ua${logoMatch[1]}` : "",
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points
    });
  }

  return rows;
}

async function fetchUplStandings() {
  const standingsUrl = "https://upl.ua/ua/tournaments/championship/428/table";
  const standingsHtml = await fetchText(standingsUrl, "УПЛ standings fetch error");

  if (!standingsHtml) {
    console.log("⚠️ УПЛ standings source empty, keeping existing");
    return null;
  }

  const parsedRows = fetchUplStandingsFromOfficialPage(standingsHtml);

  if (parsedRows.length > 0) {
    console.log(`✅ УПЛ standings fetched: ${parsedRows.length} rows`);
    return parsedRows;
  }

  console.log("⚠️ УПЛ standings source empty, keeping existing");
  return null;
}

async function fetchUplEvents() {
  const officialUrl = "https://upl.ua/ua/tournaments/championship/428/calendar";
  const officialHtml = await fetchText(officialUrl, "УПЛ official upl.ua fetch error");

  const flashscoreFixturesUrl = "https://www.flashscore.ua/soccer/ukraine/premier-league/fixtures/";
  const flashscoreResultsUrl = "https://www.flashscore.ua/soccer/ukraine/premier-league/results/";

  const tntUrl = "https://www.tntsports.co.uk/football/ukrainian-premier-league/2025-2026/calendar-results.shtml";

  const [flashscoreFixturesHtml, flashscoreResultsHtml, tntHtml] = await Promise.all([
    fetchText(flashscoreFixturesUrl, "УПЛ Flashscore fixtures fetch error"),
    fetchText(flashscoreResultsUrl, "УПЛ Flashscore results fetch error"),
    fetchText(tntUrl, "УПЛ TNT Sports fetch error")
  ]);

  const officialEvents = officialHtml ? parseOfficialUplEvents(officialHtml) : [];

  // Flashscore fixtures page: visible HTML може не містити kickoff часу,
  // але всередині initialFeeds["summary-results"] час є (AD÷<unix>).
  let flashscoreSummaryEvents = [];
  let flashscoreSummaryFixturesEvents = [];

  if (flashscoreFixturesHtml) {
    const summaryData =
      flashscoreFixturesHtml.match(/cjs\.initialFeeds\["summary-results"\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] ||
      "";
    if (summaryData) {
      flashscoreSummaryEvents = parseFlashscoreUplSummaryResults(summaryData);
    }
  }

  // Correct kickoff time for upcoming UPL matches is usually in results page under summary-fixtures.
  if (flashscoreResultsHtml) {
    const summaryFixturesData =
      flashscoreResultsHtml.match(/cjs\.initialFeeds\["summary-fixtures"\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] ||
      "";
    if (summaryFixturesData) {
      flashscoreSummaryFixturesEvents = parseFlashscoreUplSummaryResults(summaryFixturesData);
    }
  }

  const flashscoreFixturesEvents = flashscoreFixturesHtml ? parseFlashscoreUplFixturesFromHtml(flashscoreFixturesHtml) : [];

  // Flashscore results are parsed via the generic feed parser (same as cups/champions league feeds).
  let flashscoreResultsEvents = [];
  if (flashscoreResultsHtml) {
    const resultsData =
      flashscoreResultsHtml.match(/cjs\.initialFeeds\['results'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] || "";

    if (resultsData) {
      flashscoreResultsEvents = parseFlashscoreCupFeedData(resultsData);
    }
  }

  const tntEvents = tntHtml ? parseTntUplEvents(tntHtml) : [];

  // Prefer official calendar, but overlay finished scores from Flashscore results.
  if (officialEvents.length > 0) {
    if (flashscoreResultsEvents.length > 0) {
      console.log(`✅ РЈРџР› official + Flashscore results merged: ${officialEvents.length} matches in В±7 days window`);
      return mergeCupEvents(officialEvents, flashscoreResultsEvents);
    }

    console.log(`вњ… РЈРџР› fetched from official upl.ua: ${officialEvents.length} matches in В±7 days window`);
    return officialEvents;
  }

  // If no official, prefer Flashscore results (they include scores), otherwise fixtures, otherwise TNT.
  if (flashscoreResultsEvents.length > 0) {
    console.log(`✅ РЈРџР› fetched from Flashscore results: ${flashscoreResultsEvents.length} matches in В±7 days window`);
    return flashscoreResultsEvents;
  }

  // If no official, prefer Flashscore “summary-results” (usually has kickoff time),
  // otherwise fallback to legacy fixtures parser (may produce 00:00:00).
  // Prefer Flashscore вЂњsummary-fixturesвЂќ (usually has correct kickoff),
  // then fallback to вЂњsummary-resultsвЂќ.
  if (flashscoreSummaryFixturesEvents.length > 0) {
    console.log(`вњ… РЈРџР› summary-fixtures parsed: ${flashscoreSummaryFixturesEvents.length} matches in В±7 days window`);
    return flashscoreSummaryFixturesEvents;
  }

  if (flashscoreSummaryEvents.length > 0) {
    console.log(`вњ… РЈРџР› summary-results parsed: ${flashscoreSummaryEvents.length} matches in В±7 days window`);
    return flashscoreSummaryEvents;
  }

  if (flashscoreFixturesEvents.length > 0) {
    console.log(`Р Р†РЎв„ўР’В Р С—РЎвЂР РЏ Р В Р в‚¬Р В РЎСџР В РІР‚С” official source empty, fallback to Flashscore fixtures: ${flashscoreFixturesEvents.length} matches in Р вЂ™Р’В±7 days window`);

    // Flashscore fixtures HTML often lacks kickoff time -> parser keeps "00:00:00".
    // Overlay kickoff time from TheSportsDB for those matches.
    const needsOverlay = flashscoreFixturesEvents.some(e => String(e?.strTime || "").startsWith("00:00"));
    if (needsOverlay) {
      const sportsDbEvents = await fetchLeagueEvents(4354, "Р Р€Р СџР вЂє");
      if (Array.isArray(sportsDbEvents) && sportsDbEvents.length > 0) {
        const getHomeNorm = e => getUplTeamName(String(e?.strHomeTeam || ""));
        const getAwayNorm = e => getUplTeamName(String(e?.strAwayTeam || ""));
        const keyOf = e =>
          `${String(e?.dateEvent || "")}|${getHomeNorm(e)}|${getAwayNorm(e)}`;

        const byKey = new Map();
        sportsDbEvents.forEach(se => {
          if (!se?.dateEvent || !se?.strHomeTeam || !se?.strAwayTeam) return;
          byKey.set(keyOf(se), se);
        });

        for (const fe of flashscoreFixturesEvents) {
          if (!String(fe?.strTime || "").startsWith("00:00")) continue;

          const repl = byKey.get(
            `${String(fe?.dateEvent || "")}|${getUplTeamName(String(fe?.strHomeTeam || ""))}|${getUplTeamName(String(fe?.strAwayTeam || ""))}`
          );

          if (!repl?.strTime) continue;

          // formatTime() uses isLocalTime -> strTimeLocal/strTime substring(0,5)
          fe.strTime = repl.strTime;
          fe.strTimeLocal = repl.strTime;
          fe.isLocalTime = true;
        }
      }
    }

    return flashscoreFixturesEvents;
  }

  if (tntEvents.length > 0) {
    console.log(`вљ пёЏ РЈРџР› official source empty, fallback to TNT Sports: ${tntEvents.length} matches in В±7 days window`);
    return tntEvents;
  }

  console.log("вљ пёЏ UPL web sources returned no matches, falling back to TheSportsDB");
  return fetchLeagueEvents(4354, "РЈРџР›");
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
  const urlsToTry = [
    "https://www.flashscore.ua/soccer/europe/champions-league/fixtures/",
    "https://www.flashscore.ua/soccer/europe/champions-league/results/"
  ];

  for (const url of urlsToTry) {
    const html = await fetchText(url, "Ліга чемпіонів Flashscore fetch error");

    if (!html) {
      continue;
    }

    const feedDataMatches = [
      ...(html.match(/cjs\.initialFeeds\['results'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] ? [html.match(/cjs\.initialFeeds\['results'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)[1]] : []),
      ...(html.match(/cjs\.initialFeeds\['fixtures'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] ? [html.match(/cjs\.initialFeeds\['fixtures'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)[1]] : [])
    ];

    const events = dedupeEvents(feedDataMatches.flatMap(data => parseFlashscoreCupFeedData(data)))
      .filter(event => isDateWithinWindow(event.dateEvent))
      .sort(sortByDateTimeAsc)
      .filter(event => event.strHomeTeam && event.strAwayTeam && !/Показати більше|Live результати|Flashscore\.ua/i.test(`${event.strHomeTeam} ${event.strAwayTeam}`));

    if (events.length > 0) {
      console.log(`✅ Ліга чемпіонів fetched from Flashscore: ${events.length} matches in ±7 days window`);
      return events;
    }
  }

  console.log("⚠️ Ліга чемпіонів Flashscore source empty, falling back to TheSportsDB");
  const apiEvents = await fetchLeagueEvents(4480, "Ліга чемпіонів");

  if (apiEvents && apiEvents.length > 0) {
    return apiEvents;
  }

  console.log("⚠️ Ліга чемпіонів source empty, keeping existing");
  return null;
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

    const feedDataMatches = [
      ...(html.match(/cjs\.initialFeeds\['results'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] ? [html.match(/cjs\.initialFeeds\['results'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)[1]] : []),
      ...(html.match(/cjs\.initialFeeds\['fixtures'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)?.[1] ? [html.match(/cjs\.initialFeeds\['fixtures'\]\s*=\s*\{\s*data:\s*`([\s\S]*?)`/i)[1]] : [])
    ];

    const feedEvents = feedDataMatches.flatMap(data => parseFlashscoreCupFeedData(data));
    const textEvents = parseFlashscoreFixtureEvents(html);
    const drawPageEvents = parseFlashscoreDrawPageEvents(html);

    const events = dedupeEvents([...feedEvents, ...textEvents, ...drawPageEvents]).sort(sortByDateTimeAsc);

    if (events.length > 0) {
      console.log(`✅ ${label}: found ${events.length} matches from Flashscore`);
      return events;
    }
  }

  return [];
}

async function fetchExtraMatches() {
  const clubMatches = [];
  const nationalMatches = [];
  const leagueMatches = {};

  for (const config of extraCompetitionConfigs) {
    const flashscoreRelevantEvents = [];
    const flashscoreUrls = Array.isArray(config.flashscoreUrls) ? config.flashscoreUrls : [];
    const shouldUseAllEvents = config.type === "club" && (config.name === "Ліга чемпіонів" || config.name === "Ліга Європи" || config.name === "Ліга конференцій" || config.name === "Суперкубок УЄФА");
    const shouldShowAllTeamsFromQuarterfinal = event =>
      shouldUseAllEvents &&
      Number(event?.intRound) >= 125;

    for (const url of flashscoreUrls) {
      const flashscoreEvents = await fetchFlashscoreCompetitionEvents(url, config.name);
      const relevantEvents = flashscoreEvents.filter(event =>
        shouldShowAllTeamsFromQuarterfinal(event) || isExtraCompetitionMatch(event, config.type)
      );

      if (relevantEvents.length) {
        flashscoreRelevantEvents.push(...relevantEvents);
      }
    }

    const apiEvents = await fetchCompetitionEvents(config.id, config.name);
    const apiRelevantEvents = apiEvents.filter(event =>
      shouldShowAllTeamsFromQuarterfinal(event) || isExtraCompetitionMatch(event, config.type)
    );

    const mergedRelevantEvents = [
      ...flashscoreRelevantEvents,
      ...apiRelevantEvents
    ]
      .filter(event => isDateWithinWindow(event.dateEvent))
      .filter(event => !(config.type === "club" && String(event.strTime || "").startsWith("00:00")))
      .sort((a, b) => sortByDateTimeAsc(a, b));

    const fallbackRelevantEvents =
      config.name === "Ліга Європи"
        ? getEuropaLeagueFallbackEvents()
        : config.name === "Ліга конференцій"
          ? getConferenceLeagueFallbackEvents()
          : [];

    const chosenEvents = fallbackRelevantEvents.length > 0 ? fallbackRelevantEvents : mergedRelevantEvents;

    if (!chosenEvents.length) {
      continue;
    }

    console.log(`✅ ${config.name}: found ${chosenEvents.length} matches in ±7 days window`);

    const teamMapper = config.name === "Чемпіонат світу" ? getWorldCupTeamName : getUplTeamName;
    const mappedMatches = chosenEvents
      .map(event => mapEventToMatch(event, config.name, teamMapper))
      .filter(m => !isFlashscoreBrokenTeamName(m.home) && !isFlashscoreBrokenTeamName(m.away));

    leagueMatches[config.name] = mappedMatches;

    if (config.type === "club") {
      clubMatches.push(...mappedMatches);
    } else if (config.type === "national") {
      nationalMatches.push(...mappedMatches);
    }
  }

  return { clubMatches, nationalMatches, leagueMatches };
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

  const [uplEvents, uplStandings, clEvents, cupEvents, extraMatches, wcGroupStandings] = await Promise.all([
    fetchUplEvents(),
    fetchUplStandings(),
    fetchChampionsLeagueEvents(),
    fetchCupEvents(),
    fetchExtraMatches(),
    fetchWorldCup2026GroupStandings()
  ]);

  if (uplEvents) {
    matches["УПЛ"] = mergeCurrentAndPreviousMatches(
      uplEvents.map(event => mapEventToMatch(event, "УПЛ", getUplTeamName)),
      existingData["УПЛ"] || []
    );

    // When a match is rescheduled, sources may contain both the old and the updated date.
    // For the УПЛ section keep only the latest (actual) date per home+away pair.
    matches["УПЛ"] = dedupeMatchesByPairKeepLatestDate(matches["УПЛ"]);
  }

  if (uplStandings) {
    matches["Таблиця УПЛ"] = uplStandings;
  }

  if (clEvents) {
    matches["Ліга чемпіонів"] = mergeCurrentAndPreviousMatches(
      clEvents.map(event => mapEventToMatch(event, "Ліга чемпіонів")),
      existingData["Ліга чемпіонів"] || existingData["Champions League"] || []
    );
  }

  if (cupEvents) {
    matches["Кубок України"] = mergeCurrentAndPreviousMatches(
      cupEvents.map(event => mapEventToMatch(event, "Кубок України", getUplTeamName)),
      existingData["Кубок України"] || []
    );
  }

  // Оновлення Чемпіонату світу з фільтрацією не-футбольних команд
  const wcMatches = (extraMatches.leagueMatches?.["Чемпіонат світу"] || []).slice();
  if (wcMatches.length > 0) {
    matches["Чемпіонат світу"] = wcMatches;
  }
  if (Array.isArray(matches["Чемпіонат світу"])) {
    matches["Чемпіонат світу"] = matches["Чемпіонат світу"].filter(m =>
      !nonSoccerTeams.has(m.home) && !nonSoccerTeams.has(m.away)
    );
  }

  // Оновлюємо таблицю, якщо отримали хоча б список команд
  const wcStandings = isValidStandings(wcGroupStandings)
    ? wcGroupStandings
    : existingData["Таблиця ЧС 2026"];

  matches["Таблиця ЧС 2026"] = wcStandings || {};

  // Фінальна заміна часу на результат для розкладу
  Object.keys(matches).forEach(section => {
    if (Array.isArray(matches[section]) && !section.startsWith("Таблиця")) {
      matches[section].forEach(match => {
        // Якщо матч завершено і є рахунок — ставимо рахунок у поле time для відображення
        if (match.status === "Match Finished" && match.score) {
          match.time = match.score;
        }
      });
    }
  });

  matches["Ліга Європи"] = (extraMatches.leagueMatches?.["Ліга Європи"] || []).slice();

  matches["Ліга конференцій"] = (extraMatches.leagueMatches?.["Ліга конференцій"] || []).slice();

  matches["Суперкубок УЄФА"] = (extraMatches.leagueMatches?.["Суперкубок УЄФА"] || []).slice();

  matches["Українські клуби в Європі"] = mergeCurrentAndPreviousMatches(
    extraMatches.clubMatches,
    existingData["Українські клуби в Європі"] || []
  );

  matches["Збірна України"] = mergeCurrentAndPreviousMatches(
    extraMatches.nationalMatches,
    existingData["Збірна України"] || []
  );

  const dedupedMatches = dedupeScheduleSections(matches);
  const finalMatches = filterMatchesWithinWindow(dedupedMatches);
  finalMatches["Таблиця ЧС 2026"] = wcStandings || {};
  fs.writeFileSync("matches.json", JSON.stringify(finalMatches, null, 2));
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
