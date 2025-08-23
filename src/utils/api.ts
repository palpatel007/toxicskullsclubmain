export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.toxicskullsclub.io').replace(/\/$/, '');

export const buildApiUrl = (path: string): string => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE_URL}${normalizedPath}`;
};


