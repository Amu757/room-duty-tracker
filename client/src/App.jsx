import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { P } from './constants';
import Today from './components/Today.jsx';
import ChartTab from './components/ChartTab.jsx';
import Ledger from './components/Ledger.jsx';
import Review from './components/Review.jsx';

const TABS = [['today', 'Today'], ['chart', 'Chart'], ['ledger', 'Ledger'], ['review', 'Review']];
const [A, S, C] = P;
const DEF = () => [
  [A, S, C, A, S, C], [A, C, S, A, C, S], [A, S, C, A, S, C], [A, C, S, A, C, S],
  [A, S, C, A, S, C], [A, C, S, A, C, S], [C, S, A, C, A, S],
];

export default function App() {
  const [tab, setTab] = useState('today');
  const [chart, setChart] = useState(null);
  const [logs, setLogs] = useState({}); // key "date|duty" -> {s,a,b,z}
  const [err, setErr] = useState('');
  const pending = useRef(0);   // saves still in progress
  const version = useRef(0);   // bumps on every local change

  const toMap = list => Object.fromEntries(list.map(l => [`${l.date}|${l.duty}`, l]));

  // force=true always applies the server data; otherwise a refresh is skipped
  // if you changed something while it was loading (so it can't overwrite your tap)
  const load = async (force = false) => {
    const v = version.current;
    try {
      const [c, l] = await Promise.all([api.getChart(), api.getLogs()]);
      if (!force && (pending.current > 0 || v !== version.current)) return;
      setChart(c); setLogs(toMap(l)); setErr('');
    } catch (e) { setErr('Cannot reach the server. Is it running? (' + e.message + ')'); }
  };

  useEffect(() => {
    load(true);
    const tick = () => { if (!document.hidden) load(); };
    const t = setInterval(tick, 5000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, []);

  const run = async fn => {
    pending.current++; version.current++;
    let failed = false;
    try { await fn(); setErr(''); } catch (e) { failed = true; setErr(e.message); }
    finally { pending.current--; version.current++; }
    if (failed) load(true);
  };

  const mark = (date, duty, s, a, b = '') => {
    const rec = { date, duty, s, a, b, z: false };
    setLogs(m => ({ ...m, [`${date}|${duty}`]: rec }));
    run(() => api.saveLog(rec));
  };
  const undo = (date, duty) => {
    setLogs(m => { const n = { ...m }; delete n[`${date}|${duty}`]; return n; });
    run(() => api.deleteLog(date, duty));
  };
  const settle = (date, duty) => {
    const k = `${date}|${duty}`;
    const z = !logs[k].z;
    setLogs(m => ({ ...m, [k]: { ...m[k], z } }));
    run(() => api.settle(date, duty, z));
  };
  const updateChart = grid => { setChart(grid); run(() => api.saveChart(grid)); };
  const clearLogs = () => { setLogs({}); run(() => api.clearLogs()); };
  const restore = async data => { await run(() => api.restore(data)); await load(true); };

  if (!chart) return <div className="wrap"><h1>🏠 Room Duty Tracker</h1><div className="note">{err || 'Loading…'}</div></div>;

  const props = { chart, logs, mark, undo, settle, updateChart, clearLogs, restore, DEF };
  const View = { today: Today, chart: ChartTab, ledger: Ledger, review: Review }[tab];

  return (
    <div className="wrap">
      <h1>🏠 Room Duty Tracker</h1>
      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {err && <div className="err">{err}</div>}
      <View {...props} />
    </div>
  );
}