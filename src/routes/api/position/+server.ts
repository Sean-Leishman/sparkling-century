import * as api from '$lib/server/api'

let data = {};

const fetchData = async (satellite: number) => {
    try {
        const satellites = await api.getFuturePositions(satellite);
        data = satellites;
    } catch (error) {
        console.error("Failed to get satellite data: ", error);
    }
}

export async function POST(satellites: [number]) {
    for (const satellite of satellites) {
        const id = satellite;
        data[id] = fetchData(satellite)
        break;
    }

    return Response.json(
        {
            'body': data
        }
    );
}
