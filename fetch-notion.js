const fs = require('fs');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

async function fetchAllExams() {
  let results = [];
  let hasMore = true;
  let nextCursor = undefined;

  // Ciclo per scaricare tutti gli esami (anche se sono più di 100)
  while (hasMore) {
    const body = nextCursor ? { start_cursor: nextCursor } : {};
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Errore API Notion: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    results = results.concat(data.results);
    hasMore = data.has_more;
    nextCursor = data.next_cursor;
  }

  // Salva i risultati nel file dati.json
  fs.writeFileSync('dati.json', JSON.stringify({ results }, null, 2));
  console.log(`Sincronizzati ${results.length} esami con successo!`);
}

fetchAllExams().catch(err => {
  console.error(err);
  process.exit(1);
});
