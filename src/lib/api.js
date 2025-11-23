
function buildUrl(path) {
  return `${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('auth_token');

  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && !(options.body instanceof FormData);

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resp = await fetch(buildUrl(path), { ...options, headers });

  if (!resp.ok) {
    const errBody = await resp.text();
    let parsed;
    try {
      parsed = JSON.parse(errBody);
    } catch {
      parsed = errBody;
    }
    const err = new Error(parsed?.message || resp.statusText);
    err.status = resp.status;
    err.body = parsed;
    throw err;
  }

  const ct = resp.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return await resp.json();
  }
  return await resp.text();
}