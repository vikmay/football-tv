const fs = require("fs");

const raw = JSON.parse(fs.readFileSync("raw.json", "utf8"));

const matches = {
  "Сьогодні": []
};

raw.response.forEach(m => {
  matches["Сьогодні"].push({
    home: m.teams.home.name,
    away: m.teams.away.name,
    league: m.league.name,
    time: new Date(m.fixture.date).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });
});

fs.writeFileSync("matches.json", JSON.stringify(matches, null, 2));

console.log("DONE: matches.json created");