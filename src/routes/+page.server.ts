import type { PageServerLoad } from './$types';
import * as api from '$lib/server/api';

export const load: PageServerLoad = async () => {
	const tles = await api.getTLEs();
	return { tles };
};
