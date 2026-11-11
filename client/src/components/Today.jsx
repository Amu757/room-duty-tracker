import { useState } from 'react';
import { P, T, D, FINE, ds, di } from '../constants';
import Chip from './Chip.jsx';

const LABEL = (e) => ({
  done: '✅ Done',
  miss: `❌ Missed, no notice (₹${FINE})`,
  cover: `🤝 Absent (told), covered by ${e.b}`,
  skip: '⏭️ No duty today',
}[e.s]);

export default function Today({ chart, logs, mark, undo }) {
  const [cur, setCur] = useState(new Date());
  const date = ds(cur), i = di(cur);
  const shift = n => { const d = new Date(cur); d.setDate(d.getDate() + n); setCur(d); };

  return (
    <>
      <div className="date">
        <button className="b sm" onClick={() => shift(-1)}>◀</button>
        <input type="date" value={date} onChange={e => e.target.value && setCur(new Date(e.target.value + 'T12:00:00'))} />
        <button className="b sm" onClick={() => shift(1)}>▶</button>
      </div>
      <div className="note">{D[i]} · tap a result for each duty. Fine ₹{FINE} applies only if missed without telling.</div>

      {T.map((t, j) => {
        const e = logs[`${date}|${j}`];
        const a = chart[i][j];
        const others = P.filter(p => p !== a);
        return (
          <div className="card" key={j}>
            <div className="row">
              <div><b>{t[0]}</b><div className="mu">{t[1]}</div></div>
              <Chip name={e ? e.a : a} />
            </div>

            {e ? (
              <div className="row" style={{ marginTop: 8 }}>
                <span className={`st ${e.s}`}>{LABEL(e)}</span>
                <button className="b sm" onClick={() => undo(date, j)}>Undo</button>
              </div>
            ) : (
              <>
                <div className="g">
                  <button className="b ok" onClick={() => mark(date, j, 'done', a)}>✅ Done</button>
                  <button className="b no" onClick={() => mark(date, j, 'miss', a)}>❌ Missed</button>
                </div>
                <div className="mu" style={{ marginTop: 8 }}>Absent but told in advance? Who covered:</div>
                <div className="g">
                  {others.map(p => (
                    <button key={p} className="b wa" onClick={() => mark(date, j, 'cover', a, p)}>🤝 {p}</button>
                  ))}
                </div>
                <div style={{ marginTop: 6 }}>
                  <button className="b sm" onClick={() => mark(date, j, 'skip', a)}>No duty today (both away)</button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
