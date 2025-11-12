export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error('Error decodificando JWT:', e);
    return null;
  }
}