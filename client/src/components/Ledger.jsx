import { T, FINE, fmt } from '../constants';

export default function Ledger({ logs, settle }) {
  const entries = Object.entries(logs).sort((a, b) => b[0].localeCompare(a[0]));
  const cover = entries.filter(([, e]) => e.s === 'cover');
  const missed = entries.filter(([, e]) => e.s === 'miss');

  const name = k => {
    const [d, j] = k.split('|');
    const t = T[j][0].split(' ');
    return `${fmt(d)} · ${t[0]} ${t[1]}`;
  };
  const go = k => { const [d, j] = k.split('|'); settle(d, Number(j)); };

  const owe = {};
  cover.forEach(([, e]) => { if (!e.z) { const q = `${e.a} → ${e.b}`; owe[q] = (owe[q] || 0) + 1; } });
  const pending = Object.keys(owe);

  const total = missed.length * FINE;
  const paid = missed.filter(([, e]) => e.z).length * FINE;

  return (
    <>
      <h2>🤝 Covered duties (credits)</h2>
      <div className="note">Absentee pays ₹{FINE} to the person who covered, or does one of their turns within 7 days. Tick when settled.</div>

      {pending.length ? (
        <div className="card">
          <b>Pending</b>
          {pending.map(q => (
            <div className="row" key={q}>
              <span>{q}</span><span>{owe[q]} × ₹{FINE} = <b>₹{owe[q] * FINE}</b></span>
            </div>
          ))}
        </div>
      ) : <div className="card mu">Nothing pending 🎉</div>}

      {cover.map(([k, e]) => (
        <div className="card row" key={k}>
          <div>{name(k)}<div className="mu">{e.a} absent · {e.b} covered</div></div>
          <button className={`b sm ${e.z ? 'ok' : 'wa'}`} onClick={() => go(k)}>{e.z ? '✔ Settled' : 'Mark settled'}</button>
        </div>
      ))}

      <h2>💸 Fines (missed without telling)</h2>
      <div className="card row">
        <span>Total fines <b>₹{total}</b></span>
        <span className="mu">Paid ₹{paid} · Due ₹{total - paid}</span>
      </div>
      <div className="note">Fines go to the common kitty (gas, soap, Sunday treat).</div>

      {missed.map(([k, e]) => (
        <div className="card row" key={k}>
          <div>{name(k)}<div className="mu">{e.a} · ₹{FINE}</div></div>
          <button className={`b sm ${e.z ? 'ok' : 'no'}`} onClick={() => go(k)}>{e.z ? '✔ Paid' : 'Mark paid'}</button>
        </div>
      ))}
      {!missed.length && <div className="card mu">No fines yet 🎉</div>}
    </>
  );
}
