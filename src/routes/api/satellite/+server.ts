import * as api from '$lib/server/api';
import * as satellite from 'satellite.js';
import * as fs from 'fs';

let data = {};
const TIMESTEP = 1000 * 1000;

const fetchInitData = async () => {
    try {
        const satellites = await api.getInitSatellites();

        if (satellites.above === undefined || satellites.error !== undefined) {
            console.error("No satellites returned");
            // Load file from disk if it exists
            fs.readFileSync('satellites.json', (err, file) => {
                if (err) {
                    console.error("Failed to load file: ", err);
                    return;
                }
                data = JSON.parse(file);
            });
        }

        for (const [key, value] of Object.entries(satellites.above)) {
            const id = value.satid;
            data[id] = fetchData(id, Date.now());
            break;
        }

        // Save file
        fs.writeFile('satellites.json', JSON.stringify(data), (err) => {
            console.log("saving file: ", err);
        });

    } catch (error) {
        console.error("Failed to get satellite data: ", error);
    }
}

const fetchData = async (satelliteId: number, timestep: number) => {
    try {
        const satrec = await api.getSatelliteTLE(satelliteId);
        if (satrec === undefined) return;

        const endTime = Date.now() + TIMESTEP;
        const positions = [];

        for (let time = Date.now(); time < endTime; time += TIMESTEP / 100) {
            const timeSinceTLE = (Date.now() - timestep) / 1000;
            const positionAndVelocity = satellite.sgp4(satrec as satellite.SatRec, timeSinceTLE);
            const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
            const gmst = satellite.gstime(Date.now());
            const positionEcf = satellite.eciToEcf(positionEci, gmst);
            positions.push(positionEcf);
        }
        data[satelliteId] = positions;

    } catch (error) {
        console.error("Failed to get satellite %d at time %d with: %s", satelliteId, timestep, error);
    }
}

if (Object.keys(data).length === 0) {
    fetchInitData();
}
setInterval(fetchInitData, TIMESTEP);

export async function GET(request: Request) {
    return Response.json(
        {
            'body': data
        }
    );
}
