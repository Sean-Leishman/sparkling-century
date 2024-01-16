import { SWOP_API_KEY } from "$env/static/private"

export const getSatellites = async () => {
    const lat = 41.702;
    const lng = -76.014;
    const alt = 0;
    const radius = 90;
    const category_id = 0;

    try {
        const response = await fetch(`https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lng}/${alt}/${radius}/${category_id}&apiKey=${SWOP_API_KEY}`, {
            method: 'GET',
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


export const getFuturePositions = async (id: number) => {
    const lat = 41.702;
    const lng = -76.014;
    const alt = 0;
    const radius = 90;
    const category_id = 0;

    try {
        const response = await fetch(`https://api.n2yo.com/rest/v1/satellite/positions/${id}/${lat}/${lng}/${alt}/10&apiKey=${SWOP_API_KEY}`, {
            method: 'GET',
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
