const fs = require("fs");

const filePath = process.argv[2] || "word-bank.json";
const categories = ["object", "place", "figure", "action", "abstract"];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function loadJson(p) {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

const data = loadJson(filePath);

for (const key of categories) {
  if (!Array.isArray(data?.[key])) {
    fail(`${filePath}: missing category array "${key}"`);
    continue;
  }

  const seen = new Set();
  for (let i = 0; i < data[key].length; i++) {
    const item = data[key][i];
    const en = (item?.en || "").trim();
    const ja = (item?.ja || "").trim();

    if (!en) fail(`${filePath}: ${key}[${i}].en is missing`);
    if (!ja) fail(`${filePath}: ${key}[${i}].ja is missing`);

    const norm = en.toLowerCase();
    if (seen.has(norm)) {
      fail(`${filePath}: duplicate "${en}" in "${key}"`);
    }
    seen.add(norm);
  }
}

const counts = Object.fromEntries(categories.map((k) => [k, data?.[k]?.length ?? 0]));
const maxCards = Math.min(...categories.map((k) => counts[k]));

console.log(`OK: ${filePath}`);
console.log(`Counts: ${categories.map((k) => `${k}=${counts[k]}`).join(" ")}`);
console.log(`Max cards: ${maxCards}`);

if (process.exitCode) {
  console.log("Validation failed.");
  process.exit(1);
}
