import { SWOP_API_KEY } from "$env/static/private"
import satellite, { type SatRec } from 'satellite.js';

export const getInitSatellites = async () => {
    const lat = 41.702;
    const lng = -76.014;
    const alt = 0;
    const radius = 90;
    // 0 for all, 50 for GPS, 52 for Starlink
    const category_id = 52;

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
        console.log(response);

        const satellites = await response.json();
        return satellites
    } catch (error) {
        console.error('Failed to fetch satellite positions: ', error);
    }

    return {};
}

export const getSatelliteTLE = async (id: number): Promise<SatRec | null> => {
    try {
        const response = await fetch(`https://api.n2yo.com/rest/v1/satellite/tle/${id}&apiKey=${SWOP_API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const satellites = await response.json();
        const tles = satellites.tle.split("\n");

        const tle1 = tles[0];
        const tle2 = tles[1];

        const satrec = satellite.twoline2satrec(tle1, tle2);

        return satrec
    } catch (error) {
        console.error('Failed to fetch satellite data at id %d with: %s', id, error);
        return null;
    }
}
