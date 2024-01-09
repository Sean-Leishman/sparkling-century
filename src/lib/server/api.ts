import { SWOP_API_KEY } from "$env/static/private" 

export const getSatellites = async () => {
    let lat = 41.702;
    let lng = -76.014;
    let alt = 0;
    let radius = 90;
    let category_id = 0;

    try {
        const response = await fetch(`https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lng}/${alt}/${radius}/${category_id}&apiKey=${SWOP_API_KEY}`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const satellites = await response.json();
        return satellites
    } catch (error) {
        console.error('Failed to fetch satellite data: ', error);
    }

    return {};

}
