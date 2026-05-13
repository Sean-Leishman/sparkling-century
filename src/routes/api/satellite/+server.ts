import * as api from '$lib/server/api';

let tleCache: Awaited<ReturnType<typeof api.getTLEs>> = [];

const fetchData = async () => {
	try {
		tleCache = await api.getTLEs();
	} catch (error) {
		console.error('Failed to get TLE data: ', error);
	}
};

setInterval(fetchData, 60 * 60 * 1000);

export async function GET() {
	if (tleCache.length === 0) {
		await fetchData();
	}
	return Response.json({ tles: tleCache });
}
