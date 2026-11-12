const express = require('express');
const fs = require('fs');
const pool = require('./db');

const app = express();
app.use(express.json());

// write to stdout AND a shared file (the sidecar tails this file)
const log = (msg) => {
  const line = `${new Date().toISOString()} ${msg}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync('/var/log/app/app.log', line); } catch (_) {}
};

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.get('/items', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
    log('GET /items -> ' + rows.length + ' rows');
    res.json(rows);
  } catch (e) { log('ERROR ' + e.message); res.status(500).json({ error: e.message }); }
});

app.post('/items', async (req, res) => {
  try {
    const { rows } = await pool.query('INSERT INTO items(name) VALUES($1) RETURNING *', [req.body.name]);
    log('POST /items -> ' + rows[0].name);
    res.status(201).json(rows[0]);
  } catch (e) { log('ERROR ' + e.message); res.status(500).json({ error: e.message }); }
});

app.listen(3000, () => log('backend listening on 3000'));
