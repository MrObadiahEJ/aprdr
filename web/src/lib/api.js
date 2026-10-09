export async function api(path, opts = {}) {
  const init = { ...opts };
  if (opts.body !== undefined) {
    init.headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    init.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
  return data;
}

export const go = (hash) => {
  window.location.hash = hash;
};
