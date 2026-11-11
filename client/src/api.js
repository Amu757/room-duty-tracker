async function req(method, url, body) {
  const r = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export const api = {
  getChart: () => req('GET', '/api/chart'),
  saveChart: grid => req('PUT', '/api/chart', { grid }),
  getLogs: () => req('GET', '/api/logs'),
  saveLog: log => req('PUT', '/api/logs', log),
  settle: (date, duty) => req('PATCH', `/api/logs/${date}/${duty}/settle`),
  deleteLog: (date, duty) => req('DELETE', `/api/logs/${date}/${duty}`),
  clearLogs: () => req('DELETE', '/api/logs'),
  backup: () => req('GET', '/api/backup'),
  restore: data => req('POST', '/api/restore', data),
};
