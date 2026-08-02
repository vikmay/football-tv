const fs = require('fs');

const canonicalUkrainianTeamNames = {
  // Dynamo
  "dynamo kyiv": "Динамо Київ",
  "dynamo kiev": "Динамо Київ",
  "dynamo (k)": "Динамо Київ",
  "dynamo (к)": "Динамо Київ",
  "динамо к.": "Динамо Київ",
  "динамо київ": "Динамо Київ",
  "динамо (київ)": "Динамо Київ",
  "фк динамо київ": "Динамо Київ",

  // Shakhtar
  "shakhtar donetsk": "Шахтар Донецьк",
  "shakhtar": "Шахтар Донецьк",
  "шахтар д.": "Шахтар Донецьк",
  "шахтар донецьк": "Шахтар Донецьк",
  "фк шахтар": "Шахтар Донецьк",

  // Karpaty
  "karpaty lviv": "Карпати Львів",
  "karpaty": "Карпати Львів",
  "карпати л.": "Карпати Львів",
  "карпати львів": "Карпати Львів",
  "фк карпати": "Карпати Львів",

  // Chornomorets
  "chornomorets": "Чорноморець Одеса",
  "chornomorets odesa": "Чорноморець Одеса",
  "чорноморець одеса": "Чорноморець Одеса",
  "фк чорноморець": "Чорноморець Одеса",

  // Veres
  "veres rivne": "Верес Рівне",
  "veres": "Верес Рівне",
  "верес рівне": "Верес Рівне",
  "фк верес": "Верес Рівне",

  // Kharkiv / FC Kharkiv
  "fc kharkiv": "ФК Харків",
  "kharkiv": "ФК Харків",
  "харків": "ФК Харків",
  "фк харків": "ФК Харків",

  // Metalist
  "fc metalist kharkiv": "Металіст Харків",
  "metalist kharkiv": "Металіст Харків",
  "metalist": "Металіст Харків",
  "металіст харків": "Металіст Харків",

  // Metalist 1925
  "metalist 1925 kharkiv": "Металіст 1925 Харків",
  "metalist 1925": "Металіст 1925 Харків",
  "metalist 1925 (х)": "Металіст 1925 Харків",
  "металіст 1925 харків": "Металіст 1925 Харків",
  "металіст 1925": "Металіст 1925 Харків",

  // Kryvbas
  "kryvbas kr": "Кривбас",
  "kryvbas kryvyi rih": "Кривбас",
  "kryvbas": "Кривбас",
  "кривбас кр": "Кривбас",
  "кривбас кривий ріг": "Кривбас",
  "кривбас": "Кривбас",
  "фк кривбас": "Кривбас",

  // Kolos
  "kolos kovalivka": "Колос Ковалівка",
  "kolos": "Колос Ковалівка",
  "колос ковалівка": "Колос Ковалівка",
  "фк колос": "Колос Ковалівка",

  // Vorskla
  "vorskla poltava": "Ворскла Полтава",
  "vorskla": "Ворскла Полтава",
  "ворскла полтава": "Ворскла Полтава",
  "фк ворскла": "Ворскла Полтава",

  // Oleksandriya
  "oleksandriya": "Олександрія",
  "olexandriya": "Олександрія",
  "fc oleksandriya": "Олександрія",
  "олександрія": "Олександрія",
  "фк олександрія": "Олександрія",

  // Zorya
  "zorya luhansk": "Зоря Луганськ",
  "zorya": "Зоря Луганськ",
  "зоря луганськ": "Зоря Луганськ",
  "фк зоря": "Зоря Луганськ",

  // Rukh
  "rukh lviv": "Рух Львів",
  "ruh lviv": "Рух Львів",
  "ruh": "Рух Львів",
  "рух львів": "Рух Львів",
  "фк рух": "Рух Львів",

  // Obolon
  "obolon-brovar kyiv": "Оболонь Київ",
  "obolon kyiv": "Оболонь Київ",
  "obolon kiev": "Оболонь Київ",
  "obolon-brovar": "Оболонь Київ",
  "obolon": "Оболонь Київ",
  "оболонь київ": "Оболонь Київ",
  "фк оболонь": "Оболонь Київ",

  // LNZ
  "lnz cherkaasy": "ЛНЗ Черкаси",
  "lnz cherkasy": "ЛНЗ Черкаси",
  "lnz": "ЛНЗ Черкаси",
  "лнз черкаси": "ЛНЗ Черкаси",
  "фк лнз": "ЛНЗ Черкаси",

  // Epitsentr
  "epitsentr kamianets-podilsky": "Епіцентр",
  "epitsentr dunaivtsi": "Епіцентр",
  "epitsentr dunayivtsi": "Епіцентр",
  "fc epitsentr": "Епіцентр",
  "epicentr": "Епіцентр",
  "epitsentr": "Епіцентр",
  "епіцентр кам'янець-подільський": "Епіцентр",
  "епіцентр дунаївці": "Епіцентр",
  "епіцентр": "Епіцентр",
  "фк епіцентр": "Епіцентр",

  // Bukovyna
  "bukovyna chernevtsi": "Буковина Чернівці",
  "bukovyna": "Буковина Чернівці",
  "bukovyna (ч)": "Буковина Чернівці",
  "bukovina": "Буковина Чернівці",
  "bukovina (ch)": "Буковина Чернівці",
  "буковина чернівці": "Буковина Чернівці",
  "буковина (ч)": "Буковина Чернівці",
  "фк буковина": "Буковина Чернівці",

  // Chernihiv
  "chernihiv": "Чернігів",
  "chernihiv (ч)": "Чернігів",
  "чернігів (ч)": "Чернігів",
  "фк чернігів": "Чернігів",

  // Minai
  "minai": "Минай",
  "mynai": "Минай",
  "минай": "Минай",
  "мінай": "Минай",
  "фк минай": "Минай",

  // Polissya
  "polissya zhytomyr": "Полісся Житомир",
  "polissya": "Полісся Житомир",
  "полісся житомир": "Полісся Житомир",
  "полісся ж.": "Полісся Житомир",
  "фк полісся": "Полісся Житомир",

  // Inhulets
  "inhulets": "Інгулець",
  "інгулець петрове": "Інгулець",
  "фк інгулець": "Інгулець",

  // Kudrivka
  "kudrivka": "Кудрівка",
  "fc kudrivka": "Кудрівка",
  "кудрівка": "Кудрівка",
  "фк кудрівка": "Кудрівка",

  // Poltava
  "poltava": "СК Полтава",
  "sc poltava": "СК Полтава",
  "ск полтава": "СК Полтава",
  "фк полтава": "СК Полтава",

  // Livyi Bereh
  "livyi bereh": "Лівий Берег",
  "лівий берег": "Лівий Берег",
  "фк лівий берег": "Лівий Берег",

  // Agrobiznes
  "agrobiznes volochysk": "Агробізнес Волочиськ",
  "ahrobiznes volochysk": "Агробізнес Волочиськ",
  "agrobiznes": "Агробізнес Волочиськ",
  "ahrobiznes": "Агробізнес Волочиськ",
  "агробізнес волочиськ": "Агробізнес Волочиськ",

  // Nyva
  "nyva ternopil": "Нива Тернопіль",
  "нива тернопіль": "Нива Тернопіль",
  "нива т.": "Нива Тернопіль",

  "ukraine": "Україна",
  "україна": "Україна"
};

