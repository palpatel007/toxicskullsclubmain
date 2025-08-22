export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const buildApiUrl = (path: string): string => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	if (!API_BASE_URL) {
		return normalizedPath;
	}
	return `${API_BASE_URL}${normalizedPath}`;
};


