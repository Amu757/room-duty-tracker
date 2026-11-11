import { useRef, useState } from 'react';
import { P, T, D, FINE, ds, di, fmt } from '../constants';
import { api } from '../api';
import Chip from './Chip.jsx';

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}

export default function Review({ logs, clearLogs, restore }) {
  const [wk, setWk] = useState(0);
  const file = useRef();

  const m = new Date(); m.setDate(m.getDate() - di(m) + wk * 7);
  const days = [...Array(7)].map((_, i) => { const x = new Date(m); x.setDate(m.getDate() + i); return ds(x); });
  const en = Object.entries(logs).filter(([k]) => days.includes(k.split('|')[0])).map(([, e]) => e);

  const perfect = [];
  const rows = P.map(p => {
    const dn = en.filter(e => e.s === 'done' && e.a === p).length;
    const mi = en.filter(e => e.s === 'miss' && e.a === p).length;
    const ab = en.filter(e => e.s === 'cover' && e.a === p).length;
    const co = en.filter(e => e.s === 'cover' && e.b === p).length;
    const sc = dn + mi ? Math.round(dn / (dn + mi) * 100) : null;
    if (sc === 100) perfect.push(p);
    return { p, dn, mi, ab, co, sc };
  });

  const backup = async () => {
    const data = await api.backup();
    download(`duty-backup-${ds(new Date())}.json`, JSON.stringify(data), 'application/json');
  };
  const onFile = f => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!Array.isArray(d.chart) || !Array.isArray(d.logs)) throw 0;
        if (window.confirm('Replace current records with this backup?')) restore(d);
      } catch { alert('This is not a valid backup file.'); }
    };
    r.readAsText(f);
    file.current.value = '';
  };
  const csv = () => {
    const out = [['Date', 'Day', 'Duty', 'Assigned', 'Result', 'Covered by', 'Fine', 'Settled/Paid']];
    Object.values(logs).sort((a, b) => a.date.localeCompare(b.date) || a.duty - b.duty).forEach(e => {
      out.push([
        e.date, D[di(new Date(e.date + 'T12:00:00'))], T[e.duty][0].replace(/[^\x00-\x7F]/g, '').trim(), e.a,
        { done: 'Done', miss: 'Missed (no notice)', cover: 'Absent-told, covered', skip: 'No duty' }[e.s],
        e.b, e.s === 'miss' ? FINE : 0, e.z ? 'Yes' : (e.s === 'miss' || e.s === 'cover' ? 'No' : ''),
      ]);
    });
    download('duty-records.csv', out.map(r => r.join(',')).join('\n'), 'text/csv');
  };

  return (
    <>
      <div className="date">
        <button className="b sm" onClick={() => setWk(w => w - 1)}>◀</button>
        <b>Week {fmt(days[0])} – {fmt(days[6])}</b>
        <button className="b sm" onClick={() => setWk(w => Math.min(0, w + 1))}>▶</button>
      </div>

      <div className="sc" style={{ marginTop: 8 }}>
        <table>
          <thead>
            <tr><th>Name</th><th>Done</th><th>Missed</th><th>Absent</th><th>Covered</th><th>Fine ₹</th><th>Score</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.p}>
                <td><Chip name={r.p} /></td><td>{r.dn}</td><td>{r.mi}</td><td>{r.ab}</td><td>{r.co}</td>
                <td><b>{r.mi * FINE}</b></td>
                <td><b style={{ color: `var(${r.sc !== null && r.sc < 80 ? '--no' : '--ok'})` }}>{r.sc === null ? '–' : r.sc + '%'}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note">Score = Done ÷ (Done + Missed). Duties covered during a told absence don’t count against anyone. Below 80% two weeks in a row → discuss and change the chart.</div>

      <div className="card">
        🎁 {perfect.length
          ? <>Zero misses: <b>{perfect.join(', ')}</b> — Sunday treat from the kitty!</>
          : 'No perfect week yet. Zero misses earns the Sunday treat.'}
      </div>

      <h2>Sunday review questions</h2>
      <div className="card mu">
        Who missed most, and is the timing unfair?<br />
        Does anyone need a swap or a lighter day?<br />
        Are all credits settled? Kitty balance okay?
      </div>

      <h2>💾 Backup &amp; export</h2>
      <div className="g">
        <button className="b ok" onClick={backup}>⬇ Backup file</button>
        <button className="b" onClick={() => file.current.click()}>⬆ Restore backup</button>
        <button className="b" onClick={csv}>📊 Export CSV (Excel)</button>
        <button className="b no" onClick={() => window.confirm('Delete ALL records?') && clearLogs()}>Clear all</button>
      </div>
      <input ref={file} type="file" accept=".json" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
      <div className="note">Your data is saved in MongoDB. A backup file is still handy once a week.</div>
    </>
  );
}