function cleanExtractedText(text) {
  return String(text || "").trim();
}

function transliterateLatinToCyrillic(text) {
  return text;
}

function getUplTeamName(englishName) {
  if (!englishName) return "";
  const raw = cleanExtractedText(String(englishName))
    .replace(/^[\s«"]+|[\s»"]+$/g, "")
    .trim();

  const lowerRaw = raw.toLowerCase();

  if (canonicalUkrainianTeamNames[lowerRaw]) {
    return canonicalUkrainianTeamNames[lowerRaw];
  }

  const stripped = raw.replace(/^(фк|fc|sc|ск)\s+/i, "").trim();
  const lowerStripped = stripped.toLowerCase();
  if (canonicalUkrainianTeamNames[lowerStripped]) {
    return canonicalUkrainianTeamNames[lowerStripped];
  }

  const hasForeignIndicator = /\((?:blr|cro|geo|rou|rus|kaz|cze|pol|lat|ltu|est|san|arm|aut|sui|den|nor|fin|sco|irl|eng|ger|fra|esp|ita|por|gre|cyp|srb|bih|mkd|kos|alb|mda|isl|ice|fai|gib|isr|aze|tur)\)/i.test(raw);

  const isDynamo = lowerRaw.includes("динамо") || lowerRaw.includes("dynamo") || lowerRaw.includes("dinamo");
  if (isDynamo) {
    const isKyiv = lowerRaw.includes("київ") || lowerRaw.includes("kyiv") || lowerRaw.includes("kiev") || lowerRaw.includes("(ukr)") || lowerRaw.includes("(укр)");
    const isForeignDynamo = hasForeignIndicator || lowerRaw.includes("мінськ") || lowerRaw.includes("minsk") || lowerRaw.includes("загреб") || lowerRaw.includes("zagreb") || lowerRaw.includes("тбілісі") || lowerRaw.includes("tbilisi") || lowerRaw.includes("батумі") || lowerRaw.includes("batumi") || lowerRaw.includes("брест") || lowerRaw.includes("brest") || lowerRaw.includes("москва") || lowerRaw.includes("moscow") || lowerRaw.includes("бухарест") || lowerRaw.includes("bucuresti") || /\b(м\.|б\.|з\.|тб\.)/i.test(raw);

    if (isKyiv) {
      return "Динамо Київ";
    }
    if (!isForeignDynamo && (lowerRaw === "динамо" || lowerRaw === "dynamo" || lowerRaw === "dinamo" || lowerStripped === "динамо" || lowerStripped === "dynamo" || lowerStripped === "dinamo")) {
      return "Динамо Київ";
    }
    return raw;
  }

  const isShakhtar = lowerRaw.includes("шахтар") || lowerRaw.includes("shakhtar") || lowerRaw.includes("shakhter");
  if (isShakhtar) {
    const isDonetsk = lowerRaw.includes("донецьк") || lowerRaw.includes("donetsk") || lowerRaw.includes("(ukr)");
    const isSoligorsk = hasForeignIndicator || lowerRaw.includes("солігорськ") || lowerRaw.includes("soligorsk") || lowerRaw.includes("salihorsk");
    if (isDonetsk) {
      return "Шахтар Донецьк";
    }
    if (!isSoligorsk && (lowerRaw === "шахтар" || lowerRaw === "shakhtar" || lowerStripped === "шахтар" || lowerStripped === "shakhtar")) {
      return "Шахтар Донецьк";
    }
    return raw;
  }

  if (lowerRaw.includes("карпати") || lowerRaw.includes("karpaty")) return "Карпати Львів";
  if (lowerRaw.includes("чорноморець") || lowerRaw.includes("chornomorets")) return "Чорноморець Одеса";
  if (lowerRaw.includes("верес") || lowerRaw.includes("veres")) return "Верес Рівне";

  if (lowerRaw.includes("1925")) return "Металіст 1925 Харків";
  if (lowerRaw.includes("харків") || lowerRaw.includes("kharkiv")) {
    if (lowerRaw.includes("металіст") || lowerRaw.includes("metalist")) {
      return "Металіст Харків";
    }
    return "ФК Харків";
  }

  if (lowerRaw.includes("кривбас") || lowerRaw.includes("kryvbas")) return "Кривбас";
  if (lowerRaw.includes("оболонь") || lowerRaw.includes("obolon")) return "Оболонь Київ";
  if (lowerRaw.includes("епіцентр") || lowerRaw.includes("epitsentr") || lowerRaw.includes("epicentr")) return "Епіцентр";
  if (lowerRaw.includes("полісся") || lowerRaw.includes("polissya")) return "Полісся Житомир";
  if (lowerRaw.includes("колос") || lowerRaw.includes("kolos")) return "Колос Ковалівка";
  if (lowerRaw.includes("ворскла") || lowerRaw.includes("vorskla")) return "Ворскла Полтава";

  const isZorya = lowerRaw.includes("зоря") || lowerRaw.includes("zorya") || lowerRaw.includes("zaria");
  if (isZorya) {
    if (!hasForeignIndicator && !lowerRaw.includes("бєльці") && !lowerRaw.includes("balti")) {
      return "Зоря Луганськ";
    }
    return raw;
  }

  if (lowerRaw.includes("рух") || lowerRaw.includes("ruh")) return "Рух Львів";
  if (lowerRaw.includes("лнз") || lowerRaw.includes("lnz")) return "ЛНЗ Черкаси";
  if (lowerRaw.includes("олександрія") || lowerRaw.includes("oleksandriya") || lowerRaw.includes("olexandriya")) return "Олександрія";
  if (lowerRaw.includes("буковина") || lowerRaw.includes("bukovyna") || lowerRaw.includes("bukovina")) return "Буковина Чернівці";
  if (lowerRaw.includes("кудрівка") || lowerRaw.includes("kudrivka")) return "Кудрівка";
  if (lowerRaw.includes("полтава") || lowerRaw.includes("poltava")) return "СК Полтава";
  if (lowerRaw.includes("чернігів") || lowerRaw.includes("chernihiv")) return "Чернігів";
  if (lowerRaw.includes("інгулець") || lowerRaw.includes("inhulets")) return "Інгулець";
  if (lowerRaw.includes("лівий берег") || lowerRaw.includes("livyi bereh")) return "Лівий Берег";
  if (lowerRaw.includes("минай") || lowerRaw.includes("мінай") || lowerRaw.includes("minai") || lowerRaw.includes("mynai")) return "Минай";

  const isNyva = lowerRaw.includes("нива") || lowerRaw.includes("nyva");
  if (isNyva) {
    if (!lowerRaw.includes("вінниця") && !lowerRaw.includes("vinnytsia")) {
      return "Нива Тернопіль";
    }
    return raw;
  }

  if (lowerRaw.includes("агробізнес") || lowerRaw.includes("agrobiznes") || lowerRaw.includes("ahrobiznes")) return "Агробізнес Волочиськ";

  return raw;
}

const testCases = [
  "Динамо Київ",
  "Dynamo Kyiv",
  "Динамо К.",
  "Динамо М. (Blr)",
  "Динамо Загреб (Cro)",
  "Dinamo Zagreb",
  "Динамо Тбілісі (Geo)",
  "Динамо Батумі (Geo)",
  "Ауда (Lat)",
  "Жальгіріс Каунас (Ltu)",
  "Шахтар Донецьк",
  "Шахтар Солігорськ (Blr)",
  "Зоря Луганськ",
  "Зоря Бєльці (Mda)"
];

console.log("=== TESTING getUplTeamName RESULTS ===");
testCases.forEach(tc => {
  console.log(`'${tc}' -> '${getUplTeamName(tc)}'`);
});
