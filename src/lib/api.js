const BASE = process.env.REACT_APP_URL_BACKEND;

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('auth_token'); 
  const headers = {
    Accept: 'application/json',
    ...(options.body && !(options.headers && options.headers['Content-Type'])
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  console.log('[apiFetch] URL:', `${BASE}${path}`);
  console.log('[apiFetch] Request headers:', headers);

  const resp = await fetch(`${BASE}${path}`, {
    ...options,
    headers
  });

  const ct = resp.headers.get('content-type') || '';
  const raw = await resp.text();
  let data = null;
  if (ct.includes('application/json') && raw) {
    try { data = JSON.parse(raw); } catch {}
  }
  if (!resp.ok) {
    console.error('[apiFetch] Response status:', resp.status, 'Body snippet:', raw.slice(0,150));
    throw new Error((data && (data.message || data.error)) || raw || `HTTP ${resp.status}`);
  }
  return data;
}