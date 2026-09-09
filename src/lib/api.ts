const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');

export const apiUrl = (path: string) => (
  /^https?:\/\//.test(path) ? path : `${configuredApiBase || ''}${path}`
);
