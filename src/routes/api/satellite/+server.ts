import * as api from '$lib/server/api';
import * as satellite from 'satellite.js';
import * as fs from 'fs';

let data = {};
const TIMESTEP = 6000; // 6 seconds
const END_TIME = 60000 * 60; // 1 hour

type Vec4 = satellite.EcfVec3<number> & { time: number; satelliteName: string };

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
            await fetchData(id, value.satName, Date.now());
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

const fetchData = async (satelliteId: number, satelliteName: string, timestep: number) => {
    try {
        const satrec = await api.getSatelliteTLE(satelliteId);
        if (satrec === undefined) return;

        const startTime = Date.now();
        const endTime = startTime + END_TIME;
        const positions = [];

        for (let time = startTime; time < endTime; time += TIMESTEP) {
            const timeSinceTLE = (time - startTime) / 60000; // Convert to minutes
            const positionAndVelocity = satellite.sgp4(satrec as satellite.SatRec, timeSinceTLE);
            const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
            const gmst = satellite.gstime(startTime);
            const positionEcf = satellite.eciToEcf(positionEci, gmst) as Vec4;

            positionEcf.time = time;
            positionEcf.satelliteName = satrec.satelliteName;
            positions.push(positionEcf);
        }

        data[satelliteId] = positions;

    } catch (error) {
        console.error("Failed to get satellite %d at time %d with: %s", satelliteId, timestep, error);
    }
}

setInterval(fetchInitData, END_TIME);

export async function GET(request: Request) {
    if (Object.keys(data).length === 0) {
        await fetchInitData();
    }

    return Response.json(
        {
            'body': data
        }
    );
}

