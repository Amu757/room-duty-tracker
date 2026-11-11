import { P, T, D } from '../constants';
import Chip from './Chip.jsx';

const [, S, C] = P;

export default function ChartTab({ chart, updateChart, DEF }) {
  const setCell = (i, j, v) => updateChart(chart.map((r, x) => r.map((c, y) => (x === i && y === j ? v : c))));
  const swap = () => updateChart(chart.map(r => r.map(x => (x === S ? C : x === C ? S : x))));
  const reset = () => window.confirm('Reset chart to default?') && updateChart(DEF());

  return (
    <>
      <div className="note">Change who does what with the dropdowns. Changes apply from now on; past records keep their original person.</div>
      <div className="sc">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              {T.map((t, j) => <th key={j}>{t[0].split(' ')[0]} {t[0].split(' ').slice(-1)}</th>)}
            </tr>
          </thead>
          <tbody>
            {D.map((d, i) => (
              <tr key={d}>
                <td><b>{d}</b></td>
                {T.map((_, j) => (
                  <td key={j}>
                    <select value={chart[i][j]} onChange={e => setCell(i, j, e.target.value)}>
                      {P.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g">
        <button className="b" onClick={swap}>🔁 Swap Shubham ↔ Chandan</button>
        <button className="b no" onClick={reset}>Reset default</button>
      </div>
      <div className="note">Tip: swap Shubham ↔ Chandan every Sunday night so weekends stay fair.</div>

      <h2>Weekly load (tasks per week)</h2>
      <div className="tot">
        {P.map(p => {
          let n = 0, c = 0;
          chart.forEach(r => r.forEach((x, j) => { if (x === p) { n++; if (j === 1 || j === 3) c++; } }));
          return (
            <div className="card" key={p}>
              <Chip name={p} /><div className="big">{n}</div><div className="mu">{c} cooking</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
