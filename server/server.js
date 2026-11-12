require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Chart = require('./models/Chart');
const Log = require('./models/Log');

const [A, S, C] = ['Aman', 'Shubham', 'Chandan'];
const DEFAULT_GRID = [
  [A, S, C, A, S, C], [A, C, S, A, C, S], [A, S, C, A, S, C], [A, C, S, A, C, S],
  [A, S, C, A, S, C], [A, C, S, A, C, S], [C, S, A, C, A, S],
];

const app = express();
app.use(cors());
app.set('etag', false);
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api', async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (e) { conn = null; res.status(500).json({ error: 'DB connection failed: ' + e.message }); }
});
app.use(express.json({ limit: '5mb' }));

const wrap = fn => (req, res, next) => fn(req, res).catch(next);
const clean = d => ({ date: d.date, duty: d.duty, s: d.s, a: d.a, b: d.b, z: d.z });

// ---- Chart ----
app.get('/api/chart', wrap(async (req, res) => {
  const c = await Chart.findOneAndUpdate(
    { key: 'main' }, { $setOnInsert: { grid: DEFAULT_GRID } }, { upsert: true, new: true });
  res.json(c.grid);
}));

app.put('/api/chart', wrap(async (req, res) => {
  const g = req.body.grid;
  const ok = Array.isArray(g) && g.length === 7 && g.every(r => Array.isArray(r) && r.length === 6);
  if (!ok) return res.status(400).json({ error: 'grid must be 7 days x 6 duties' });
  const c = await Chart.findOneAndUpdate({ key: 'main' }, { grid: g }, { upsert: true, new: true });
  res.json(c.grid);
}));

// ---- Logs ----
app.get('/api/logs', wrap(async (req, res) => {
  res.json((await Log.find().lean()).map(clean));
}));

app.put('/api/logs', wrap(async (req, res) => {
  const { date, duty, s, a, b } = req.body;
  const doc = await Log.findOneAndUpdate(
    { date, duty }, { date, duty, s, a, b: b || '', z: false },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  res.json(clean(doc));
}));

app.patch('/api/logs/:date/:duty/settle', wrap(async (req, res) => {
  const doc = await Log.findOne({ date: req.params.date, duty: Number(req.params.duty) });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.z = typeof req.body.z === 'boolean' ? req.body.z : !doc.z;
  await doc.save();
  res.json(clean(doc));
}));

app.delete('/api/logs/:date/:duty', wrap(async (req, res) => {
  await Log.deleteOne({ date: req.params.date, duty: Number(req.params.duty) });
  res.json({ ok: true });
}));

app.delete('/api/logs', wrap(async (req, res) => {
  await Log.deleteMany({});
  res.json({ ok: true });
}));

// ---- Backup / Restore ----
app.get('/api/backup', wrap(async (req, res) => {
  const c = await Chart.findOne({ key: 'main' });
  const logs = (await Log.find().lean()).map(clean);
  res.json({ chart: c ? c.grid : DEFAULT_GRID, logs });
}));

app.post('/api/restore', wrap(async (req, res) => {
  const { chart, logs } = req.body;
  if (!Array.isArray(chart) || !Array.isArray(logs)) return res.status(400).json({ error: 'Invalid backup' });
  await Chart.findOneAndUpdate({ key: 'main' }, { grid: chart }, { upsert: true });
  await Log.deleteMany({});
  if (logs.length) await Log.insertMany(logs.map(clean));
  res.json({ ok: true });
}));

// ---- Serve built React app in production ----
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => (req.method === 'GET' && !req.path.startsWith('/api'))
    ? res.sendFile(path.join(dist, 'index.html')) : next());
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Reuse one DB connection across serverless calls
let conn;
const connectDB = () => (conn ||= mongoose.connect(
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/room-duty-tracker'));



// Only listen when run locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`)))
    .catch(e => { console.error('❌ MongoDB connection failed:', e.message); process.exit(1); });
}

module.exports = app;