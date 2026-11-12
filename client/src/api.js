async function req(method, url, body) {
  const r = await fetch(url, {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

// Writes run one after another, in the order the user tapped
let chain = Promise.resolve();
function queued(fn) {
  const p = chain.then(fn);
  chain = p.catch(() => {});
  return p;
}

export const api = {
  getChart: () => req('GET', '/api/chart'),
  getLogs: () => req('GET', '/api/logs'),
  backup: () => req('GET', '/api/backup'),
  saveChart: grid => queued(() => req('PUT', '/api/chart', { grid })),
  saveLog: log => queued(() => req('PUT', '/api/logs', log)),
  settle: (date, duty, z) => queued(() => req('PATCH', `/api/logs/${date}/${duty}/settle`, { z })),
  deleteLog: (date, duty) => queued(() => req('DELETE', `/api/logs/${date}/${duty}`)),
  clearLogs: () => queued(() => req('DELETE', '/api/logs')),
  restore: data => queued(() => req('POST', '/api/restore', data)),
};