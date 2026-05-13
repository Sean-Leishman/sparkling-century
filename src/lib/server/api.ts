export interface TLE {
	name: string;
	line1: string;
	line2: string;
}

const GROUPS = ['last-30-days', 'geo', 'starlink'];
const BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP=';
const HEADERS = { 'User-Agent': 'satellite-visualiser/1.0' };

const ONE_HOUR_MS = 60 * 60 * 1000;

let cachedTLEs: TLE[] = [];
let lastFetchTime = 0;

const parseTLEText = (text: string): TLE[] => {
	const lines = text
		.split('\n')
		.map((l) => l.trimEnd())
		.filter((l) => l.length > 0);

	const tles: TLE[] = [];
	for (let i = 0; i + 2 < lines.length; i += 3) {
		tles.push({
			name: lines[i].trim(),
			line1: lines[i + 1],
			line2: lines[i + 2]
		});
	}
	return tles;
};

const fetchGroup = async (group: string): Promise<TLE[]> => {
	const response = await fetch(BASE_URL + group, { headers: HEADERS });
	if (!response.ok) throw new Error(`Celestrak fetch failed: ${response.status} (${group})`);
	return parseTLEText(await response.text());
};

const fetchTLEs = async (): Promise<TLE[]> => {
	const results = await Promise.allSettled(GROUPS.map(fetchGroup));
	const seen = new Set<string>();
	const tles: TLE[] = [];
	for (const result of results) {
		if (result.status === 'rejected') {
			console.error('Group fetch failed:', result.reason);
			continue;
		}
		for (const tle of result.value) {
			const id = tle.line1.slice(2, 7).trim();
			if (!seen.has(id)) {
				seen.add(id);
				tles.push(tle);
			}
		}
	}
	return tles;
};

export const getTLEs = async (): Promise<TLE[]> => {
	const now = Date.now();
	if (cachedTLEs.length === 0 || now - lastFetchTime > ONE_HOUR_MS) {
		try {
			cachedTLEs = await fetchTLEs();
			lastFetchTime = now;
		} catch (error) {
			console.error('Failed to fetch TLEs from Celestrak:', error);
			if (cachedTLEs.length === 0) throw error;
		}
	}
	return cachedTLEs;
};
