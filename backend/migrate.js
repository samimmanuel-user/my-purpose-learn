const pool = require('./db');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // wait for the DB to be ready
  for (let i = 1; i <= 30; i++) {
    try { await pool.query('SELECT 1'); break; }
    catch (e) { console.log(`DB not ready (${i}/30): ${e.message}`); await sleep(2000); }
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name TEXT NOT NULL)`);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM items');
  if (rows[0].c === 0) await pool.query(`INSERT INTO items(name) VALUES ('first-item'), ('second-item')`);
  console.log('migration complete');
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
