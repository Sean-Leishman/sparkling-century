import { SWOP_API_KEY } from "$env/static/private" 

export const ssr = false;

export const load: PageServerLoad = async () => {
    let satellites = []; 

    const satellites = await fetch('https://api.n2yo.com/rest/v1/satellite/tle/25544', {
        method:'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `ApiKey ${SWOP_API_KEY}`
        },
    });

    const item = await satellites.json()

    return {
        satellites: item
    }
}
