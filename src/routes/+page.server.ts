import * as api from '$lib/server/api' 

export const load: PageServerLoad = async () => {
    const satellites = await api.getSatellites();
    return satellites
}
